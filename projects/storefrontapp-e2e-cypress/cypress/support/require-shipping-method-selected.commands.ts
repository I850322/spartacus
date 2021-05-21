import { getDefaultDeliveryModeCode } from './utils/delivery-modes';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Selects a default shipping method for a cart of the current user.
       * Returns shipping method object.
       *
       * @memberof Cypress.Chainable
       *
       * @example
        ```
        cy.requireShippingMethodSelected(token, cartId);
        ```
       */
      requireShippingMethodSelected: (
        auth: {},
        cartId?: string
      ) => Cypress.Chainable<{}>;
    }
  }
}

Cypress.Commands.add('requireShippingMethodSelected', (token, cartId) => {
  const cartQueryValue = cartId || 'current';

  function setShippingMethod(deliveryMode) {
    return cy.request({
      method: 'PUT',
      url: `${Cypress.env('API_URL')}${Cypress.env('OCC_PREFIX')}/${Cypress.env(
        'BASE_SITE'
      )}/users/current/carts/${cartQueryValue}/deliverymode?deliveryModeId=${deliveryMode}`,
      form: false,
      headers: {
        Authorization: `bearer ${token.access_token}`,
      },
    });
  }

  cy.server();
  getDefaultDeliveryModeCode(token.access_token, cartId).then((code) =>
    setShippingMethod(code).then((resp) => cy.wrap(resp))
  );
});
