/*!
 * jQuery Sly v0.10.0
 * https://github.com/Darsain/sly
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
/*jshint
	bitwise:false, camelcase:false, curly:true, eqeqeq:true, forin:false, immed:true, latedef:true, newcap:true,
	noarg:true, noempty:true, nonew:false, plusplus:false, quotmark:false, regexp:false, undef:true, unused:true,
	strict:true, trailing:true,

	asi:false, boss:false, debug:false, eqnull:true, es5:false, esnext:false, evil:false, expr:false, funcscope:false,
	iterator:false, lastsemic:false, laxbreak:false, laxcomma:true, loopfunc:false, multistr:false, onecase:true,
	proto:false, regexdash:false, scripturl:false, smarttabs:true, shadow:false, sub:false, supernew:false,

	browser:true
*/
/*global jQuery:false */
;(function ($, undefined) {
	'use strict';

	// Plugin names
	var pluginName = 'sly',
		namespace = pluginName,

		// Local WindowAnimationTiming interface
		cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,
		rAF = window.requestAnimationFrame,

		// CSS transform property
		transform;

	/**
	 * Plugin class
	 *
	 * @class
	 *
	 * @param {Element} frame DOM element of sly container
	 * @param {Object}  o     Object with plugin options
	 */
	function Plugin(frame, o) {

		// Alias for this
		var self = this,

			// Frame variables
			$frame     = $(frame),
			$slidee    = $frame.children().eq(0),
			frameSize  = 0,
			slideeSize = 0,
			pos        = {
				cur:  0,
				dest: 0,
				max:  0,
				min:  0
			},

			// Scrollbar variables
			$sb        = $(o.scrollBar).eq(0),
			$handle    = $sb.length ? $sb.children().eq(0) : 0,
			sbSize     = 0,
			handleSize = 0,
			hPos       = {
				cur: 0,
				max: 0,
				min: 0
			},

			// Pagesbar variables
			$pb    = $(o.pagesBar),
			$pages = 0,
			pages  = [],

			// Navigation type booleans
			basicNav    = o.itemNav === 'basic',
			smartNav    = o.itemNav === 'smart',
			forceCenteredNav = o.itemNav === 'forceCentered',
			centeredNav = o.itemNav === 'centered' || forceCenteredNav,
			itemNav     = basicNav || smartNav || centeredNav || forceCenteredNav,

			// Other variables
			$doc   = $(document),
			$items = 0,
			items  = [],
			rel    = {
				firstItem: 0,
				lastItem: 1,
				centerItem: 1,
				activeItem: -1,
				activePage: 0,
				items: 0,
				pages: 0
			},
			$scrollSource   = o.scrollSource ? $(o.scrollSource) : $frame,
			$dragSource     = o.dragSource ? $(o.dragSource) : $frame,
			$prevButton     = $(o.prev),
			$nextButton     = $(o.next),
			$prevPageButton = $(o.prevPage),
			$nextPageButton = $(o.nextPage),
			last            = {},
			animation       = {},
			renderID        = 0,
			cycleID         = 0,
			cycleIsPaused   = 0,
			ignoreNextClick = 0;

		/**
		 * (Re)Loading function.
		 *
		 * Populate arrays, set sizes, bind events, ...
		 *
		 * @return {Void}
		 */
		var load = this.reload = function () {
			// Local variables
			var ignoredMargin = 0,
				oldPos        = $.extend({}, pos);

			// Reset global variables
			frameSize  = o.horizontal ? $frame.width() : $frame.height();
			sbSize     = o.horizontal ? $sb.width() : $sb.height();
			slideeSize = o.horizontal ? $slidee.outerWidth() : $slidee.outerHeight();

			// Set position limits & relatives
			pos.min = 0;
			pos.max = Math.max(slideeSize - frameSize, 0);
			last    = {};

			// Sizes & offsets for item based navigations
			if (itemNav) {
				// Reset itemNav related variables
				$items = $slidee.children(':visible');
				rel.items = $items.length;
				items  = [];
				pages  = [];

				// Needed variables
				var paddingStart  = getPx($slidee, o.horizontal ? 'paddingLeft' : 'paddingTop'),
					paddingEnd    = getPx($slidee, o.horizontal ? 'paddingRight' : 'paddingBottom'),
					marginStart   = getPx($items, o.horizontal ? 'marginLeft' : 'marginTop'),
					marginEnd     = getPx($items.slice(-1), o.horizontal ? 'marginRight' : 'marginBottom'),
					centerOffset  = 0,
					areFloated    = $items.css('float') !== 'none';

				// Update ignored margin
				ignoredMargin = marginStart ? 0 : marginEnd;

				// Reset slideeSize
				slideeSize = 0;

				// Iterate through items
				$items.each(function (i, element) {
					// Item
					var $item     = $(element),
						itemSize  = $item[o.horizontal ? 'outerWidth' : 'outerHeight'](true),
						itemMarginStart = getPx($item, o.horizontal ? 'marginLeft' : 'marginTop'),
						itemMarginEnd   = getPx($item, o.horizontal ? 'marginRight' : 'marginBottom'),
						itemData = {
							size: itemSize,
							offStart: slideeSize - (!i || o.horizontal ? 0 : itemMarginStart),
							offCenter: slideeSize - Math.round(frameSize / 2 - itemSize / 2),
							offEnd: slideeSize - frameSize + itemSize - (marginStart ? 0 : itemMarginEnd)
						};

					// Account for centerOffset & slidee padding
					if (!i) {
						centerOffset = -(forceCenteredNav ? Math.round(frameSize / 2 - itemSize / 2) : 0) + paddingStart;
						slideeSize  += paddingStart;
					}

					// Increment slidee size for size of the active element
					slideeSize += itemSize;

					// Try to account for vertical margin collapsing in vertical mode
					// It's not bulletproof, but should work in 99% of cases
					if (!o.horizontal && !areFloated) {
						// Subtract smaller margin, but only when top margin is not 0, and this is not the first element
						if (itemMarginEnd && itemMarginStart && i > 0) {
							slideeSize -= Math.min(itemMarginStart, itemMarginEnd);
						}
					}

					// Things to be done on last item
					if (i === $items.length - 1) {
						slideeSize += paddingEnd;
					}

					// Add item object to items array
					items.push(itemData);
				});

				// Resize slidee
				$slidee[0].style[o.horizontal ? 'width' : 'height'] = slideeSize + 'px';

				// Adjust internal slidee size for last margin
				slideeSize -= ignoredMargin;

				// Set limits
				pos.min = centerOffset;
				pos.max = forceCenteredNav ? items[items.length - 1].offCenter : Math.max(slideeSize - frameSize, 0);

				// Fix overflowing activeItem
				if (rel.activeItem >= items.length) {
					self.activate(items.length - 1);
				} else if (items.length === 1) {
					$items.eq(rel.activeItem).addClass(o.activeClass);
				}
			}

			// Update relative positions
			updateRelatives();

			// Scrollbar
			if ($handle) {
				// Stretch scrollbar handle to represent the visible area
				handleSize = o.dynamicHandle ? Math.round(sbSize * frameSize / slideeSize) : $handle[o.horizontal ? 'outerWidth' : 'outerHeight']();

				if (o.dynamicHandle) {
					handleSize = within(handleSize, o.minHandleSize, sbSize);
					$handle[0].style[o.horizontal ? 'width' : 'height'] = handleSize + 'px';
				}

				hPos.max   = sbSize - handleSize;
			}

			// Pages
			var tempPagePos = 0,
				pagesHtml   = '',
				pageIndex   = 0;

			// Populate pages array
			if (forceCenteredNav) {
				pages = $.map(items, function (data) {
					return data.offCenter;
				});
			} else {
				while (tempPagePos - frameSize < pos.max) {
					var pagePos = Math.min(pos.max, tempPagePos);

					pages.push(pagePos);
					tempPagePos += frameSize;

					// When item navigation, and last page is smaller than half of the last item size,
					// adjust the last page position to pos.max and break the loop
					if (tempPagePos > pos.max && itemNav && pos.max - pagePos < (items[items.length - 1].size - ignoredMargin) / 2) {
						pages[pages.length - 1] = pos.max;
						break;
					}
				}
			}

			// Pages bar
			if ($pb[0]) {
				for (var i = 0; i < pages.length; i++) {
					pagesHtml += o.pageBuilder(pageIndex++);
				}

				$pages = $(pagesHtml).appendTo($pb.empty());
			}

			// Fix possible overflowing
			slideTo(within(pos.dest, pos.min, pos.max));

			// Extend relative variables object with some useful info
			rel.pages      = pages.length;
			rel.slideeSize = slideeSize;
			rel.frameSize  = frameSize;
			rel.sbSize     = sbSize;
			rel.handleSize = handleSize;

			// Trigger :load event
			$frame.trigger(pluginName + ':load', [$.extend({}, pos, {
				old: oldPos
			}), $items, rel]);
		};

		/**
		 * Animate to a position.
		 *
		 * @param {Int}   delta
		 * @param {Mixed} drag
		 *
		 * @return {Void}
		 */
		function slideBy(delta) {
			slideTo(pos.dest + delta);
		}

		/**
		 * Animate to a position.
		 *
		 * @param {Int}   newPos
		 * @param {Mixed} drag
		 *
		 * @return {Void}
		 */
		function slideTo(newPos, dragging, released) {
			// Align items
			if (itemNav && (!dragging || released)) {
				var tempRel = getRelatives(newPos);

				if (centeredNav) {
					newPos = items[tempRel.centerItem].offCenter;
					if (forceCenteredNav) {
						self.activate(tempRel.centerItem, 1);
					}
				} else if (newPos > pos.min && newPos < pos.max) {
					newPos = items[tempRel.firstItem].offStart;
				}
			}

			// Handle overflowing position limits
			if (dragging === 'slidee' && o.elasticBounds && !released) {
				if (newPos > pos.max) {
					newPos = pos.max + (newPos - pos.max) / 6;
				} else if (newPos < pos.min) {
					newPos = pos.min + (newPos - pos.min) / 6;
				}
			} else {
				newPos = within(newPos, pos.min, pos.max);
			}

			// Update the animation object
			animation.start    = +new Date();
			animation.time     = 0;
			animation.from     = pos.cur;
			animation.to       = newPos;
			animation.delta    = newPos - pos.cur;
			animation.dragging = dragging;
			animation.released = released;
			animation.stillDragging = dragging && !released;

			// Attach animation destination
			pos.dest = newPos;

			// Queue next cycle
			if (!animation.stillDragging) {
				self.cycle();
			}

			// Synchronize states
			updateRelatives();
			updateNavButtonsState();
			syncPagesbar();

			// Render the animation
			if (newPos !== pos.cur && !renderID) {
				render();
			}
		}

		/**
		 * Render animation frame.
		 *
		 * @return {Void}
		 */
		function render() {
			// If first render call, wait for next animationFrame
			if (!renderID) {
				renderID = rAF(render);

				if (!animation.dragging) {
					$frame.trigger(pluginName + ':moveStart', [pos, $items, rel]);
				}

				return;
			}

			// If dragging SLIDEE, or animation duration would take less than 2 frames, don't animate
			if (animation.stillDragging ? animation.dragging === 'slidee' : o.speed < 33) {
				pos.cur = animation.to;
			}
			// Use tweesing for handle dragging
			else if (animation.stillDragging && animation.dragging === 'handle') {
				pos.cur += (animation.to - pos.cur) * o.syncFactor;
			}
			// jQuery easing for basic animations
			else {
				animation.time = Math.min(+new Date() - animation.start, o.speed);
				pos.cur = animation.from + animation.delta * jQuery.easing[o.easing](animation.time/o.speed, animation.time, 0, 1, o.speed);
			}

			if (animation.to === Math.round(pos.cur) && (animation.stillDragging || animation.time >= o.speed)) {
				pos.cur = pos.dest;
				renderID = 0;

				if (!animation.dragging) {
					$frame.trigger(pluginName + ':moveEnd', [pos, $items, rel]);
				}
			} else {
				renderID = rAF(render);
			}

			// Trigger :move event
			$frame.trigger(pluginName + ':move', [pos, $items, rel]);

			// Position SLIDEE
			if (transform) {
				$slidee[0].style[transform] = (o.horizontal ? 'translateX' : 'translateY') + '(' + (-pos.cur) + 'px)';
			} else {
				$slidee[0].style[o.horizontal ? 'left' : 'top'] = -Math.round(pos.cur) + 'px';
			}

			syncScrollbar();
		}

		/**
		 * Synchronizes scrollbar with the SLIDEE.
		 *
		 * @return {Void}
		 */
		function syncScrollbar() {
			if ($handle) {
				hPos.cur = pos.min === pos.max ? 0 : ((animation.dragging === 'handle' ? pos.dest : pos.cur) - pos.min) / (pos.max - pos.min) * hPos.max;
				hPos.cur = within(Math.round(hPos.cur), hPos.min, hPos.max);

				if (last.hPos !== hPos.cur) {
					last.hPos = hPos.cur;
					if (transform) {
						$handle[0].style[transform] = (o.horizontal ? 'translateX' : 'translateY') + '(' + hPos.cur + 'px)';
					} else {
						$handle[0].style[o.horizontal ? 'left' : 'top'] = hPos.cur + 'px';
					}
				}
			}
		}

		/**
		 * Synchronizes pagesbar with SLIDEE.
		 *
		 * @return {Void}
		 */
		function syncPagesbar() {
			if ($pages[0] && last.page !== rel.activePage) {
				last.page = rel.activePage;
				$pages.removeClass(o.activeClass).eq(rel.activePage).addClass(o.activeClass);
			}
		}

		/**
		 * Activate previous item.
		 *
		 * @return {Void}
		 */
		this.prev = function () {
			self.activate(rel.activeItem - 1);
		};

		/**
		 * Activate next item.
		 *
		 * @return {Void}
		 */
		this.next = function () {
			self.activate(rel.activeItem + 1);
		};

		/**
		 * Activate previous page.
		 *
		 * @return {Void}
		 */
		this.prevPage = function () {
			self.activatePage(rel.activePage - 1);
		};

		/**
		 * Activate next page.
		 *
		 * @return {Void}
		 */
		this.nextPage = function () {
			self.activatePage(rel.activePage + 1);
		};

		/**
		 * Animate element or the whole SLIDEE to the start of the frame.
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 *
		 * @return {Void}
		 */
		this.toStart = function (item) {
			if (item === undefined) {
				slideTo(pos.min);
			} else if (itemNav) {
				var index = getIndex(item);

				if (index !== -1) {
					// You can't align items to the start of the frame when centeredNav is enabled
					if (centeredNav) {
						return;
					}

					slideTo(items[index].offStart);
				}
			} else {
				var $item = $slidee.find(item).eq(0);

				if ($.contains($slidee[0], $item[0])) {
					slideTo(o.horizontal ? $item.offset().left - $slidee.offset().left : $item.offset().top - $slidee.offset().top);
				}
			}
		};

		/**
		 * Animate element or the whole SLIDEE to the end of the frame.
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 *
		 * @return {Void}
		 */
		this.toEnd = function (item) {
			if (item === undefined) {
				slideTo(pos.max);
			} else if (itemNav) {
				var index = getIndex(item);

				 if (index !== -1) {
					// You can't align items to the end of the frame in centeredNav navigation
					if (centeredNav) {
						return;
					}

					slideTo(items[index].offEnd);
				}
			} else {
				var $item = $slidee.find(item).eq(0);

				if ($.contains($slidee[0], $item[0])) {
					var offset = o.horizontal ? $item.offset().left - $slidee.offset().left : $item.offset().top - $slidee.offset().top;
					slideTo(offset - frameSize + $item[o.horizontal ? 'outerWidth' : 'outerHeight']());
				}
			}
		};

		/**
		 * Animate element or the whole SLIDEE to the center of the frame.
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 *
		 * @return {Void}
		 */
		this.toCenter = function (item) {
			if (item === undefined) {
				slideTo(Math.round(pos.max / 2 + pos.min / 2));
			} else if (itemNav) {
				var index = getIndex(item);

				if (index !== -1) {
					slideTo(items[index].offCenter);
				}
			} else {
				var $item = $slidee.find(item).eq(0);

				if ($item[0]) {
					var offset = o.horizontal ? $item.offset().left - $slidee.offset().left : $item.offset().top - $slidee.offset().top;
					slideTo(offset - frameSize / 2 + $item[o.horizontal ? 'outerWidth' : 'outerHeight']() / 2);
				}
			}
		};

		/**
		 * Get the index of an item in SLIDEE.
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0.
		 *
		 * @return {Int}
		 */
		function getIndex(item) {
			return isNumber(item) ? within(item, 0, items.length - 1) : item === undefined ? -1 : $items.index(item);
		}

		/**
		 * Parse style to pixels.
		 *
		 * @param {Object}   $item    jQuery object with element.
		 * @param {Property} property CSS property to get the pixels from.
		 *
		 * @return {Int}
		 */
		function getPx($item, property) {
			return parseInt($item.css(property), 10);
		}

		/**
		 * Activates an element.
		 *
		 * Element is positioned to one of the sides of the frame, based on it's current position.
		 * If the element is close to the right frame border, it will be animated to the start of the left border,
		 * and vice versa. This helps user to navigate through the elements only by clicking on them, without
		 * the need for navigation buttons, scrolling, or keyboard arrows.
		 *
		 * @param {Mixed} item         Item DOM element, or index starting at 0.
		 * @param {Bool}  noReposition Activate item without repositioning it.
		 *
		 * @return {Void}
		 */
		this.activate = function (item, noReposition) {
			if (!itemNav || item === undefined) {
				return;
			}

			var index = getIndex(item),
				oldActive = rel.activeItem;

			// Update activeItem index
			rel.activeItem = index;

			// Update classes
			$items.removeClass(o.activeClass).eq(index).addClass(o.activeClass);
			updateNavButtonsState();

			// Trigget :active event if a new element is being activated
			if (index !== oldActive) {
				$frame.trigger(pluginName + ':active', [$items.eq(index)]);
			}

			if (!noReposition) {
				// When centeredNav is enabled, center the element
				if (centeredNav) {
					self.toCenter(index);
				// Otherwise determine where to position the element
				} else if (smartNav) {
					// If activated element is currently on the far right side of the frame, assume that
					// user is moving forward and animate it to the start of the visible frame, and vice versa
					if (index >= rel.lastItem) {
						self.toStart(index);
					} else if (index <= rel.firstItem) {
						self.toEnd(index);
					} else {
						self.cycle();
					}
				}
			}
		};


		/**
		 * Activates a page.
		 *
		 * @param {Int} index Page index, starting from 0.
		 *
		 * @return {Void}
		 */
		this.activatePage = function (index) {
			// Fix overflowing
			index = within(index, 0, pages.length - 1);
			slideTo(pages[index]);
		};

		/**
		 * Return relative positions of items based on their visibility within FRAME.
		 *
		 * @param {Int} slideePos Position of SLIDEE.
		 *
		 * @return {Void}
		 */
		function getRelatives(slideePos) {
			slideePos = isNumber(slideePos) ? slideePos : pos.dest;

			var relatives = {},
				centerOffset = forceCenteredNav ? 0 : frameSize / 2;

			// Determine active page
			for (var p = 0, pl = pages.length; p < pl; p++) {
				if (slideePos >= pos.max || p === pages.length - 1) {
					relatives.activePage = pages.length - 1;
					break;
				}

				if (slideePos <= pages[p] + centerOffset) {
					relatives.activePage = p;
					break;
				}
			}

			// Relative item indexes
			if (itemNav) {
				var first = false,
					last = false,
					center = false;

				/* From start */
				for (var i = 0, il = items.length; i < il; i++) {
					// First item
					if (first === false && slideePos <= items[i].offStart) {
						first = i;
					}

					// Centered item
					if (center === false && slideePos - items[i].size / 2 <= items[i].offCenter) {
						center = i;
					}

					// Last item
					if (i === items.length - 1 || (last === false && slideePos < items[i + 1].offEnd)) {
						last = i;
					}

					// Terminate if all are assigned
					if (last !== false) {
						break;
					}
				}

				// Safe assignment, just to be sure the false won't be returned
				relatives.firstItem  = isNumber(first) ? first : 0;
				relatives.centerItem = isNumber(center) ? center : relatives.firstItem;
				relatives.lastItem   = isNumber(last) ? last : relatives.centerItem;
			}

			return relatives;
		}

		/**
		 * Update object with relative positions.
		 *
		 * @param {Int} newPos
		 *
		 * @return {Void}
		 */
		function updateRelatives(newPos) {
			$.extend(rel, getRelatives(newPos));
		}

		/**
		 * Disable navigation buttons when needed.
		 *
		 * Adds disabledClass, and when the button is <button> or <input>, activates :disabled state.
		 *
		 * @return {Void}
		 */
		function updateNavButtonsState() {
			// Item navigation
			if (itemNav) {
				var isFirst = rel.activeItem === 0,
					isLast  = rel.activeItem >= items.length - 1,
					itemsButtonState = isFirst ? 'first' : isLast ? 'last' : 'middle';

				if (last.itemsButtonState !== itemsButtonState) {
					last.itemsButtonState = itemsButtonState;

					if ($prevButton.is('button,input')) {
						$prevButton.prop('disabled', isFirst);
					}

					if ($nextButton.is('button,input')) {
						$nextButton.prop('disabled', isLast);
					}

					$prevButton[isFirst ? 'removeClass' : 'addClass'](o.disabledClass);
					$nextButton[isLast ? 'removeClass' : 'addClass'](o.disabledClass);
				}
			}

			// Page navigation
			if ($pages[0]) {
				var isStart = pos.dest <= pos.min,
					isEnd = pos.dest >= pos.max,
					pagesButtonState = isStart ? 'first' : isEnd ? 'last' : 'middle';

				// Update paging buttons only if there has been a change in their state
				if (last.pagesButtonState !== pagesButtonState) {
					last.pagesButtonState = pagesButtonState;

					if ($prevPageButton.is('button,input')) {
						$prevPageButton.prop('disabled', isStart);
					}

					if ($nextPageButton.is('button,input')) {
						$nextPageButton.prop('disabled', isEnd);
					}

					$prevPageButton[isStart ? 'removeClass' : 'addClass'](o.disabledClass);
					$nextPageButton[isEnd ? 'removeClass' : 'addClass'](o.disabledClass);
				}
			}
		}

		/**
		 * Start cycling.
		 *
		 * @param {Bool} soft Start cycle only when soft paused.
		 *
		 * @return {Void}
		 */
		this.cycle = function (soft) {
			if (!o.cycleBy || !o.cycleInterval || o.cycleBy === 'items' && !items[0] || soft && cycleIsPaused) {
				return;
			}

			if (cycleID) {
				cycleID = clearTimeout(cycleID);
			} else {
				// Trigger :cycleStart event
				$frame.trigger(pluginName + ':cycleStart', [pos, $items, rel]);
			}

			cycleID = setTimeout(function () {
				switch (o.cycleBy) {
					case 'items':
						self.activate(rel.activeItem >= items.length - 1 ? 0 : rel.activeItem + 1);
						break;

					case 'pages':
						self.activatePage(rel.activePage >= pages.length - 1 ? 0 : rel.activePage + 1);
						break;
				}

				// Trigger :cycle event
				$frame.trigger(pluginName + ':cycle', [pos, $items, rel]);
			}, o.cycleInterval);
		};

		/**
		 * Pause cycling.
		 *
		 * @param {Bool} soft Soft pause intended for pauseOnHover - won't set cycleIsPaused state to true.
		 *
		 * @return {Void}
		 */
		this.pause = function (soft) {
			if (!soft) {
				cycleIsPaused = true;
			}

			if (cycleID) {
				cycleID = clearTimeout(cycleID);

				// Trigger :cyclePause event
				$frame.trigger(pluginName + ':cyclePause', [pos, $items, rel]);
			}
		};

		/**
		 * Toggle cycling
		 *
		 * @return {Void}
		 */
		this.toggle = function () {
			self[cycleID ? 'pause' : 'cycle']();
		};

		/**
		 * Crossbrowser reliable way to stop default event action.
		 *
		 * @param {Event} event     Event object.
		 * @param {Bool}  noBubbles Cancel event bubbling.
		 *
		 * @return {Void}
		 */
		function stopDefault(event, noBubbles) {
			event = event || window.event;

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}

			if (noBubbles) {
				if (event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
			}
		}

		/**
		 * Updates a signle or multiple option values.
		 *
		 * @param {Mixed} name  Name of the option that should be updated, or object that will extend the options.
		 * @param {Mixed} value New option value.
		 *
		 * @return {Void}
		 */
		this.set = function (name, value) {
			if ($.isPlainObject(name)) {
				$.extend(o, name);
			} else if (o.hasOwnProperty(name)) {
				o[name] = value;
			}
		};

		/**
		 * Destroys plugin instance and everything it created.
		 *
		 * @return {Void}
		 */
		this.destroy = function () {
			// Unbind all events
			$frame
				.add($doc)
				.add($slidee)
				.add($scrollSource)
				.add($handle)
				.add($pb)
				.add($prevButton)
				.add($nextButton)
				.add($prevPageButton)
				.add($nextPageButton)
				.unbind('.' + namespace);

			// Reset some styles
			$slidee.add($handle).css(o.horizontal ? 'left' : 'top', 0);

			// Remove plugin classes
			$prevButton.add($nextButton).removeClass(o.disabledClass);

			// Remove page items
			$pb.empty();

			// Remove plugin from element data storage
			$.removeData(frame, namespace);
		};

		/** Constructor */
		(function () {
			var dragEvents = 'mousemove.' + namespace + ' mouseup.' + namespace;

			// Extend options
			o = $.extend({}, $.fn[pluginName].defaults, o);

			// Set required styles to elements
			$frame.css('overflow', 'hidden');
			if ($frame.css('position') === 'static') {
				$frame.css('position', 'relative');
			}
			if ($sb.css('position') === 'static') {
				$sb.css('position', 'relative');
			}
			$slidee.add($handle).css($.extend({ position: 'absolute' }, o.horizontal ? { left: 0 } : { top: 0 }));

			// Load
			load();

			// Activate requested position
			if (itemNav) {
				self.activate(o.startAt);
			} else {
				slideTo(o.startAt);
			}

			// Scrolling navigation
			if (o.scrollBy) {
				$scrollSource.bind('DOMMouseScroll.' + namespace + ' mousewheel.' + namespace, function (event) {
					// If there is no scrolling to be done, leave the default event alone
					if (pos.min === pos.max) {
						return;
					}

					stopDefault(event, 1);

					var orgEvent = event.originalEvent,
						isForward = 0;

					// Old school scrollwheel delta
					if (orgEvent.wheelDelta) {
						isForward = orgEvent.wheelDelta / 120 < 0;
					}
					if (orgEvent.detail) {
						isForward = -orgEvent.detail / 3 < 0;
					}

					if (itemNav) {
						var nextItem = getIndex((centeredNav ? forceCenteredNav ? rel.activeItem : rel.centerItem : rel.firstItem) + (isForward ? o.scrollBy : -o.scrollBy));
						self[centeredNav ? forceCenteredNav ? 'activate' : 'toCenter' : 'toStart'](nextItem);
					} else {
						slideBy(isForward ? o.scrollBy : -o.scrollBy);
					}
				});
			}

			// Keyboard navigation
			if (o.keyboardNav) {
				$doc.bind('keydown.' + namespace, function (event) {
					switch (event.which) {
						// Left or Up
						case o.horizontal ? 37 : 38:
							stopDefault(event);
							self[o.keyboardNavByPages ? 'prevPage' : 'prev']();
							break;

						// Right or Down
						case o.horizontal ? 39 : 40:
							stopDefault(event);
							self[o.keyboardNavByPages ? 'nextPage' : 'next']();
							break;
					}
				});
			}

			// Navigation buttons
			if (o.prev) {
				$prevButton.on('click.' + namespace, function (event) {
					stopDefault(event);
					self.prev();
				});
			}
			if (o.next) {
				$nextButton.on('click.' + namespace, function (event) {
					stopDefault(event);
					self.next();
				});
			}
			if (o.prevPage) {
				$prevPageButton.on('click.' + namespace, function (event) {
					stopDefault(event);
					self.prevPage();
				});
			}
			if (o.nextPage) {
				$nextPageButton.on('click.' + namespace, function (event) {
					stopDefault(event);
					self.nextPage();
				});
			}

			// Click on items navigation
			$slidee.on('click.' + namespace, '*', function (event) {
				// Accept only right mouse button clicks on direct SLIDEE children
				if (event.which === 1 && event.target.parentNode === event.delegateTarget && !ignoreNextClick) {
					self.activate(this);
				}

				ignoreNextClick = 0;
			});

			// Pages navigation
			if ($pb[0]) {
				$pb.on('click.' + namespace, '*', function () {
					self.activatePage($pages.index(this));
				});
			}

			// Dragging navigation
			if (o.dragContent) {
				$dragSource.on('mousedown.' + namespace, function (event) {
					// Ignore other than left mouse button
					if (event.which !== 1) {
						return;
					}

					stopDefault(event);

					var initLoc = o.horizontal ? event.clientX : event.clientY,
						initPos = pos.cur,
						start   = +new Date(),
						$srcEl  = $(event.target),
						isInitialized = 0;

					// Add dragging class
					$slidee.addClass(o.draggedClass);

					// Bind dragging events
					$doc.on(dragEvents, function (event) {

						var released = event.type === 'mouseup',
							path     = (o.horizontal ? event.clientX : event.clientY) - initLoc;

						// Initialization
						if (!isInitialized && Math.abs(path) > 10) {
							isInitialized = 1;
							ignoreNextClick = 1;

							// Pause ongoing cycle
							self.pause(1);

							// Disable click actions on source element, as they are unwelcome when dragging
							$srcEl.on('click', function disableAction(event) {
								stopDefault(event, 1);
								ignoreNextClick = 0;
								$srcEl.off('click', disableAction);
							});

							// Trigger :moveStart event
							$frame.trigger(pluginName + ':moveStart', [pos, $items, rel, 'slidee']);
						}

						// Proceed when initialized
						if (isInitialized) {
							stopDefault(event);

							// Adjust path with a swing on mouse release
							if (released && o.speed > 33) {
								path += path * 200 / (+new Date() - start);
							}

							slideTo(Math.round(initPos - path), 'slidee', released);
						}

						// Cleanup and trigger :moveEnd event on release
						if (released) {
							ignoreNextClick = 0;
							$doc.off(dragEvents);
							$slidee.removeClass(o.draggedClass);
							$frame.trigger(pluginName + ':moveEnd', [pos, $items, rel, 'slidee']);
						}
					});
				});
			}

			// Scrollbar dragging navigation
			if ($handle && o.dragHandle) {
				$handle.on('mousedown.' + namespace, function (event) {
					// Ignore other than left mouse button
					if (event.which !== 1) {
						return;
					}

					stopDefault(event);

					var initLoc = o.horizontal ? event.clientX : event.clientY,
						initPos = hPos.cur,
						pathMin = -hPos.cur,
						pathMax = hPos.max - hPos.cur;

					// Add dragging class
					$handle.addClass(o.draggedClass);

					// Trigger :moveStart event
					$frame.trigger(pluginName + ':moveStart', [pos, $items, rel, 'scrollbar']);

					// Pause ongoing cycle
					self.pause(1);

					// Bind dragging events
					$doc.on(dragEvents, function (event) {
						stopDefault(event);

						var path = within((o.horizontal ? event.clientX : event.clientY) - initLoc, pathMin, pathMax);

						slideTo(
							Math.round((initPos + path) / hPos.max * (pos.max - pos.min)) + pos.min,
							'handle',
							event.type === 'mouseup'
						);

						// Cleanup and trigger :moveEnd event
						if (event.type === 'mouseup') {
							$doc.off(dragEvents);
							$handle.removeClass(o.draggedClass);
							$frame.trigger(pluginName + ':moveEnd', [pos, $items, rel, 'scrollbar']);
						}
					});
				});
			}

			// Automatic cycling
			if (o.cycleBy) {
				// Pause on hover
				if (o.pauseOnHover) {
					$frame.on('mouseenter.' + namespace + ' mouseleave.' + namespace, function (event) {
						if (!cycleIsPaused) {
							self[event.type === 'mouseenter' ? 'pause' : 'cycle'](1);
						}
					});
				}

				// Initiate or pause cycling
				self[o.startPaused ? 'pause' : 'cycle']();
			}
		}());
	}

	/**
	 * Check if variable is a number.
	 *
	 * @param {Mixed} value
	 *
	 * @return {Boolean}
	 */
	function isNumber(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	}

	/**
	 * Make sure that number is within the limits.
	 *
	 * @param {Number} number
	 * @param {Number} min
	 * @param {Number} max
	 *
	 * @return {Number}
	 */
	function within(number, min, max) {
		return number < min ? min : number > max ? max : number;
	}

	// Local WindowAnimationTiming interface polyfill
	(function (w) {
		var vendors = ['moz', 'webkit', 'o'],
			lastTime = 0;

		// For a more accurate WindowAnimationTiming interface implementation, ditch the native
		// requestAnimationFrame when cancelAnimationFrame is not present (older versions of Firefox)
		for(var i = 0, l = vendors.length; i < l && !cAF; ++i) {
			cAF = w[vendors[i]+'CancelAnimationFrame'] || w[vendors[i]+'CancelRequestAnimationFrame'];
			rAF = cAF && w[vendors[i]+'RequestAnimationFrame'];
		}

		if (!cAF) {
			rAF = function (callback) {
				var currTime = +new Date(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime));
				lastTime = currTime + timeToCall;
				return w.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
			};

			cAF = function (id) {
				clearTimeout(id);
			};
		}
	}(window));

	// Detect CSS 2D transforms
	(function () {
		var prefixes = ['transform', 'webkitTransform', 'msTransform'],
			el = document.createElement('div');
		for (var i = 0, l = prefixes.length; i < l && !transform; i++) {
			if (el.style[prefixes[i]] !== undefined) {
				transform = prefixes[i];
			}
		}
	}());

	// jQuery plugin extension
	$.fn[pluginName] = function (options, returnInstance) {

		var method = false,
			methodArgs, instance;

		// Attributes logic
		if (!$.isPlainObject(options)) {
			if (typeof options === 'string' || options === false) {
				method = options === false ? 'destroy' : options;
				methodArgs = arguments;
				Array.prototype.shift.call(methodArgs);
			} else if (options === true) {
				returnInstance = options;
			}
			options = {};
		}

		// Apply plugin to all elements
		this.each(function (i, element) {

			// Plugin call with prevention against multiple instantiations
			var plugin = $.data(element, namespace);

			if (!plugin && !method) {
				// Create a new plugin object if it doesn't exist yet
				plugin = $.data(element, namespace, new Plugin(element, options));
			} else if (plugin && method) {
				// Call plugin method
				if (plugin[method]) {
					plugin[method].apply(plugin, methodArgs);
				}
			}

			// Register plugin instance for a first element in set
			if (!instance) {
				instance = plugin;
			}
		});

		// Return chainable jQuery object, or a plugin instance
		return !method && returnInstance ? instance : this;
	};

	// Default options
	$.fn[pluginName].defaults = {
		// Sly direction
		horizontal: 0,    // Change to horizontal direction.
		itemNav:    null, // Item navigation type. Can be: basic, smart, centered, forceCentered.

		// Scrollbar
		scrollBar:     null, // Selector or DOM element for scrollbar container.
		dragHandle:    0,    // Whether the scrollbar handle should be dragable.
		dynamicHandle: 0,    // Scrollbar handle represents the relation between hidden and visible content.
		minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
		syncFactor:    0.50, // Handle => SLIDEE sync factor. 0-1 floating point, where 1 = immediate, 0 = infinity.

		// Pagesbar
		pagesBar:    null, // Selector or DOM element for pages bar container.
		pageBuilder:       // Page item generator.
			function (index) {
				return '<li>' + (index + 1) + '</li>';
			},

		// Navigation buttons
		prev:     null, // Selector or DOM element for "previous item" button.
		next:     null, // Selector or DOM element for "next item" button.
		prevPage: null, // Selector or DOM element for "previous page" button.
		nextPage: null, // Selector or DOM element for "next page" button.

		// Automated cycling
		cycleBy:       null, // Enable automatic cycling. Can be: items, pages.
		cycleInterval: 5000, // Delay between cycles in milliseconds.
		pauseOnHover:  0,    // Pause cycling when mouse hovers over a frame
		startPaused:   0,    // Whether to start in paused sate.

		// Mixed options
		scrollBy:      0,       // Number of pixels/items for one mouse scroll event. 0 to disable mouse scrolling.
		dragContent:   0,       // Enable navigation by dragging the SLIDEE.
		elasticBounds: 0,       // Stretch SLIDEE position limits when dragging past borders.
		speed:         0,       // Animations speed in milliseconds. 0 to disable animations.
		easing:        'swing', // Animations easing.
		scrollSource:  null,    // Selector or DOM element for catching the mouse wheel event. Default is FRAME.
		dragSource:    null,    // Selector or DOM element for catching the mouse dragging events. Default is FRAME.
		startAt:       0,       // Starting offset in pixels or items.
		keyboardNav:   0,       // Navigation by keyboard arrows.
		keyboardNavByPages: 0,  // Whether the keyboard should navigate by pages instead of items.

		// Classes
		draggedClass:  'dragged', // Class for dragged elements (like SLIDEE or scrollbar handle).
		activeClass:   'active',  // Class for active items and pages.
		disabledClass: 'disabled' // Class for disabled navigation elements.
	};
}(jQuery));