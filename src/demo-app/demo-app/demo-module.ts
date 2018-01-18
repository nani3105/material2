/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {AutocompleteDemo} from '../autocomplete/autocomplete-demo';
import {BaselineDemo} from '../baseline/baseline-demo';
import {ButtonDemo} from '../button/button-demo';
import {CardDemo} from '../card/card-demo';
import {ContentElementDialog, DialogDemo, IFrameDialog, JazzDialog} from '../dialog/dialog-demo';
import {CheckboxDemo, MatCheckboxDemoNestedChecklist} from '../checkbox/checkbox-demo';
import {InputDemo} from '../input/input-demo';
import {RadioDemo} from '../radio/radio-demo';
import {DemoMaterialModule} from '../demo-material-module';
import {SnackBarDemo} from '../snack-bar/snack-bar-demo';
import {IconDemo} from '../icon/icon-demo';
import {GridListDemo} from '../grid-list/grid-list-demo';
import {LayoutModule} from '@angular/cdk/layout';
import {DemoApp, Home} from './demo-app';
import {DEMO_APP_ROUTES} from './routes';
import {
  KeyboardTrackingPanel,
  OverlayDemo,
  RotiniPanel,
  SpagettiPanel
} from '../overlay/overlay-demo';
import {TooltipDemo} from '../tooltip/tooltip-demo';
import {TypographyDemo} from '../typography/typography-demo';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(DEMO_APP_ROUTES),
    DemoMaterialModule,
    LayoutModule,
  ],
  declarations: [
    AutocompleteDemo,
    BaselineDemo,
    ButtonDemo,
    CardDemo,
    DemoApp,
    DialogDemo,
    InputDemo,
    SpagettiPanel,
    RadioDemo,
    CheckboxDemo,
    OverlayDemo,
    KeyboardTrackingPanel,
    MatCheckboxDemoNestedChecklist,
    TypographyDemo,
    IconDemo,
    GridListDemo,
    SnackBarDemo,
    JazzDialog,
    ContentElementDialog,
    RotiniPanel,
    IFrameDialog,
    Home
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
  ],
  entryComponents: [
    ContentElementDialog,
    DemoApp,
    IFrameDialog,
    JazzDialog,
    RotiniPanel,
    SpagettiPanel,
    KeyboardTrackingPanel,
  ],
})
export class DemoModule {}

