import {
  CDC_FEATURE_NAME,
  SPARTACUS_CDC,
  SPARTACUS_CDC_ROOT,
  USER_PROFILE_FEATURE_NAME,
} from '../../libs-constants';
import { AdditionalFeatureConfiguration } from '../../utils/feature-utils';
import { LibraryOptions, SchematicConfig } from '../../utils/lib-utils';

export interface SpartacusCdcOptions extends LibraryOptions {
  baseSite?: string;
  javascriptUrl?: string;
  sessionExpiration?: number;
}

export const CDC_FOLDER_NAME = 'cdc';
export const CDC_MODULE_NAME = 'Cdc';

export const CDC_MODULE = 'CdcModule';
export const CDC_ROOT_MODULE = 'CdcRootModule';
export const CDC_FEATURE_CONSTANT = 'CDC_FEATURE';
export const CDC_CONFIG = 'CdcConfig';

export const CDC_SCHEMATICS_CONFIG: SchematicConfig = {
  library: {
    featureName: CDC_FEATURE_NAME,
    mainScope: SPARTACUS_CDC,
  },
  folderName: CDC_FOLDER_NAME,
  moduleName: CDC_MODULE_NAME,
  featureModule: {
    importPath: SPARTACUS_CDC,
    name: CDC_MODULE,
  },
  lazyLoadingChunk: {
    moduleSpecifier: SPARTACUS_CDC_ROOT,
    namedImports: [CDC_FEATURE_CONSTANT],
  },
  rootModule: {
    importPath: SPARTACUS_CDC_ROOT,
    name: CDC_ROOT_MODULE,
    content: `${CDC_ROOT_MODULE}`,
  },
  customConfig: buildCdcConfig,
  dependencyFeatures: [USER_PROFILE_FEATURE_NAME],
};

function buildCdcConfig(
  options: SpartacusCdcOptions
): AdditionalFeatureConfiguration<SpartacusCdcOptions> {
  return {
    providers: {
      import: [
        {
          moduleSpecifier: SPARTACUS_CDC_ROOT,
          namedImports: [CDC_CONFIG],
        },
      ],
      content: `<${CDC_CONFIG}>{
        cdc: [
          {
            baseSite: '${options.baseSite || 'BASE_SITE_PLACEHOLDER'}',
            javascriptUrl: '${
              options.javascriptUrl || 'JS_SDK_URL_PLACEHOLDER'
            }',
            sessionExpiration: ${options.sessionExpiration || 3600}
          },
        ],
      }`,
    },
  };
}
