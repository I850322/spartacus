import { OccConfig } from '@spartacus/core';

export const defaultOccAsmConfig: OccConfig = {
  backend: {
    occ: {
      endpoints: {
        asmCustomerSearch: '/assistedservicewebservices/customers/search',
        asmBindCart: '/assistedservicewebservices/bind-cart',
        asmCustomerLists: '/assistedservicewebservices/customerlists',
      },
    },
  },
};
