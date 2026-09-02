import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'recipe-ui',
  globalStyle: 'src/global/global.css',
  globalScript: 'src/global/global.ts',
  srcDir: 'src',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
      dir: 'docs',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
  extras: {
    enableImportInjection: true,
  },
};
