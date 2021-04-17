import { NgModule } from '@angular/core';
import { CdcRootModule, CDC_FEATURE } from '@spartacus/cdc/root';
import { provideConfig } from '@spartacus/core';

@NgModule({
  imports: [CdcRootModule],
  providers: [
    provideConfig({
      [CDC_FEATURE]: [
        {
          baseSite: 'electronics-cdc',
          javascriptUrl: '',
          sessionExpiration: 3600,
        },
        {
          baseSite: 'electronics-spa',
          javascriptUrl:
            'https://cdns.eu1.gigya.com/JS/gigya.js?apikey=3_k_wG-sllOhu2rjDEWHjG9-ncnnGAMHfkIcUKzl94weJU1Y18hITRgnTDp1LP8QdC',
          sessionExpiration: 3600,
        },
      ],
    }),
    provideConfig({
      featureModules: {
        cdc: {
          module: () => import('@spartacus/cdc').then((m) => m.CdcModule),
        },
      },
    }),
  ],
})
export class CdcFeatureModule {}
