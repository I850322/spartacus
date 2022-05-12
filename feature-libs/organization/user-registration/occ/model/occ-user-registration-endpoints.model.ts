import { OccEndpoint } from '@spartacus/core';

declare module '@spartacus/core' {
  interface OccEndpoints {
    /**
     * Endpoint for organization user registration
     *
     * @member {string}
     */
    organizationUserRegistration?: string | OccEndpoint;
  }
}
