import { NgModule } from '@angular/core';
import { OrderDetailsOrderEntriesContextToken } from '@spartacus/order/root';
import {
  OrderCancellationModule,
  OrderReturnModule,
} from './amend-order/index';
import { OrderConfirmationModule } from './order-confirmation/order-confirmation.module';
import { OrderDetailsModule } from './order-details/order-details.module';
import { OrderHistoryModule } from './order-history/order-history.module';
import { OrderDetailsOrderEntriesContext } from './page-context/order-details-order-entries.context';
import { ReplenishmentOrderDetailsModule } from './replenishment-order-details/replenishment-order-details.module';
import { ReplenishmentOrderHistoryModule } from './replenishment-order-history/replenishment-order-history.module';
import { ReturnRequestDetailModule } from './return-request-detail/return-request-detail.module';
import { ReturnRequestListModule } from './return-request-list/order-return-request-list.module';

@NgModule({
  imports: [
    OrderHistoryModule,
    OrderDetailsModule,
    ReplenishmentOrderDetailsModule,
    OrderCancellationModule,
    OrderReturnModule,
    ReplenishmentOrderHistoryModule,
    ReturnRequestListModule,
    ReturnRequestDetailModule,
    OrderConfirmationModule,
  ],
  providers: [
    {
      provide: OrderDetailsOrderEntriesContextToken,
      useExisting: OrderDetailsOrderEntriesContext,
    },
  ],
})
export class OrderComponentsModule {}
