import { NgModule, Type } from '@angular/core';
import { RulebasedConfiguratorModule } from '@spartacus/product-configurator/rulebased';
import { RulebasedCpqConfiguratorModule } from '@spartacus/product-configurator/rulebased/cpq';
import { environment } from '../../../../environments/environment';

const extensions: Type<any>[] = [];

if (environment.cpq) {
  extensions.push(RulebasedCpqConfiguratorModule);
}

@NgModule({
  imports: [RulebasedConfiguratorModule, ...extensions],
})
export class RulebasedConfiguratorWrapperModule {}
