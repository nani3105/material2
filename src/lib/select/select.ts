/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {DOWN_ARROW, END, ENTER, HOME, SPACE, UP_ARROW} from '@angular/cdk/keycodes';
import {
  CdkConnectedOverlay,
  Overlay,
  RepositionScrollStrategy,
  ScrollStrategy,
  ViewportRuler,
} from '@angular/cdk/overlay';
import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  isDevMode,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import {
  CanDisable,
  ErrorStateMatcher,
  CanUpdateErrorState,
  mixinErrorState,
  HasTabIndex,
  MatOptgroup,
  MatOption,
  MatOptionSelectionChange,
  mixinDisabled,
  mixinTabIndex,
  MAT_OPTION_PARENT_COMPONENT,
  mixinDisableRipple,
  CanDisableRipple,
} from '@angular/material/core';
import {Subject} from 'rxjs/Subject';
import {MatFormField, MatFormFieldControl} from '@angular/material/form-field';
import {matSelectAnimations} from './select-animations';
import {
  getMatSelectDynamicMultipleError,
  getMatSelectNonArrayValueError,
  getMatSelectNonFunctionValueError,
} from './select-errors';

let nextUniqueId = 0;

/**
 * Allows the user to customize the trigger that is displayed when the select has a value.
 */
@Directive({
  selector: 'mat-select-trigger'
})
export class MatSelectTrigger {}

/** Injection token that determines the scroll handling while a select is open. */
export const MAT_SELECT_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mat-select-scroll-strategy');

/** @docs-private */
export function MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MAT_SELECT_SCROLL_STRATEGY_PROVIDER = {
  provide: MAT_SELECT_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
};

// Boilerplate for applying mixins to MatSelect.
/** @docs-private */
export class MatSelectBase {
  constructor(public _elementRef: ElementRef,
              public _defaultErrorStateMatcher: ErrorStateMatcher,
              public _parentForm: NgForm,
              public _parentFormGroup: FormGroupDirective,
              public ngControl: NgControl) {}
}
export const _MatSelectMixinBase = mixinDisableRipple(
    mixinTabIndex(mixinDisabled(mixinErrorState(MatSelectBase))));

