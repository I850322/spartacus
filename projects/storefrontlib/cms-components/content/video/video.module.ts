import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CmsConfig, provideDefaultConfig } from '@spartacus/core';
import { GenericLinkModule } from '../../../shared/components/generic-link/generic-link.module';
import { MediaModule } from '../../../shared/components/media/media.module';
import { VideoComponent } from './video.component';

@NgModule({
  imports: [CommonModule, RouterModule, GenericLinkModule, MediaModule],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        VideoComponent: {
          component: VideoComponent,
        },
      },
    }),
  ],
  declarations: [VideoComponent],
  exports: [VideoComponent],
})
export class VideoModule {}
