import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AsmFacadeService } from '@spartacus/asm/root';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import {
  GlobalMessageService,
  GlobalMessageType,
  User,
  UserService,
} from '@spartacus/core';
import { ICON_TYPE } from '@spartacus/storefront';
import { Observable, Subscription } from 'rxjs';
import { AsmComponentService } from '../services/asm-component.service';
@Component({
  selector: 'cx-customer-emulation',
  templateUrl: './customer-emulation.component.html',
})
export class CustomerEmulationComponent implements OnInit, OnDestroy {
  customer: User;
  cartId: FormControl = new FormControl();
  iconTypes = ICON_TYPE;
  isCustomerEmulationSessionInProgress$: Observable<boolean>;
  cartIdExists: boolean;
  showAssignCartSuccess = false;
  showAssignCartError = false;
  protected subscription = new Subscription();

  constructor(
    protected asmComponentService: AsmComponentService,
    protected userService: UserService,
    protected activeCartFacade: ActiveCartFacade,
    protected globalMessageService: GlobalMessageService,
    protected asmFacadeService: AsmFacadeService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.userService.get().subscribe((user) => {
        if (user) this.customer = user;
      })
    );
    this.isCustomerEmulationSessionInProgress$ =
      this.asmComponentService.isCustomerEmulationSessionInProgress();

    this.cartId.valueChanges.subscribe((response: string) => {
      this.cartIdExists = response.trim().length > 0;
    });

    this.activeCartFacade.getActiveCartId().subscribe((response) => {
      if (response) {
        this.cartId.setValue(response);
      }
    });
  }

  logoutCustomer() {
    this.asmComponentService.logoutCustomer();
  }

  /**
   * Assign the input cart number to the customer
   */
  assignCartToCustomer() {
    const customerId = this.customer.uid;
    const cartId = this.cartId.value;

    if (customerId) {
      this.asmFacadeService.bindCart({ cartId, customerId }).subscribe(
        () => {
          this.globalMessageService.add(
            { key: 'asm.assignCart.success' },
            GlobalMessageType.MSG_TYPE_CONFIRMATION
          );

          this.activeCartFacade.reloadActiveCart();
        },
        () => {
          this.globalMessageService.add(
            { key: 'asm.assignCart.error' },
            GlobalMessageType.MSG_TYPE_ERROR
          );
        }
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
