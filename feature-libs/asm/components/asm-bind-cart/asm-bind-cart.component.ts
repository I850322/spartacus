import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AsmFacade } from '@spartacus/asm/root';
import { ActiveCartFacade, MultiCartFacade } from '@spartacus/cart/base/root';
import {
  GlobalMessageService,
  GlobalMessageType,
  OCC_CART_ID_CURRENT,
  User,
} from '@spartacus/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'cx-asm-bind-cart',
  templateUrl: './asm-bind-cart.component.html',
})
export class AsmBindCartComponent implements OnInit, OnDestroy {
  @Input() customer: User;
  @Input() cartId: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
  ]);
  isCustomerEmulationSessionInProgress$: Observable<boolean>;

  protected subscription = new Subscription();

  constructor(
    protected globalMessageService: GlobalMessageService,
    protected asmFacadeService: AsmFacade,
    protected activeCartFacade: ActiveCartFacade,
    protected multiCartFacade: MultiCartFacade
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.activeCartFacade.getActiveCartId().subscribe((response: string) => {
        if (response) {
          this.cartId.setValue(response);
        }
      })
    );
  }

  /**
   * Assign the input cart number to the customer
   */
  assignCartToCustomer() {
    const customerId = this.customer.uid;
    const cartId = this.cartId.value;

    if (customerId) {
      this.subscription.add(
        this.asmFacadeService.bindCart({ cartId, customerId }).subscribe(
          () => {
            this.globalMessageService.add(
              { key: 'asm.assignCart.success' },
              GlobalMessageType.MSG_TYPE_CONFIRMATION
            );

            this.multiCartFacade.loadCart({
              cartId: OCC_CART_ID_CURRENT,
              userId: customerId,
            });
          },
          () => {
            this.globalMessageService.add(
              { key: 'asm.assignCart.error' },
              GlobalMessageType.MSG_TYPE_ERROR
            );
          }
        )
      );
    }
  }

  clearText() {
    this.cartId.setValue('');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}