```ts
import type { StorybookConfig } from '@storybook/react-vite';

/*
 * Source: Wiki DevOps-3043 minimatch / Sanity v5 / Storybook evidence documentation.
 *
 * Storybook previously used getAbsolutePath(...) to force workspace-local
 * package resolution in the monorepo. That workaround masked a mismatch
 * between where Storybook was executed from and where its dependencies were
 * installed.
 *
 * During the minimatch fix, dependency cleanup and Storybook alignment exposed
 * that mismatch. The preferred fix was to make Storybook dependencies
 * root-resolvable and exact-pinned, then use standard package-name resolution.
 *
 * This avoids coupling the config to physical node_modules paths and removes
 * the need for the getAbsolutePath workaround.
 *
 * Previously:
 * addons: [getAbsolutePath('@chromatic-com/storybook'), getAbsolutePath('@storybook/addon-docs')],
 * framework: {
 *      name: getAbsolutePath('@storybook/react-vite'),
 *      options: {},
 * },
 */
const config: StorybookConfig = {
  stories: ['../../../packages/design-system/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: ['@chromatic-com/storybook', '@storybook/addon-docs'],

  core: {
    disableTelemetry: true,
  },

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  typescript: {
    reactDocgen: 'react-docgen',
  },
};

export default config;
```