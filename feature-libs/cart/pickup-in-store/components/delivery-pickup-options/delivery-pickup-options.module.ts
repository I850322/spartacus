import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { I18nModule, provideConfig } from '@spartacus/core';
import {
  CartOutlets,
  OutletPosition,
  provideOutlet,
  IconModule,
} from '@spartacus/storefront';
import { DeliveryPickupOptionsComponent } from './delivery-pickup-options.component';
import { DeliveryPickupOptionsDialogComponent } from './delivery-pickup-options-dialog/delivery-pickup-options-dialog.component';
import { defaultDeliveryPickupOptionsLayoutConfig } from './delivery-pickup-options.config';
@NgModule({
  imports: [CommonModule, IconModule, I18nModule, RouterModule],
  exports: [
    DeliveryPickupOptionsComponent,
    DeliveryPickupOptionsDialogComponent,
  ],
  declarations: [
    DeliveryPickupOptionsComponent,
    DeliveryPickupOptionsDialogComponent,
  ],
  entryComponents: [DeliveryPickupOptionsComponent],

  providers: [
    provideOutlet({
      id: CartOutlets.ITEM_BUNDLE_DETAILS,
      position: OutletPosition.AFTER,
      component: DeliveryPickupOptionsComponent,
    }),
    provideConfig(defaultDeliveryPickupOptionsLayoutConfig),
  ],
})
export class DeliveryPickupOptionsModule {}
