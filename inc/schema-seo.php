<?php
add_filter( 'acf/validate_value/name=schema_jsonld', function ( $valid, $value ) {
  if ( true !== $valid || '' === trim( (string) $value ) ) {
    return $valid;
  }
  json_decode( $value );
  return JSON_ERROR_NONE === json_last_error()
    ? true
    : 'Invalid JSON-LD: ' . json_last_error_msg();
}, 10, 2 );

/**
 * Detecta array associativo (objeto JSON) vs lista (array JSON).
 */
function ms_is_assoc( array $arr ) {
    if ( [] === $arr ) {
        return false;
    }
    return array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
}

/**
 * Merge recursivo. $over tem prioridade. null em $over remove a chave.
 */
function ms_deep_merge( array $base, array $over ) {
    foreach ( $over as $key => $value ) {
        if ( null === $value ) {
            unset( $base[ $key ] );
            continue;
        }

        $can_recurse = is_array( $value )
            && isset( $base[ $key ] )
            && is_array( $base[ $key ] )
            && ms_is_assoc( $value )
            && ms_is_assoc( $base[ $key ] );

        $base[ $key ] = $can_recurse
            ? ms_deep_merge( $base[ $key ], $value )
            : $value;
    }
    return $base;
}

/**
 * Normaliza @type para array (Yoast usa string ou array).
 */
function ms_types( $node ) {
    if ( ! is_array( $node ) || ! isset( $node['@type'] ) ) {
        return [];
    }
    return array_map( 'strval', (array) $node['@type'] );
}

/**
 * Localiza o índice do nó no grafo que corresponde ao patch.
 * Retorna null se não achar.
 */
function ms_find_node( array $graph, array $patch ) {
    // 1) @id exato
    if ( ! empty( $patch['@id'] ) ) {
        foreach ( $graph as $i => $node ) {
            if ( isset( $node['@id'] ) && $node['@id'] === $patch['@id'] ) {
                return $i;
            }
        }
    }

    // 2) interseção de @type
    $wanted = ms_types( $patch );
    if ( $wanted ) {
        foreach ( $graph as $i => $node ) {
            if ( array_intersect( $wanted, ms_types( $node ) ) ) {
                return $i;
            }
        }
    }

    return null;
}

add_filter( 'wpseo_schema_graph', function ( $graph, $context ) {
    if ( ! is_singular() || ! is_array( $graph ) || ! function_exists( 'get_field' ) ) {
        return $graph;
    }

    $raw = get_field( 'schema_jsonld', get_queried_object_id() );
    if ( empty( $raw ) ) {
        return $graph;
    }

    $data = json_decode( (string) $raw, true );
    if ( JSON_ERROR_NONE !== json_last_error() || ! is_array( $data ) ) {
        return $graph;
    }

    // Aceita objeto único, array de objetos, ou {"@graph":[...]}
    if ( isset( $data['@graph'] ) && is_array( $data['@graph'] ) ) {
        $patches = $data['@graph'];
    } elseif ( ms_is_assoc( $data ) ) {
        $patches = [ $data ];
    } else {
        $patches = $data;
    }

    foreach ( $patches as $patch ) {
        if ( ! is_array( $patch ) || ! ms_is_assoc( $patch ) ) {
            continue;
        }

        unset( $patch['@context'] ); // vem do grafo raiz

        // Escape hatch: "@merge": false força nó novo
        $force_new = isset( $patch['@merge'] ) && false === $patch['@merge'];
        unset( $patch['@merge'] );

        $index = $force_new ? null : ms_find_node( $graph, $patch );

        if ( null === $index ) {
            if ( empty( $patch['@type'] ) ) {
                continue; // patch sem tipo e sem alvo: descarta
            }
            if ( empty( $patch['isPartOf'] ) ) {
                $patch['isPartOf'] = [ '@id' => $context->canonical . '#webpage' ];
            }
            $graph[] = $patch;
            continue;
        }

        $original_id = $graph[ $index ]['@id'] ?? null;
        $graph[ $index ] = ms_deep_merge( $graph[ $index ], $patch );

        if ( $original_id ) {
            $graph[ $index ]['@id'] = $original_id; // preserva o link do grafo
        }
    }

    return $graph;
}, 50, 2 );
