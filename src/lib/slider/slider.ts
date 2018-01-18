/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  CanColor,
  CanDisable,
  HammerInput,
  HasTabIndex,
  mixinColor,
  mixinDisabled,
  mixinTabIndex,
} from '@angular/material/core';
import {Subscription} from 'rxjs/Subscription';

// Boilerplate for applying mixins to MatSlider.
/** @docs-private */
export class MatSliderBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatSliderMixinBase =
  mixinTabIndex(mixinColor(mixinDisabled(MatSliderBase), 'accent'));

/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-slider',
  exportAs: 'matSlider',
  providers: [MAT_SLIDER_VALUE_ACCESSOR],
  host: {
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
    '(click)': '_onClick($event)',
    '(keydown)': '_onKeydown($event)',
    '(keyup)': '_onKeyup()',
    '(mouseenter)': '_onMouseenter()',
    '(slide)': '_onSlide($event)',
    '(slideend)': '_onSlideEnd()',
    '(slidestart)': '_onSlideStart($event)',
    'class': 'mat-slider',
    'role': 'slider',
    '[tabIndex]': 'tabIndex',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-valuemax]': 'max',
    '[attr.aria-valuemin]': 'min',
    '[attr.aria-valuenow]': 'value',
    '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
    '[class.mat-slider-disabled]': 'disabled',
    '[class.mat-slider-has-ticks]': 'tickInterval',
    '[class.mat-slider-horizontal]': '!vertical',
    '[class.mat-slider-axis-inverted]': '_invertAxis',
    '[class.mat-slider-sliding]': '_isSliding',
    '[class.mat-slider-thumb-label-showing]': 'thumbLabel',
    '[class.mat-slider-vertical]': 'vertical',
    '[class.mat-slider-min-value]': '_isMinValue',
    '[class.mat-slider-hide-last-tick]': 'disabled || _isMinValue && _thumbGap && _invertAxis',
  },
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  inputs: ['disabled', 'color', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSlider extends _MatSliderMixinBase
    implements ControlValueAccessor, OnDestroy, CanDisable, CanColor, OnInit, HasTabIndex {

}
