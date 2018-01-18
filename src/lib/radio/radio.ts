/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  RippleConfig,
  RippleRef,
} from '@angular/material/core';

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

/** Change event object emitted by MatRadio and MatRadioGroup. */
export class MatRadioChange {
  /** The MatRadioButton that emits the change event. */
  source: MatRadioButton | null;
  /** The value of the MatRadioButton. */
  value: any;
}


/**
 * A group of radio buttons , may contain one or more <mat-radio-button>
 */
@Directive({
  selector: 'mat-radio-group',
  exportAs: 'matRadioGroup',
  host: {'role': 'radiogroup', 'class': 'mat-radio-group'},
  inputs: ['disabled']
})
export class MatRadioGroup {
  /** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
  private _labelPosition: 'before' | 'after' = 'after';

  /** Whether the radio group is disabled. */
  private _disabled: boolean = false;

  /** Whether the radio group is required. */
  private _required: boolean = false;

  /** Whether the radio group is disabled */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
    this._markRadiosForCheck();
  }

  /** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
  @Input()
  get labelPosition(): 'before' | 'after' {
    return this._labelPosition;
  }

  set labelPosition(v) {
    this._labelPosition = (v == 'before') ? 'before' : 'after';
    this._markRadiosForCheck();
  }


  /** Whether the radio group is required */
  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this._markRadiosForCheck();
  }

  _markRadiosForCheck() {}
}

// Boilerplate for applying mixins to MatRadioButton.
/** @docs-private */
export class MatRadioButtonBase {
  constructor(public _elementRef: ElementRef) {}
}

// As per Material design specifications the selection control radio should use the accent color
// palette by default. https://material.io/guidelines/components/selection-controls.html
export const _MatRadioButtonMixinBase =
    mixinColor(mixinDisableRipple(MatRadioButtonBase), 'accent');

/**
 * A radio-button. May be inside of
 */
@Component({
  moduleId: module.id,
  selector: 'mat-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  inputs: ['color', 'disableRipple'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  exportAs: 'matRadioButton',
  host: {
    'class': 'mat-radio-button',
    '[class.mat-radio-checked]': 'checked',
    '[class.mat-radio-disabled]': 'disabled',
    '[attr.id]': 'id',
    // Note: under normal conditions focus shouldn't land on this element, however it may be
    // programmatically set, for example inside of a focus trap, in this case we want to forward
    // the focus to the native element.
    '(focus)': '_inputElement.nativeElement.focus()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadioButton extends _MatRadioButtonMixinBase {
  private _uniqueId: string = `mat-radio-${++nextUniqueId}`;

  /** The unique ID for the radio button. */
  @Input() id: string = this._uniqueId;

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  @Input() name: string;

  /** Used to set the 'aria-label' attribute of the underlying input element */
  @Input('aria-label') ariaLabel: string;

  /** The 'aria-labelledby' attribute takes precedence as the element's text alternative. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** Whether this radio button is checked */
  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value: boolean) {
    const newCheckedState = coerceBooleanProperty(value);

    if (this._checked != newCheckedState) {
      this._checked = newCheckedState;

    }
  }

  /** The value of the radio button */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (this._value != value) {
      this._value = value;
    }
  }

  /**
   * Whether or not the radio-button should appear before or after the label.
   * @deprecated
   */
  @Input()
  get align(): 'start' | 'end' {
    // align refers to the checkbox relative to the label, while labelPosition refers to the
    // label relative to the checkbox. As such, they are inverted.
    return this.labelPosition == 'after' ? 'start' : 'end';
  }

  set align(v) {
    this.labelPosition = (v == 'start') ? 'after' : 'before';
  }

  private _labelPosition: 'before' | 'after';

  /** Whether the label should appear after or before the radio button. Defaults to 'after' */
  @Input()
  get labelPosition(): 'before' | 'after' {
    return this._labelPosition || (this.radioGroup && this.radioGroup.labelPosition) || 'after';
  }

  set labelPosition(value) {
    this._labelPosition = value;
  }

  /** Whether the radio button is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.radioGroup != null && this.radioGroup.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Whether the radio button is required. */
  @Input()
  get required(): boolean {
    return this._required || (this.radioGroup && this.radioGroup.required);
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }

    /**
   * Event emitted when the checked state of this radio button changes.
   * Change events are only emitted when the value changes due to user interaction with
   * the radio button (the same behavior as `<input type-"radio">`).
   */
  @Output() change: EventEmitter<MatRadioChange> = new EventEmitter<MatRadioChange>();

  /** The parent radio group. May or may not be present. */
  radioGroup: MatRadioGroup;

  /** ID of the native input element inside `<mat-radio-button>` */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  /** Whether this radio is checked. */
  private _checked: boolean = false;

  /** Whether this radio is disabled. */
  private _disabled: boolean;

  /** Whether this radio is required. */
  private _required: boolean;

  /** Value assigned to this radio.*/
  private _value: any = null;

  /** Ripple configuration for the mouse ripples and focus indicators. */
  _rippleConfig: RippleConfig = {centered: true, radius: 23, speedFactor: 1.5};

  /** The native `<input type=radio>` element */
  @ViewChild('input') _inputElement: ElementRef;

  constructor(@Optional() radioGroup: MatRadioGroup,
              elementRef: ElementRef,
              private _changeDetector: ChangeDetectorRef,
              private _focusMonitor: FocusMonitor,
              private _radioDispatcher: UniqueSelectionDispatcher) {
    super(elementRef);

    // Assertions. Ideally these should be stripped out by the compiler.
    // TODO(jelbourn): Assert that there's no name binding AND a parent radio group.
    this.radioGroup = radioGroup;

  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    const event = new MatRadioChange();
    event.source = this;
    event.value = this._value;
    this.change.emit(event);
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `radio-button` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
  }

  /**
   * Triggered when the radio button received a click or the input recognized any change.
   * Clicking on a label element, will trigger a change event on the associated input.
   */
  _onInputChange(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    // const groupValueChanged = this.radioGroup && this.value != this.radioGroup.value;
    this.checked = true;
    this._emitChangeEvent();
  }
}
