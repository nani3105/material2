/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '@angular/router';
import {AutocompleteDemo} from '../autocomplete/autocomplete-demo';
import {BaselineDemo} from '../baseline/baseline-demo';
import {ButtonDemo} from '../button/button-demo';
import {CardDemo} from '../card/card-demo';
import {DialogDemo} from '../dialog/dialog-demo';
import {InputDemo} from '../input/input-demo';
import {GridListDemo} from '../grid-list/grid-list-demo';
import {CheckboxDemo} from '../checkbox/checkbox-demo';
import {IconDemo} from '../icon/icon-demo';
import {RadioDemo} from '../radio/radio-demo';
import {SnackBarDemo} from '../snack-bar/snack-bar-demo';
import {DemoApp, Home} from './demo-app';
import {OverlayDemo} from '../overlay/overlay-demo';
import {TypographyDemo} from '../typography/typography-demo';


export const DEMO_APP_ROUTES: Routes = [
  {path: '', component: DemoApp, children: [
    {path: 'autocomplete', component: AutocompleteDemo},
    {path: 'baseline', component: BaselineDemo},
    {path: '', component: Home},
    {path: 'button', component: ButtonDemo},
    {path: 'checkbox', component: CheckboxDemo},
    {path: 'card', component: CardDemo},
    {path: 'dialog', component: DialogDemo},
    {path: 'icon', component: IconDemo},
    {path: 'input', component: InputDemo},
    {path: 'grid-list', component: GridListDemo},
    {path: 'radio', component: RadioDemo},
    {path: 'snack-bar', component: SnackBarDemo},
    {path: 'overlay', component: OverlayDemo},
    {path: 'typography', component: TypographyDemo},
  ]}
];

export const ALL_ROUTES: Routes = [
  {path: '',  component: DemoApp, children: DEMO_APP_ROUTES}
];
