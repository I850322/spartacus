import { Injectable } from '@angular/core';
import { CartModification } from '@spartacus/cart/base/root';
import { Observable } from 'rxjs';
import { CartEntryAdapter } from './cart-entry.adapter';

@Injectable({
  providedIn: 'root',
})
export class CartEntryConnector {
  constructor(protected adapter: CartEntryAdapter) {}

  public add(
    userId: string,
    cartId: string,
    productCode: string,
    quantity?: number
  ): Observable<CartModification> {
    return this.adapter.add(userId, cartId, productCode, quantity);
  }

  public update(
    userId: string,
    cartId: string,
    entryNumber: string,
    qty: number,
    pickupStore?: string
  ): Observable<CartModification> {
    return this.adapter.update(userId, cartId, entryNumber, qty, pickupStore);
  }

  public remove(
    userId: string,
    cartId: string,
    entryNumber: string
  ): Observable<any> {
    return this.adapter.remove(userId, cartId, entryNumber);
  }
}
