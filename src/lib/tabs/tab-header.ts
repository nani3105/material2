/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {CanDisableRipple, mixinDisableRipple} from '@angular/material/core';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {MatTabLabelWrapper} from './tab-label-wrapper';

/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';


// Boilerplate for applying mixins to MatTabHeader.
/** @docs-private */
export class MatTabHeaderBase {}
export const _MatTabHeaderMixinBase = mixinDisableRipple(MatTabHeaderBase);

/**
 * The header of the tab group which displays a list of all the tabs in the tab group. Includes
 * an ink bar that follows the currently selected tab. When the tabs list's width exceeds the
 * width of the header container, then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tab-header',
  templateUrl: 'tab-header.html',
  styleUrls: ['tab-header.css'],
  inputs: ['disableRipple'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mat-tab-header',
    '[class.mat-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.mat-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
  },
})
export class MatTabHeader extends _MatTabHeaderMixinBase
    implements AfterContentChecked, AfterContentInit, OnDestroy, CanDisableRipple {

  @ContentChildren(MatTabLabelWrapper) _labelWrappers: QueryList<MatTabLabelWrapper>;

  /** The tab index that is focused. */
  private _focusIndex: number = 0;

  /** Whether the header should scroll to the selected index after the view has been checked. */
  private _selectedIndexChanged = false;

  /** Whether the tab list can be scrolled more towards the end of the tab label list. */
  _disableScrollAfter = true;

  /** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
  _disableScrollBefore = true;

  private _selectedIndex: number = 0;

  /** The index of the active tab. */
  @Input()
  get selectedIndex(): number { return this._selectedIndex; }
  set selectedIndex(value: number) {
    value = coerceNumberProperty(value);
    this._selectedIndexChanged = this._selectedIndex != value;
    this._selectedIndex = value;
    this._focusIndex = value;
  }

  /** Whether the controls for pagination should be displayed */
  _showPaginationControls = false;

  /** Event emitted when a label is focused. */
  @Output() indexFocused = new EventEmitter();

  constructor(private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _viewportRuler: ViewportRuler,
    @Optional() private _dir: Directionality) {
    super();
  }

  ngAfterContentChecked(): void {
  }

  /** When the focus index is set, we must manually send focus to the correct label */
  set focusIndex(value: number) {
    if (!this._isValidIndex(value) || this._focusIndex == value) { return; }

    this._focusIndex = value;
    this.indexFocused.emit(value);
    this._setTabFocus(value);
  }

  /** Tracks which element has focus; used for keyboard navigation */
  get focusIndex(): number { return this._focusIndex; }

  /**
   * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
   * providing a valid index and return true.
   */
  _isValidIndex(index: number): boolean {
    if (!this._labelWrappers) { return true; }

    const tab = this._labelWrappers ? this._labelWrappers.toArray()[index] : null;
    return !!tab && !tab.disabled;
  }

  /**
   * Sets focus on the HTML element for the label wrapper and scrolls it into the view if
   * scrolling is enabled.
   */
  _setTabFocus(tabIndex: number) {
    console.log(tabIndex);
  }

  _handleKeydown(event: KeyboardEvent) {
    console.log(event);
  }

  /**
   * Aligns the ink bar to the selected tab on load.
   */
  ngAfterContentInit() {
  }

  ngOnDestroy() {
  }

  /**
   * Callback for when the MutationObserver detects that the content has changed.
   */
  _onContentChanges() {

  }

  /**
   * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
   * the end of the list, respectively). The distance to scroll is computed to be a third of the
   * length of the tab list view window.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
  _scrollHeader(scrollDir: ScrollDirection) {
    console.log(scrollDir);
  }

  /** The layout direction of the containing app. */
  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

}