@Component({
  moduleId: module.id,
  selector: 'mat-select',
  exportAs: 'matSelect',
  templateUrl: 'select.html',
  styleUrls: ['select.css'],
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-label]': '_ariaLabel',
    '[attr.aria-labelledby]': 'ariaLabelledby',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-owns]': 'panelOpen ? _optionIds : null',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[class.mat-select-disabled]': 'disabled',
    '[class.mat-select-invalid]': 'errorState',
    '[class.mat-select-required]': 'required',
    'class': 'mat-select',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  },
  animations: [
    matSelectAnimations.transformPanel,
    matSelectAnimations.fadeInContent
  ],
  providers: [
    {provide: MatFormFieldControl, useExisting: MatSelect},
    {provide: MAT_OPTION_PARENT_COMPONENT, useExisting: MatSelect}
  ],
})
export class MatSelect extends _MatSelectMixinBase implements AfterContentInit, OnChanges,
OnDestroy, OnInit, DoCheck, ControlValueAccessor, CanDisable, HasTabIndex,
MatFormFieldControl<any>, CanUpdateErrorState, CanDisableRipple {
 /** Whether or not the overlay panel is open. */
 private _panelOpen = false;

 /** Whether filling out the select is required in the form.  */
 private _required: boolean = false;

 /** The scroll position of the overlay panel, calculated to center the selected option. */
 private _scrollTop = 0;

 /** The placeholder displayed in the trigger of the select. */
 private _placeholder: string;

 /** Whether the component is in multiple selection mode. */
 private _multiple: boolean = false;

 /** Comparison function to specify which option is displayed. Defaults to object equality. */
 private _compareWith = (o1: any, o2: any) => o1 === o2;

 /** Unique id for this input. */
 private _uid = `mat-select-${nextUniqueId++}`;

 /** Emits whenever the component is destroyed. */
 private _destroy = new Subject<void>();

 /** The last measured value for the trigger's client bounding rect. */
 _triggerRect: ClientRect;

 /** The aria-describedby attribute on the select for improved a11y. */
 _ariaDescribedby: string;

 /** The cached font-size of the trigger element. */
 _triggerFontSize = 0;

 /** Deals with the selection logic. */
 _selectionModel: SelectionModel<MatOption>;

 /** Manages keyboard events for options in the panel. */
 _keyManager: ActiveDescendantKeyManager<MatOption>;

 /** View -> model callback called when value changes */
 _onChange: (value: any) => void = () => {};

 /** View -> model callback called when select has been touched */
 _onTouched = () => {};

 /** The IDs of child options to be passed to the aria-owns attribute. */
 _optionIds: string = '';

 /** The value of the select panel's transform-origin property. */
 _transformOrigin: string = 'top';

 /** Whether the panel's animation is done. */
 _panelDoneAnimating: boolean = false;

 /** Strategy that will be used to handle scrolling while the select panel is open. */
 _scrollStrategy = this._scrollStrategyFactory();

 /**
  * The y-offset of the overlay panel in relation to the trigger's top start corner.
  * This must be adjusted to align the selected option text over the trigger text.
  * when the panel opens. Will change based on the y-position of the selected option.
  */
 _offsetY = 0;

 /**
  * This position config ensures that the top "start" corner of the overlay
  * is aligned with with the top "start" of the origin by default (overlapping
  * the trigger completely). If the panel cannot fit below the trigger, it
  * will fall back to a position above the trigger.
  */
 _positions = [
   {
     originX: 'start',
     originY: 'top',
     overlayX: 'start',
     overlayY: 'top',
   },
   {
     originX: 'start',
     originY: 'bottom',
     overlayX: 'start',
     overlayY: 'bottom',
   },
 ];

 /** Whether the select is focused. */
 focused = false;

 /** A name for this control that can be used by `mat-form-field`. */
 controlType = 'mat-select';

 /** Trigger that opens the select. */
 @ViewChild('trigger') trigger: ElementRef;

 /** Panel containing the select options. */
 @ViewChild('panel') panel: ElementRef;

 /** Overlay pane containing the options. */
 @ViewChild(CdkConnectedOverlay) overlayDir: CdkConnectedOverlay;

 /** All of the defined select options. */
 @ContentChildren(MatOption, { descendants: true }) options: QueryList<MatOption>;

 /** All of the defined groups of options. */
 @ContentChildren(MatOptgroup) optionGroups: QueryList<MatOptgroup>;

 /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
 @Input() panelClass: string|string[]|Set<string>|{[key: string]: any};

 /** User-supplied override of the trigger element. */
 @ContentChild(MatSelectTrigger) customTrigger: MatSelectTrigger;

 /** Placeholder to be shown if no value has been selected. */
 @Input()
 get placeholder() { return this._placeholder; }
 set placeholder(value: string) {
   this._placeholder = value;
   this.stateChanges.next();
 }

 /** Whether the component is required. */
 @Input()
 get required() { return this._required; }
 set required(value: any) {
   this._required = coerceBooleanProperty(value);
   this.stateChanges.next();
 }

 /** Whether the user should be allowed to select multiple options. */
 @Input()
 get multiple(): boolean { return this._multiple; }
 set multiple(value: boolean) {
   if (this._selectionModel) {
     throw getMatSelectDynamicMultipleError();
   }

   this._multiple = coerceBooleanProperty(value);
 }

 /**
  * A function to compare the option values with the selected values. The first argument
  * is a value from an option. The second is a value from the selection. A boolean
  * should be returned.
  */
 @Input()
 get compareWith() { return this._compareWith; }
 set compareWith(fn: (o1: any, o2: any) => boolean) {
   if (typeof fn !== 'function') {
     throw getMatSelectNonFunctionValueError();
   }
   this._compareWith = fn;
   if (this._selectionModel) {
     // A different comparator means the selection could change.
     // this._initializeSelection();
   }
 }

 /** Value of the select control. */
 @Input()
 get value() { return this._value; }
 set value(newValue: any) {
   if (newValue !== this._value) {
     this.writeValue(newValue);
     this._value = newValue;
   }
 }
 private _value: any;

 /** Aria label of the select. If not specified, the placeholder will be used as label. */
 @Input('aria-label') ariaLabel: string = '';

 /** Input that can be used to specify the `aria-labelledby` attribute. */
 @Input('aria-labelledby') ariaLabelledby: string;

 /** An object used to control when error messages are shown. */
 @Input() errorStateMatcher: ErrorStateMatcher;

 /** Unique id of the element. */
 @Input()
 get id() { return this._id; }
 set id(value: string) {
   this._id = value || this._uid;
   this.stateChanges.next();
 }
 private _id: string;

  constructor(
    private _viewportRuler: ViewportRuler,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    elementRef: ElementRef,
    @Optional() private _dir: Directionality,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() private _parentFormField: MatFormField,
    @Self() @Optional() public ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string,
    @Inject(MAT_SELECT_SCROLL_STRATEGY) private _scrollStrategyFactory) {
    super(elementRef, _defaultErrorStateMatcher, _parentForm,
          _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.tabIndex = parseInt(tabIndex) || 0;

    // Force setter to be called in case id was not specified.
    this.id = this.id;
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<MatOption>(this.multiple, undefined, false);
    this.stateChanges.next();
  }

  ngAfterContentInit() {

  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Updating the disabled state is handled by `mixinDisabled`, but we need to additionally let
    // the parent form field know to run change detection when the disabled state changes.
    if (changes.disabled) {
      this.stateChanges.next();
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this.stateChanges.complete();
  }

  /**
   * Sets the select's value. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param value New value to be written to the model.
   */
  writeValue(value: any): void {
    if (this.options) {
      console.log(value);
      // this._setSelectionByValue(value);
    }
  }

  /**
   * Saves a callback function to be invoked when the select's value
   * changes from user input. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the value changes.
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Saves a callback function to be invoked when the select is blurred
   * by the user. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the component has been touched.
   */
  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  /**
   * Disables the select. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param isDisabled Sets whether the component is disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  /** Whether the select has a value. */
  get empty(): boolean {
    return !this._selectionModel || this._selectionModel.isEmpty();
  }

  // Implemented as part of MatFormFieldControl.
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  // Implemented as part of MatFormFieldControl.
  onContainerClick() {
    // this.focus();
    // this.open();
  }

  // Implemented as part of MatFormFieldControl.
  get shouldLabelFloat(): boolean {
    return this._panelOpen || !this.empty;
  }

}
