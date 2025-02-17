import { Injectable, OnDestroy } from '@angular/core';
import {
  CheckoutQueryResetEvent,
  CheckoutSupportedDeliveryModesQueryResetEvent,
} from '@spartacus/checkout/base/root';
import { EventService } from '@spartacus/core';
import { Subscription } from 'rxjs';
import { CheckoutCostCenterSetEvent } from './checkout-b2b.events';

@Injectable({
  providedIn: 'root',
})
export class CheckoutCostCenterEventListener implements OnDestroy {
  protected subscriptions = new Subscription();

  constructor(protected eventService: EventService) {
    this.onCostCenterSet();
  }

  protected onCostCenterSet(): void {
    this.subscriptions.add(
      this.eventService
        .get(CheckoutCostCenterSetEvent)
        .subscribe(({ cartId, userId }) => {
          this.eventService.dispatch(
            { cartId, userId },
            CheckoutSupportedDeliveryModesQueryResetEvent
          );
          this.eventService.dispatch({}, CheckoutQueryResetEvent);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
