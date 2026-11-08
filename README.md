# WP Vite Starter

Starter maintained by Mateus Ávila.

A minimal classic WordPress theme with Vite. WordPress renders PHP templates, while Vite handles TypeScript, Tailwind CSS v4, hot updates, and production assets. The theme has no plugin dependencies.

## Requirements

- An existing WordPress 6.5+ installation running PHP 7.4+.
- Node.js 22.12+ (or a newer LTS release) and npm to develop and build assets.

## Install

Clone this repository into your WordPress themes directory as `wp-vite-starter`, then activate **WP Vite Starter** under **Appearance → Themes**.

- Standard WordPress: `wp-content/themes/wp-vite-starter/`
- Bedrock: `web/app/themes/wp-vite-starter/`

From the theme directory, run:

```sh
npm ci
npm run build
```

Open your WordPress site to see the theme. The build generates `dist/`, including the manifest WordPress reads to enqueue the versioned JavaScript and CSS.

## Local development

1. Copy `.env.example` to `.env.local` and set `WP_ORIGIN` to the origin of your local WordPress site, such as `http://localhost:8000`.
2. In your local WordPress configuration, set the environment to `local` and enable the Vite dev server. In standard WordPress, these settings go in `wp-config.php` before WordPress boots. If your setup already defines the environment type, update that setting instead of defining it twice.

   ```php
   define('WP_ENVIRONMENT_TYPE', 'local');
   define('WP_VITE_DEV_SERVER', true);
   ```

3. Run `npm run dev` from the theme directory and open **your WordPress URL** in the browser. Vite listens on `http://127.0.0.1:5173`. The default setup assumes a local HTTP site and Vite running on the same machine as your browser.

Edit `assets/tailwind.css`, `src/style.css` or `src/index.ts` for frontend changes. Editing a PHP template triggers a full page reload. To use the compiled assets locally, disable `WP_VITE_DEV_SERVER` and run `npm run build`.

## Tailwind and assets

`assets/tailwind.css` is the Tailwind v4 configuration and is imported by `src/style.css`. It scans the root PHP templates, `blocks/`, and `src/`. Tailwind Preflight is omitted so the example blocks use browser defaults. Add your own fonts under `assets/fonts/` and reference them from `src/style.css`. The `public/` directory is available for static files that Vite should copy as-is.

The inherited CSS under `src/base/`, `src/pages/`, `src/utilities/` and `src/vendors/` is available for selective import. Import `src/base/tailwind.css` as well if an inherited stylesheet uses its theme tokens.

## Template parts

Load a block with `get_template_part('blocks/hero', null, ['title' => 'Welcome'])`. The main template uses the search form and pagination. Add the other blocks where needed.

| Block | Arguments |
| --- | --- |
| `gallery` | `ids` array of media attachment IDs |
| `pagination` | Optional arguments for `the_posts_pagination()` |
| `modal` | `trigger`, `title`, `text` |
| `newsletter` | Optional `title`; renders `form-newsletter` |
| `hero` | `title`, `text`, optional heading `tag` |
| `faq` | `question`, `answer` |
| `faq-list` | `items` array of FAQ arguments |
| `searchform` | No arguments |
| `form-newsletter` | No arguments |
| `breadcrumb` | `items` array of entries with `t` and an optional `href`; omit `href` on the current page |

The newsletter form posts to the WordPress REST route `wp-vite-starter/v1/save-newsletter`. Signups are saved as private entries under **Newsletter signups** in the WordPress admin. The starter does not send confirmation emails. Add spam protection before using the public form on a live site.

`functions.php` loads the helpers in `inc/`. The SEO helper applies when Yoast and ACF are present. The Partytown proxy is opt-in via `WP_VITE_ENABLE_PARTYTOWN_PROXY`. The Gutenberg loader is available for future native blocks registered via `block.json`.

## Deploy

Run `npm ci && npm run build` in your build environment. Deploy the theme's PHP files, root `style.css`, and the entire `dist/` directory, including the hidden `dist/.vite/manifest.json`. Node.js and `node_modules/` are only needed to build. A GitHub source download needs a build before deployment.

## License

New starter code is GPL-2.0-or-later. See [LICENSE](LICENSE).

The source theme listed “Creative Commons 3.0” without specifying a variant. Code carried over from that theme, including portions of `src/` and `inc/`, retains its original terms. Confirm the exact license and redistribution rights for that code before publishing.
