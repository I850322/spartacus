import { NgModule } from '@angular/core';
import { CheckoutB2BComponentsModule } from '@spartacus/checkout/b2b/components';
import { CheckoutB2BCoreModule } from '@spartacus/checkout/b2b/core';
import { CheckoutB2BOccModule } from '@spartacus/checkout/b2b/occ';

@NgModule({
  imports: [
    CheckoutB2BComponentsModule,
    CheckoutB2BCoreModule,
    CheckoutB2BOccModule,
  ],
})
export class CheckoutB2BModule {}
