// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Adds the style guide at /styleguide in `astro dev` only, so it never
 * reaches the production build.
 * @returns {import('astro').AstroIntegration}
 */
function devStyleguide() {
  return {
    name: 'dev-styleguide',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command === 'dev') {
          injectRoute({ pattern: '/styleguide', entrypoint: './src/dev/styleguide.astro' });
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // Keeps the dev overlay out of style-guide screenshots; dev only.
  devToolbar: { enabled: false },
  build: {
    // One external stylesheet keeps the Stage 5 CSP to style-src 'self'.
    inlineStylesheets: 'never',
  },
  // Keep straight apostrophes and quotes, as in the JSON copy and 02.
  markdown: { smartypants: false },
  integrations: [devStyleguide()],
});
