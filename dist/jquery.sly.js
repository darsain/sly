/*!
 * Sly 1.0.0-rc.5 - 27th Jan 2013
 * https://github.com/Darsain/sly
 *
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 */

;(function ($, w, undefined) {
	'use strict';

	// Plugin names
	var pluginName = 'sly',
		className  = 'Sly',
		namespace  = pluginName,

		// Local WindowAnimationTiming interface
		cAF = w.cancelAnimationFrame || w.cancelRequestAnimationFrame,
		rAF = w.requestAnimationFrame,

		// CSS transform property
		transform;

	/**
	 * Sly.
	 *
	 * @class
	 *
	 * @param {Element} frame       DOM element of sly container.
	 * @param {Object}  o           Object with plugin options.
	 * @param {Object}  callbackMap Callbacks map.
	 */
	function Sly(frame, o, callbackMap) {
		// Extend options
		o = $.extend({}, $.fn[pluginName].defaults, o);

		// Private variables
		var self        = this,
			initialized = 0,
			parallax    = isNumber(frame),
			$doc        = $(document),

			// Frame variables
			$frame     = $(frame),
			$slidee    = $frame.children().eq(0),
			frameSize  = 0,
			slideeSize = 0,
			pos        = {
				start:  0,
				center: 0,
				end:    0,
				cur:    0,
				dest:   0
			},

			// Scrollbar variables
			$sb        = $(o.scrollBar).eq(0),
			$handle    = $sb.length ? $sb.children().eq(0) : 0,
			sbSize     = 0,
			handleSize = 0,
			hPos       = {
				start: 0,
				end:   0,
				cur:   0
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
			itemNav     = !parallax && (basicNav || smartNav || centeredNav || forceCenteredNav),

			// Other variables
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
			callbacks       = {},
			last            = {},
			animation       = {},
			dragging        = { released: 1 },
			dragInitEvents  = 'touchstart.' + namespace + ' mousedown.' + namespace,
			dragMouseEvents = 'mousemove.' + namespace + ' mouseup.' + namespace,
			dragTouchEvents = 'touchmove.' + namespace + ' touchend.' + namespace,
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
		var load = self.reload = function () {
			// Local variables
			var ignoredMargin = 0;

			// Save old position
			pos.old = $.extend({}, pos);

			// Reset global variables
			frameSize  = parallax ? 0 : $frame[o.horizontal ? 'width' : 'height']();
			sbSize     = $sb[o.horizontal ? 'width' : 'height']();
			slideeSize = parallax ? frame : $slidee[o.horizontal ? 'outerWidth' : 'outerHeight']();
			pages      = [];

			// Set position limits & relatives
			pos.start = 0;
			pos.end   = Math.max(slideeSize - frameSize, 0);
			last      = {};

			// Sizes & offsets for item based navigations
			if (itemNav) {
				// Reset itemNav related variables
				$items    = $slidee.children(':visible');
				rel.items = $items.length;
				items     = [];

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
							start: slideeSize - (!i || o.horizontal ? 0 : itemMarginStart),
							center: slideeSize - Math.round(frameSize / 2 - itemSize / 2),
							end: slideeSize - frameSize + itemSize - (marginStart ? 0 : itemMarginEnd)
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
				pos.start = centerOffset;
				pos.end   = forceCenteredNav ? items[items.length - 1].center : Math.max(slideeSize - frameSize, 0);

				// Fix overflowing activeItem
				if (rel.activeItem >= items.length) {
					self.activate(items.length - 1);
				} else if (items.length === 1) {
					$items.eq(rel.activeItem).addClass(o.activeClass);
				}
			}

			// Calculate SLIDEE center position
			pos.center = Math.round(pos.end / 2 + pos.start / 2);

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

				hPos.end = sbSize - handleSize;

				if (!renderID) {
					syncScrollbar();
				}
			}

			// Pages
			if (!parallax) {
				var tempPagePos = pos.start,
					pagesHtml   = '',
					pageIndex   = 0;

				// Populate pages array
				if (itemNav) {
					$.each(items, function (i, item) {
						if (forceCenteredNav || item.start + item.size > tempPagePos) {
							tempPagePos = item[forceCenteredNav ? 'center' : 'start'];
							pages.push(tempPagePos);
							tempPagePos += frameSize;
						}
					});
				} else {
					while (tempPagePos - frameSize <= pos.end) {
						pages.push(tempPagePos);
						tempPagePos += frameSize;
					}
				}

				// Pages bar
				if ($pb[0]) {
					for (var i = 0; i < pages.length; i++) {
						pagesHtml += o.pageBuilder(pageIndex++);
					}

					$pages = $(pagesHtml).appendTo($pb.empty());
				}
			}

			// Fix possible overflowing
			slideTo(within(pos.dest, pos.start, pos.end));

			// Extend relative variables object with some useful info
			rel.pages      = pages.length;
			rel.slideeSize = slideeSize;
			rel.frameSize  = frameSize;
			rel.sbSize     = sbSize;
			rel.handleSize = handleSize;

			// Trigger :load event
			trigger('load');
		};

		/**
		 * Animate to a position.
		 *
		 * @param {Int}  newPos    New position.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		function slideTo(newPos, immediate) {
			// Align items
			if (itemNav && dragging.released) {
				var tempRel = getRelatives(newPos),
					isDetached = newPos > pos.start && newPos < pos.end;

				if (centeredNav) {
					if (isDetached) {
						newPos = items[tempRel.centerItem].center;
					}
					if (forceCenteredNav) {
						self.activate(tempRel.centerItem, 1);
					}
				} else if (isDetached) {
					newPos = items[tempRel.firstItem].start;
				}
			}

			// Handle overflowing position limits
			if (!dragging.released && dragging.source === 'slidee' && o.elasticBounds) {
				if (newPos > pos.end) {
					newPos = pos.end + (newPos - pos.end) / 6;
				} else if (newPos < pos.start) {
					newPos = pos.start + (newPos - pos.start) / 6;
				}
			} else {
				newPos = within(newPos, pos.start, pos.end);
			}

			// Update the animation object
			animation.start     = +new Date();
			animation.time      = 0;
			animation.from      = pos.cur;
			animation.to        = newPos;
			animation.delta     = newPos - pos.cur;
			animation.immediate = immediate;

			// Attach animation destination
			pos.dest = newPos;

			// Reset next cycle timeout
			resetCycle();

			// Synchronize states
			updateRelatives();
			updateNavButtonsState();
			syncPagesbar();

			// Render the animation
			if (newPos !== pos.cur) {
				trigger('change');
				if (!renderID) {
					render();
				}
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
				if (dragging.released) {
					trigger('moveStart');
				}
				return;
			}

			// If immediate repositioning is requested, SLIDEE is being dragged, or animation duration would take
			// less than 2 frames, don't animate
			if (animation.immediate || (!dragging.released ? dragging.source === 'slidee' : o.speed < 33)) {
				pos.cur = animation.to;
			}
			// Use tweesing for animations without known end point
			else if (!dragging.released && dragging.source === 'handle') {
				pos.cur += (animation.to - pos.cur) * o.syncFactor;
			}
			// Use tweening for basic animations with known end point
			else {
				animation.time = Math.min(+new Date() - animation.start, o.speed);
				pos.cur = animation.from + animation.delta * jQuery.easing[o.easing](animation.time/o.speed, animation.time, 0, 1, o.speed);
			}

			// If there is nothing more to render (animation reached the end, or dragging has been released),
			// break the rendering loop, otherwise request another animation frame
			if (animation.to === Math.round(pos.cur) && (!dragging.released || animation.time >= o.speed)) {
				pos.cur = pos.dest;
				renderID = 0;
			} else {
				renderID = rAF(render);
			}

			trigger('move');

			// Position SLIDEE
			if (!parallax) {
				if (transform) {
					$slidee[0].style[transform] = (o.horizontal ? 'translateX' : 'translateY') + '(' + (-pos.cur) + 'px)';
				} else {
					$slidee[0].style[o.horizontal ? 'left' : 'top'] = -Math.round(pos.cur) + 'px';
				}
			}

			// When animation reached the end, and dragging is not active, trigger moveEnd
			if (!renderID && dragging.released) {
				trigger('moveEnd');
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
				hPos.cur = pos.start === pos.end ? 0 : (((!dragging.released && dragging.source === 'handle') ? pos.dest : pos.cur) - pos.start) / (pos.end - pos.start) * hPos.end;
				hPos.cur = within(Math.round(hPos.cur), hPos.start, hPos.end);

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
		 * Returns the position object.
		 *
		 * @param {Mixed} item
		 *
		 * @return {Object}
		 */
		self.getPos = function (item) {
			if (item === undefined) {
				return pos;
			}

			if (itemNav) {
				var index = getIndex(item);
				return index !== -1 ? items[index] : false;
			} else {
				var $item = $slidee.find(item).eq(0);

				if ($item[0]) {
					var offset = o.horizontal ? $item.offset().left - $slidee.offset().left : $item.offset().top - $slidee.offset().top,
						size   = $item[o.horizontal ? 'outerWidth' : 'outerHeight']();

					return {
						start:  offset,
						center: offset - frameSize / 2 + size / 2,
						end:    offset - frameSize + size,
						size:   size
					};
				} else {
					return false;
				}
			}
		};

		/**
		 * Returns the relatives object.
		 *
		 * @return {Object}
		 */
		self.getRel = function () {
			return rel;
		};

		/**
		 * Activate previous item.
		 *
		 * @return {Void}
		 */
		self.prev = function () {
			self.activate(rel.activeItem - 1);
		};

		/**
		 * Activate next item.
		 *
		 * @return {Void}
		 */
		self.next = function () {
			self.activate(rel.activeItem + 1);
		};

		/**
		 * Activate previous page.
		 *
		 * @return {Void}
		 */
		self.prevPage = function () {
			self.activatePage(rel.activePage - 1);
		};

		/**
		 * Activate next page.
		 *
		 * @return {Void}
		 */
		self.nextPage = function () {
			self.activatePage(rel.activePage + 1);
		};

		/**
		 * Slide SLIDEE by amount of pixels.
		 *
		 * @param {Int}  delta     Difference in position. Positive means forward, negative means backward.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.slideBy = function (delta, immediate) {
			slideTo(pos.dest + delta, immediate);
		};

		/**
		 * Animate SLIDEE to a specific position.
		 *
		 * @param {Int}  pos       New position.
		 * @param {Bool} immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.slideTo = function (pos, immediate) {
			slideTo(pos, immediate);
		};

		/**
		 * Core method for handling `toLocation` methods.
		 *
		 * @param  {String} location
		 * @param  {Mixed}  item
		 * @param  {Bool}   immediate
		 *
		 * @return {Void}
		 */
		function to(location, item, immediate) {
			// Optional arguments logic
			if (typeof item === 'boolean') {
				immediate = item;
				item = undefined;
			}

			if (item === undefined) {
				slideTo(pos[location]);
			} else {
				// You can't align items to sides of the frame
				// when centered navigation type is enabled
				if (centeredNav && location !== 'center') {
					return;
				}

				var itemPos = self.getPos(item);
				if (itemPos) {
					slideTo(itemPos[location], immediate);
				}
			}
		}

		/**
		 * Animate element or the whole SLIDEE to the start of the frame.
		 *
		 * @param {Mixed} item      Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toStart = function (item, immediate) {
			to('start', item, immediate);
		};

		/**
		 * Animate element or the whole SLIDEE to the end of the frame.
		 *
		 * @param {Mixed} item      Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toEnd = function (item, immediate) {
			to('end', item, immediate);
		};

		/**
		 * Animate element or the whole SLIDEE to the center of the frame.
		 *
		 * @param {Mixed} item      Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 * @param {Bool}  immediate Reposition immediately without an animation.
		 *
		 * @return {Void}
		 */
		self.toCenter = function (item, immediate) {
			to('center', item, immediate);
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
		self.activate = function (item, noReposition) {
			if (!itemNav || item === undefined) {
				return;
			}

			var index = getIndex(item),
				oldActive = rel.activeItem;

			// Update activeItem index
			rel.activeItem = index;

			// Update classes
			$items.eq(oldActive).removeClass(o.activeClass);
			$items.eq(index).addClass(o.activeClass);
			updateNavButtonsState();

			// Trigget active event if a new element is being activated
			if (index !== oldActive) {
				trigger('active', index);
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
						resetCycle();
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
		self.activatePage = function (index) {
			if (pages.length) {
				index = within(index, 0, pages.length - 1);
				slideTo(pages[index]);
				trigger('activePage', index);
			}
		};

		/**
		 * Return relative positions of items based on their visibility within FRAME.
		 *
		 * @param {Int} slideePos Position of SLIDEE.
		 *
		 * @return {Void}
		 */
		function getRelatives(slideePos) {
			slideePos = within(isNumber(slideePos) ? slideePos : pos.dest, pos.start, pos.end);

			var relatives = {},
				centerOffset = forceCenteredNav ? 0 : frameSize / 2;

			// Determine active page
			if (!parallax) {
				for (var p = 0, pl = pages.length; p < pl; p++) {
					if (slideePos >= pos.end || p === pages.length - 1) {
						relatives.activePage = pages.length - 1;
						break;
					}

					if (slideePos <= pages[p] + centerOffset) {
						relatives.activePage = p;
						break;
					}
				}
			}

			// Relative item indexes
			if (itemNav) {
				var first = false,
					last = false,
					center = false;

				// From start
				for (var i = 0, il = items.length; i < il; i++) {
					// First item
					if (first === false && slideePos <= items[i].start) {
						first = i;
					}

					// Centered item
					if (center === false && slideePos - items[i].size / 2 <= items[i].center) {
						center = i;
					}

					// Last item
					if (i === items.length - 1 || (last === false && slideePos < items[i + 1].end)) {
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
				var isStart = pos.dest <= pos.start,
					isEnd = pos.dest >= pos.end,
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
		self.cycle = function (soft) {
			if (!o.cycleBy || !o.cycleInterval || o.cycleBy === 'items' && !items[0] || soft && cycleIsPaused) {
				return;
			}

			cycleIsPaused = 0;

			if (cycleID) {
				cycleID = clearTimeout(cycleID);
			} else {
				trigger('cycleStart');
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

				trigger('cycle');
			}, o.cycleInterval);
		};

		/**
		 * Pause cycling.
		 *
		 * @param {Bool} soft Soft pause intended for pauseOnHover - won't set cycleIsPaused state to true.
		 *
		 * @return {Void}
		 */
		self.pause = function (soft) {
			if (!soft) {
				cycleIsPaused = true;
			}

			if (cycleID) {
				cycleID = clearTimeout(cycleID);
				trigger('cyclePause');
			}
		};

		/**
		 * Toggle cycling
		 *
		 * @return {Void}
		 */
		self.toggle = function () {
			self[cycleID ? 'pause' : 'cycle']();
		};

		/**
		 * Reset next cycle timeout.
		 *
		 * @return {Void}
		 */
		function resetCycle() {
			if (dragging.released && !cycleIsPaused) {
				self.cycle();
			}
		}

		/**
		 * Calculate SLIDEE representation of handle position.
		 *
		 * @param  {Int} handlePos
		 *
		 * @return {Int}
		 */
		function handleToSlidee(handlePos) {
			return Math.round(within(handlePos, hPos.start, hPos.end) / hPos.end * (pos.end - pos.start)) + pos.start;
		}

		/**
		 * Dragging initiator.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function dragInit(event) {
			var isTouch = event.type === 'touchstart',
				source = event.data.source,
				isSlidee = source === 'slidee';

			// Ignore other than left mouse button
			if (isTouch || event.which <= 1) {
				stopDefault(event);

				// Update a dragging object
				dragging.source   = source;
				dragging.$source  = $(event.target);
				dragging.init     = 0;
				dragging.released = 0;
				dragging.touch    = isTouch;
				dragging.initLoc  = (isTouch ? event.originalEvent.touches[0] : event)[o.horizontal ? 'pageX' : 'pageY'];
				dragging.initPos  = isSlidee ? pos.cur : hPos.cur;
				dragging.start    = +new Date();
				dragging.time     = 0;
				dragging.path     = 0;
				dragging.pathMin  = isSlidee ? -dragging.initLoc : -hPos.cur;
				dragging.pathMax  = isSlidee ? document[o.horizontal ? 'width' : 'height'] - dragging.initLoc : hPos.end - hPos.cur;

				// Add dragging class
				(isSlidee ? $slidee : $handle).addClass(o.draggedClass);

				// Bind dragging events
				$doc.on(isTouch ? dragTouchEvents : dragMouseEvents, dragHandler);
			}
		}

		/**
		 * Handler for dragging scrollbar handle or SLIDEE.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function dragHandler(event) {
			dragging.released = event.type === 'mouseup' || event.type === 'touchend';
			dragging.path     = within(
				(dragging.touch ? event.originalEvent[dragging.released ? 'changedTouches' : 'touches'][0] : event)[o.horizontal ? 'pageX' : 'pageY'] - dragging.initLoc,
				dragging.pathMin, dragging.pathMax
			);

			// Initialization
			if (!dragging.init && (Math.abs(dragging.path) > (dragging.touch ? 50 : 10) || dragging.source === 'handle')) {
				dragging.init = 1;
				if (dragging.source === 'slidee') {
					ignoreNextClick = 1;
				}

				// Pause ongoing cycle
				self.pause(1);

				// Disable click actions on source element, as they are unwelcome when dragging
				dragging.$source.on('click', function disableAction(event) {
					stopDefault(event, 1);
					if (dragging.source === 'slidee') {
						ignoreNextClick = 0;
					}
					dragging.$source.off('click', disableAction);
				});

				// Trigger moveStart event
				trigger('moveStart');
			}

			// Proceed when initialized
			if (dragging.init) {
				stopDefault(event);

				// Adjust path with a swing on mouse release
				if (dragging.released && dragging.source === 'slidee' && o.speed > 33) {
					dragging.path += dragging.path * 200 / (+new Date() - dragging.start);
				}

				slideTo(dragging.source === 'slidee' ? Math.round(dragging.initPos - dragging.path) : handleToSlidee(dragging.initPos + dragging.path));
			}

			// Cleanup and trigger :moveEnd event on release
			if (dragging.released) {
				$doc.off(dragging.touch ? dragTouchEvents : dragMouseEvents, dragHandler);
				(dragging.source === 'slidee' ? $slidee : $handle).removeClass(o.draggedClass);

				// Account for item snapping position adjustment.
				if (pos.cur === pos.dest) {
					trigger('moveEnd');
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
		self.set = function (name, value) {
			if ($.isPlainObject(name)) {
				$.extend(o, name);
			} else if (o.hasOwnProperty(name)) {
				o[name] = value;
			}
		};

		/**
		 * Registers callbacks.
		 *
		 * @param  {Mixed} name  Event name, or callbacks map.
		 * @param  {Mixed} fn    Callback, or an array of callback functions.
		 *
		 * @return {Void}
		 */
		self.on = function (name, fn) {
			// Callbacks map
			if (typeof name === 'object') {
				for (var key in name) {
					if (name.hasOwnProperty(key)) {
						self.on(key, name[key]);
					}
				}
			// Callbacks array
			} else if (fn instanceof Array) {
				for (var f = 0, fl = fn.length; f < fl; f++) {
					self.on(name, fn[f]);
				}
			// Callback
			} else if (typeof fn === 'function') {
				callbacks[name] = callbacks[name] || [];
				for (var i = 0, l = callbacks[name].length; i < l; i++) {
					// Abort if callback is already present
					if (callbacks[name][i] === fn) {
						return;
					}
				}
				callbacks[name].push(fn);
			}
		};

		/**
		 * Remove one or all callbacks.
		 *
		 * @param  {String} name Event name.
		 * @param  {Mixed}  fn   Callback, or an array of callback functions. Omit to remove all callbacks.
		 *
		 * @return {Void}
		 */
		self.off = function (name, fn) {
			if (callbacks[name]) {
				if (fn instanceof Array) {
					for (var f = 0, fl = fn.length; f < fl; f++) {
						self.off(name, fn[f]);
					}
				} else if (typeof fn === 'function') {
					for (var i = 0, l = callbacks[name].length; i < l; i++) {
						if (callbacks[name][i] === fn) {
							callbacks[name].splice(i, 1);
						}
					}
				} else {
					callbacks[name].length = 0;
				}
			}
		};

		/**
		 * Trigger callbacks for event.
		 *
		 * @param  {String} name Event name.
		 * @param  {Mixed}  argX Arguments passed to callback.
		 *
		 * @return {Void}
		 */
		function trigger(name, arg1, arg2, arg3, arg4) {
			// Common arguments for events
			switch (name) {
				case 'active':
					arg2 = arg1;
					arg1 = $items;
					break;

				case 'activePage':
					arg2 = arg1;
					arg1 = pages;
					break;

				default:
					arg4 = arg1;
					arg1 = pos;
					arg2 = $items;
					arg3 = rel;
			}

			if (callbacks[name]) {
				for (var i = 0, l = callbacks[name].length; i < l; i++) {
					callbacks[name][i].call(frame, arg1, arg2, arg3, arg4);
				}
			}

			if (o.domEvents && !parallax) {
				$frame.trigger(pluginName + ':' + name, [arg1, arg2, arg3, arg4]);
			}
		}

		/**
		 * Destroys plugin instance and everything it created.
		 *
		 * @return {Void}
		 */
		self.destroy = function () {
			// Unbind all events
			$doc
				.add($slidee)
				.add($scrollSource)
				.add($handle)
				.add($sb)
				.add($pb)
				.add($prevButton)
				.add($nextButton)
				.add($prevPageButton)
				.add($nextPageButton)
				.unbind('.' + namespace);

			// Remove plugin classes
			$prevButton
				.add($nextButton)
				.add($prevPageButton)
				.add($nextPageButton)
				.removeClass(o.disabledClass);

			if ($items) {
				$items.eq(rel.activeItem).removeClass(o.activeClass);
			}

			// Remove page items
			$pb.empty();

			if (!parallax) {
				// Unbind events from frame
				$frame.unbind('.' + namespace);
				// Reset SLIDEE and handle positions
				$slidee.add($handle).css(transform || (o.horizontal ? 'left' : 'top'), transform ? 'none' : 0);
				// Remove plugin from element data storage
				$.removeData(frame, namespace);
			}
		};

		/**
		 * Initialize plugin.
		 *
		 * @return {Object}
		 */
		self.init = function () {
			if (initialized) {
				return;
			}

			// Register callbacks map
			self.on(callbackMap);

			// Set required styles to elements
			if (!parallax) {
				$frame.css('overflow', 'hidden');
				if ($frame.css('position') === 'static') {
					$frame.css('position', 'relative');
				}
				$slidee.add($handle).css($.extend({ position: 'absolute' }, o.horizontal ? { left: 0 } : { top: 0 }));
			}
			if ($sb.css('position') === 'static') {
				$sb.css('position', 'relative');
			}

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
				$scrollSource.on('DOMMouseScroll.' + namespace + ' mousewheel.' + namespace, function (event) {
					// If there is no scrolling to be done, leave the default event alone
					if (pos.start === pos.end) {
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
						self.slideBy(isForward ? o.scrollBy : -o.scrollBy);
					}
				});
			}

			// Clicking on scrollbar navigation
			if (o.clickBar && $sb[0]) {
				$sb.on('click.' + namespace, function (event) {
					// Ignore other than left mouse button
					if (event.which <= 1) {
						stopDefault(event);

						// Calculate new handle position and sync SLIDEE to it
						slideTo(handleToSlidee((o.horizontal ? event.clientX - $sb.offset().left : event.clientY - $sb.offset().top) - handleSize / 2));
					}
				});
			}

			// Keyboard navigation
			if (o.keyboardNavBy) {
				$doc.bind('keydown.' + namespace, function (event) {
					switch (event.which) {
						// Left or Up
						case o.horizontal ? 37 : 38:
							stopDefault(event);
							self[o.keyboardNavBy === 'pages' ? 'prevPage' : 'prev']();
							break;

						// Right or Down
						case o.horizontal ? 39 : 40:
							stopDefault(event);
							self[o.keyboardNavBy === 'pages' ? 'nextPage' : 'next']();
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
				if (event.which <= 1 && this.parentNode === event.delegateTarget && !ignoreNextClick) {
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
			if (o.dragging) {
				$dragSource.on(dragInitEvents, { source: 'slidee' }, dragInit);
			}

			// Scrollbar dragging navigation
			if (o.dragHandle && $handle) {
				$handle.on(dragInitEvents, { source: 'handle' }, dragInit);
			}

			// Automatic cycling
			if (o.cycleBy && !parallax) {
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

			// Mark instance as initialized
			initialized = 1;

			// Return plugin instance
			return self;
		};
	}

	/**
	 * Crossbrowser reliable way to stop default event action.
	 *
	 * @param {Event} event     Event object.
	 * @param {Bool}  noBubbles Cancel event bubbling.
	 *
	 * @return {Void}
	 */
	function stopDefault(event, noBubbles) {
		event = event || w.event;

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

	// Expose class globally
	w[className] = Sly;

	// Extend jQuery
	$.fn[pluginName] = function (options, callbackMap) {
		var method, methodArgs;

		// Attributes logic
		if (!$.isPlainObject(options)) {
			if (typeof options === 'string' || options === false) {
				method = options === false ? 'destroy' : options;
				methodArgs = Array.prototype.slice.call(arguments, 1);
			}
			options = {};
		}

		// Apply plugin to all elements
		return this.each(function (i, element) {
			// Plugin call with prevention against multiple instantiations
			var plugin = $.data(element, namespace);

			if (!plugin && !method) {
				// Create a new plugin object if it doesn't exist yet
				plugin = $.data(element, namespace, new Sly(element, options, callbackMap).init());
			} else if (plugin && method) {
				// Call plugin method
				if (plugin[method]) {
					plugin[method].apply(plugin, methodArgs);
				}
			}
		});
	};

	// Default options
	$.fn[pluginName].defaults = {
		// Sly type
		horizontal: 0,    // Change to horizontal direction.
		itemNav:    null, // Item navigation type. Can be: basic, smart, centered, forceCentered.

		// Scrollbar
		scrollBar:     null, // Selector or DOM element for scrollbar container.
		dragHandle:    0,    // Whether the scrollbar handle should be dragable.
		dynamicHandle: 0,    // Scrollbar handle represents the relation between hidden and visible content.
		minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
		clickBar:      0,    // Enable navigation by clicking on scrollbar.
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
		dragging:      0,       // Enable navigation by dragging the SLIDEE.
		elasticBounds: 0,       // Stretch SLIDEE position limits when dragging past borders.
		speed:         0,       // Animations speed in milliseconds. 0 to disable animations.
		easing:        'swing', // Animations easing.
		scrollSource:  null,    // Selector or DOM element for catching the mouse wheel event. Default is FRAME.
		dragSource:    null,    // Selector or DOM element for catching the mouse dragging events. Default is FRAME.
		startAt:       0,       // Starting offset in pixels or items.
		keyboardNavBy: 0,       // Enable keyboard navigation by 'items' or 'pages'.
		domEvents:     0,       // Enable DOM events if you wish to use them instead of callbacks API (not recommended).

		// Classes
		draggedClass:  'dragged',  // Class for dragged elements (like SLIDEE or scrollbar handle).
		activeClass:   'active',   // Class for active items and pages.
		disabledClass: 'disabled'  // Class for disabled navigation elements.
	};
}(jQuery, window));