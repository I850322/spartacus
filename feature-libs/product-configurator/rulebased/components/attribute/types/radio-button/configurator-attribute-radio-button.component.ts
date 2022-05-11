import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InnerComponentsContext } from '@spartacus/storefront';
import { ConfiguratorCommonsService } from '../../../../core/facade/configurator-commons.service';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorAttributeQuantityService } from '../../quantity/configurator-attribute-quantity.service';
import { ConfiguratorAttributeSingleSelectionBaseComponent } from '../base/configurator-attribute-single-selection-base.component';

@Component({
  selector: 'cx-configurator-attribute-radio-button',
  templateUrl: './configurator-attribute-radio-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorAttributeRadioButtonComponent
  extends ConfiguratorAttributeSingleSelectionBaseComponent
  implements OnInit
{
  uiType = Configurator.UiType;

  attributeRadioButtonForm = new FormControl('');

  constructor(
    protected quantityService: ConfiguratorAttributeQuantityService,
    protected innerComponentsContext: InnerComponentsContext,
    protected configuratorCommonsService: ConfiguratorCommonsService
  ) {
    super(quantityService, innerComponentsContext);
  }

  onSelect(value: string): void {
    this.loading$.next(true);

    // const event: ConfigFormUpdateEvent = {
    //   changedAttribute: {
    //     ...this.attribute,
    //     selectedSingleValue: value,
    //   },
    //   ownerKey: this.ownerKey,
    //   updateType: Configurator.UpdateType.ATTRIBUTE,
    // };

    //this.selectionChange.emit(event);
    this.configuratorCommonsService.updateConfiguration(
      this.ownerKey,
      {
        ...this.attribute,
        selectedSingleValue: value,
      },
      Configurator.UpdateType.ATTRIBUTE
    );
  }

  ngOnInit(): void {
    this.attributeRadioButtonForm.setValue(this.attribute.selectedSingleValue);
  }
}
