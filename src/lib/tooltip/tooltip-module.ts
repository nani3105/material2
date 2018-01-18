/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule, ARIA_DESCRIBER_PROVIDER} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {PlatformModule} from '@angular/cdk/platform';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {
  MatTooltip,
} from './tooltip';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatCommonModule,
    PlatformModule,
    A11yModule,
  ],
  exports: [MatTooltip, MatCommonModule],
  declarations: [MatTooltip],
  providers: [
    ARIA_DESCRIBER_PROVIDER,
  ],
})
export class MatTooltipModule {}
