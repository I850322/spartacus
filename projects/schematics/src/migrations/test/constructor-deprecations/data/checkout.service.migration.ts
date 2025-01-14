import {
  ACTIVE_CART_SERVICE,
  AUTH_SERVICE,
  CART_DATA_SERVICE,
  CHECKOUT_SERVICE,
  NGRX_STORE,
  STORE,
} from '../../../../shared/constants';
import { SPARTACUS_CORE } from '../../../../shared/libs-constants';
import { ConstructorDeprecation } from '../../../../shared/utils/file-utils';

export const CHECKOUT_SERVICE_MIGRATION: ConstructorDeprecation = {
  // projects/core/src/checkout/facade/checkout.service.ts
  class: CHECKOUT_SERVICE,
  importPath: SPARTACUS_CORE,
  deprecatedParams: [
    {
      className: STORE,
      importPath: NGRX_STORE,
    },
    {
      className: CART_DATA_SERVICE,
      importPath: SPARTACUS_CORE,
    },
  ],
  removeParams: [
    {
      className: CART_DATA_SERVICE,
      importPath: SPARTACUS_CORE,
    },
  ],
  addParams: [
    {
      className: AUTH_SERVICE,
      importPath: SPARTACUS_CORE,
    },
    {
      className: ACTIVE_CART_SERVICE,
      importPath: SPARTACUS_CORE,
    },
  ],
};
