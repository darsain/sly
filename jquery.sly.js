/*!
 * jQuery Sly v0.9.7
 * https://github.com/Darsain/sly
 *
 * Development state, license not yet determined.
 */
/*jshint
	bitwise:false, camelcase:false, curly:true, eqeqeq:false, forin:false, immed:true, latedef:true, newcap:true,
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
		namespace = pluginName;

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
      childrenFilter = o.childrenFilter || '*',
			$slidee    = $frame.children(childrenFilter).eq(0),
			frameSize  = 0,
			slideeSize = 0,
			pos        = {
				cur: 0,
				max: 0,
				min: 0
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
			cycleIndex      = 0,
			cycleIsPaused   = 0,
			isDragging      = 0;

		/**
		 * (Re)Loading function.
		 *
		 * Populate arrays, set sizes, bind events, ...
		 *
		 * @public
		 *
		 * @return {Void}
		 */
		var load = this.reload = function () {
			// Local variables
			var ignoredMargin = 0,
				oldPos        = $.extend({}, pos);

			// Clear cycling timeout
			clearTimeout(cycleIndex);

			// Reset global variables
			frameSize  = o.horizontal ? $frame.width() : $frame.height();
			sbSize     = o.horizontal ? $sb.width() : $sb.height();
			slideeSize = o.horizontal ? $slidee.outerWidth() : $slidee.outerHeight();
			$items     = $slidee.children(childrenFilter);
			items      = [];
			pages      = [];

			// Set position limits & relatives
			pos.min = 0;
			pos.max = Math.max(slideeSize - frameSize, 0);
			rel.items = $items.length;

			// Sizes & offsets for item based navigations
			if (itemNav) {
				var marginStart  = getPx($items, o.horizontal ? 'marginLeft' : 'marginTop'),
					marginEnd    = getPx($items.slice(-1), o.horizontal ? 'marginRight' : 'marginBottom'),
					centerOffset = 0,
					paddingStart = getPx($slidee, o.horizontal ? 'paddingLeft' : 'paddingTop'),
					paddingEnd   = getPx($slidee, o.horizontal ? 'paddingRight' : 'paddingBottom'),
					areFloated   = $items.css('float') !== 'none';

				// Update ignored margin
				ignoredMargin = marginStart ? 0 : marginEnd;

				// Reset slideeSize
				slideeSize = 0;

				// Iterate through items
				$items.each(function (i, item) {
					// Item
					var $item        = $(item),
						itemSize     = o.horizontal ? $item.outerWidth(true) : $item.outerHeight(true),
						marginTop    = getPx($item, 'marginTop'),
						marginBottom = getPx($item, 'marginBottom'),
						marginLeft   = getPx($item, 'marginLeft'),
						marginRight  = getPx($item, 'marginRight'),
						itemObj = {
							size: itemSize,
							offStart: slideeSize - (!i || o.horizontal ? 0 : marginTop),
							offCenter: slideeSize - Math.round(frameSize / 2 - itemSize / 2),
							offEnd: slideeSize - frameSize + itemSize - (marginStart ? 0 : marginRight),
							margins: {
								top: marginTop,
								bottom: marginBottom,
								left: marginLeft,
								right: marginRight
							}
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
						if (marginBottom && marginTop && i > 0) {
							slideeSize -= Math.min(marginTop, marginBottom);
						}
					}

					// Things to be done at last item
					if (i === $items.length - 1) {
						slideeSize += paddingEnd;
					}

					// Add item object to items array
					items.push(itemObj);
				});

				// Resize slidee
				$slidee[0].style[o.horizontal ? 'width' : 'height'] = slideeSize + 'px';

				// Adjust slidee size for last margin
				slideeSize -= ignoredMargin;

				// Set limits
				pos.min = centerOffset;
				pos.max = forceCenteredNav ? items[items.length - 1].offCenter : Math.max(slideeSize - frameSize, 0);

				// Fix overflowing activeItem
				if (rel.activeItem >= items.length) {
					self.activate(items.length - 1);
				}
			}

			// Update relative positions
			updateRelatives();

			// Scrollbar
			if ($handle) {
				// Stretch scrollbar handle to represent the visible area
				handleSize = o.dynamicHandle ? Math.round(sbSize * frameSize / slideeSize) : o.horizontal ? $handle.width() : $handle.height();
				handleSize = Math.min(Math.max(o.minHandleSize, handleSize), sbSize);
				hPos.max   = sbSize - handleSize;

				// Resize handle
				$handle[0].style[o.horizontal ? 'width' : 'height'] = handleSize + 'px';
			}

			// Pages
			var tempPagePos = 0,
				pagesHtml   = '',
				pageIndex   = 0;

			// Populate pages array
			if (forceCenteredNav) {
				pages = $.map(items, function (o) {
					return o.offCenter;
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
			if ($pb.length) {
				for (var i = 0; i < pages.length; i++) {
					pagesHtml += o.pageBuilder(pageIndex++);
				}

				// Bind page navigation, append to pagesbar, and save to $pages variable
				$pages = $(pagesHtml).bind('click.' + namespace, function () {
					self.activatePage($pages.index(this));
				}).appendTo($pb.empty());
			}

			// Bind activating to items
			$items.unbind('.' + namespace).bind('mouseup.' + namespace, function (event) {
				if (event.which === 1 && !isDragging) {
					self.activate(this);
				}
			});

			// Fix overflowing
			if (pos.cur < pos.min) {
				slide(pos.min);
			}
			if (pos.cur > pos.max) {
				slide(pos.max);
			}

			// Extend relative variables object with some useful info
			rel.pages      = pages.length;
			rel.slideeSize = slideeSize;
			rel.frameSize  = frameSize;
			rel.sbSize     = sbSize;
			rel.handleSize = handleSize;

			// Synchronize scrollbar
			syncBars(0);

			// Disable buttons
			disableButtons();

			// Automatic cycling
			if (o.cycleBy) {
				var pauseEvents = 'mouseenter.' + namespace + ' mouseleave.' + namespace;

				// Pause on hover
				if (o.pauseOnHover) {
					$frame.unbind(pauseEvents).bind(pauseEvents, function (event) {
						if (!cycleIsPaused) {
							self[event.type === 'mouseenter' ? 'pause' : 'cycle'](1);
						}
					});
				}

				// Initiate cycling
				if (!o.startPaused) {
					self.cycle();
				}
			}

			// Trigger :load event
			$frame.trigger(pluginName + ':load', [$.extend({}, pos, {
				old: oldPos
			}), $items, rel]);
		};

		/**
		 * Slide the SLIDEE.
		 *
		 * @private
		 *
		 * @param {Int}  newPos New slidee position.
		 * @param {Bool} align  Whether to align elements to the frame border.
		 * @param {Int}  speed  Animation speed in milliseconds.
		 *
		 * @return {Void}
		 */
		function slide(newPos, align, speed) {
			speed = isNumber(speed) ? speed : o.speed;

			// Align items
			if (align && itemNav) {
				var tempRel = getRelatives(newPos);

				if (centeredNav) {
					newPos = items[tempRel.centerItem].offCenter;
					self[forceCenteredNav ? 'activate' : 'toCenter'](tempRel.centerItem, 1);
				} else if (newPos > pos.min && newPos < pos.max) {
					newPos = items[tempRel.firstItem].offStart;
				}
			}

			// Fix overflowing position
			if (!isDragging || !o.elasticBounds) {
				newPos = Math.max(Math.min(newPos, pos.max), pos.min);
			}

			// Stop if position has not changed
			if (newPos === pos.cur) {
				return;
			} else {
				pos.cur = newPos;
			}

			// Update relative positions
			updateRelatives();

			// Add disabled classes
			disableButtons();

			// Halt ongoing animations
			stop();

			// Trigger :move & :nav event
			$frame.trigger(pluginName + ':move', [pos, $items, rel]);
			if (!isDragging) {
				$frame.trigger(pluginName + ':nav', [pos, $items, rel]);
			}

			var newProp = o.horizontal ? { left: -pos.cur + 'px' } : { top: -pos.cur + 'px' };

			// Slidee move
			if (speed > 16) {
				$slidee.animate(newProp, speed, isDragging ? 'swing' : o.easing, function () {
					// Trigger :moveEnd event
					if (!isDragging) {
						$frame.trigger(pluginName + ':moveEnd', [pos, $items, rel]);
					}
				});
			} else {
				$slidee.css(newProp);

				// Trigger :moveEnd event
				if (!isDragging) {
					$frame.trigger(pluginName + ':moveEnd', [pos, $items, rel]);
				}
			}
		}

		/**
		 * Synchronizes scrollbar & pagesbar positions with the SLIDEE.
		 *
		 * @private
		 *
		 * @param {Int} speed Animation speed for scrollbar synchronization.
		 *
		 * @return {Void}
		 */
		function syncBars(speed) {
			syncScrollbar(speed);
			syncPagesbar();
		}

		/**
		 * Synchronizes scrollbar with the SLIDEE.
		 *
		 * @private
		 *
		 * @param {Int} speed Animation speed for scrollbar synchronization.
		 *
		 * @return {Void}
		 */
		function syncScrollbar(speed) {
			if ($handle) {
				hPos.cur = Math.round((pos.cur - pos.min) / (pos.max - pos.min) * hPos.max);
				hPos.cur = Math.max(Math.min(hPos.cur, hPos.max), hPos.min);
				$handle.stop().animate(o.horizontal ? { left: hPos.cur + 'px' } : { top: hPos.cur + 'px' }, isNumber(speed) ? speed : o.speed, o.easing);
			}
		}

		/**
		 * Synchronizes pagesbar with SLIDEE.
		 *
		 * @private
		 *
		 * @return {Void}
		 */
		function syncPagesbar() {
			if (!$pages.length) {
				return;
			}

			// Classes
			$pages.removeClass(o.activeClass).eq(rel.activePage).addClass(o.activeClass);
		}

		/**
		 * Activate previous item.
		 *
		 * @public
		 *
		 * @return {Void}
		 */
		this.prev = function () {
			self.activate(rel.activeItem - 1);
		};

		/**
		 * Activate next item.
		 *
		 * @public
		 *
		 * @return {Void}
		 */
		this.next = function () {
			self.activate(rel.activeItem + 1);
		};

		/**
		 * Activate previous page.
		 *
		 * @public
		 *
		 * @return {Void}
		 */
		this.prevPage = function () {
			self.activatePage(rel.activePage - 1);
		};

		/**
		 * Activate next page.
		 *
		 * @public
		 *
		 * @return {Void}
		 */
		this.nextPage = function () {
			self.activatePage(rel.activePage + 1);
		};

		/**
		 * Stop ongoing animations.
		 *
		 * @private
		 *
		 * @return {Void}
		 */
		function stop() {
			$slidee.add($handle).stop();
		}

		/**
		 * Animate element or the whole SLIDEE to the start of the frame.
		 *
		 * @public
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 *
		 * @return {Void}
		 */
		this.toStart = function (item) {
			if (itemNav) {
				var index = getIndex(item);

				if (item === undefined) {
					slide(pos.min, 1);
				} else if (index !== -1) {
					// You can't align items to the start of the frame when centeredNav is enabled
					if (centeredNav) {
						return;
					}

					if (index !== -1) {
						slide(items[index].offStart);
					}
				}
			} else {
				if (item === undefined) {
					slide(pos.min);
				} else {
					var $item = $slidee.find(item).eq(0);

					if ($item.length) {
						var offset = o.horizontal ? $item.offset().left - $slidee.offset().left : $item.offset().top - $slidee.offset().top;
						slide(offset);
					}
				}
			}

			syncBars();
		};

		/**
		 * Animate element or the whole SLIDEE to the end of the frame.
		 *
		 * @public
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 *
		 * @return {Void}
		 */
		this.toEnd = function (item) {
			if (itemNav) {
				var index = getIndex(item);

				if (item === undefined) {
					slide(pos.max, 1);
				} else if (index !== -1) {
					// You can't align items to the end of the frame when centeredNav is enabled
					if (centeredNav) {
						return;
					}

					slide(items[index].offEnd);
				}
			} else {
				if (item === undefined) {
					slide(pos.max);
				} else {
					var $item = $slidee.find(item).eq(0);

					if ($item.length) {
						var offset = o.horizontal ? $item.offset().left - $slidee.offset().left : $item.offset().top - $slidee.offset().top;
						slide(offset - frameSize + $item[o.horizontal ? 'outerWidth' : 'outerHeight']());
					}
				}
			}

			syncBars();
		};

		/**
		 * Animate element or the whole SLIDEE to the center of the frame.
		 *
		 * @public
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0. Omitting will animate SLIDEE.
		 *
		 * @return {Void}
		 */
		this.toCenter = function (item) {
			if (itemNav) {
				var index = getIndex(item);

				if (item === undefined) {
					slide(Math.round(pos.max / 2 + pos.min / 2), 1);
				} else if (index !== -1) {
					slide(items[index].offCenter);
					if (forceCenteredNav) {
						self.activate(index, 1);
					}
				}
			} else {
				if (item === undefined) {
					slide(Math.round(pos.max / 2));
				} else {
					var $item = $slidee.find(item).eq(0);

					if ($item.length) {
						var offset = o.horizontal ? $item.offset().left - $slidee.offset().left : $item.offset().top - $slidee.offset().top;
						slide(offset - frameSize / 2 + $item[o.horizontal ? 'outerWidth' : 'outerHeight']() / 2);
					}
				}
			}

			syncBars();
		};

		/**
		 * Get the index of an item in SLIDEE.
		 *
		 * @private
		 *
		 * @param {Mixed} item Item DOM element, or index starting at 0.
		 *
		 * @return {Int}
		 */
		function getIndex(item) {
			return isNumber(item) ? item < 0 ? 0 : item > items.length - 1 ? items.length - 1 : item : item === undefined ? -1 : $items.index(item);
		}

		/**
		 * Parse style to pixels.
		 *
		 * @private
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
		 * @public
		 *
		 * @param {mixed} item         Item DOM element, or index starting at 0.
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

			// Add active class to the active element
			$items.removeClass(o.activeClass).eq(index).addClass(o.activeClass);

			// Trigget :active event if a new element is being activated
			if (index !== oldActive) {
				$items.eq(index).trigger(pluginName + ':active', [$items, rel]);
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
					}
				}
			}

			// Add disabled classes
			disableButtons();
		};


		/**
		 * Activates a page.
		 *
		 * @public
		 *
		 * @param {Int} index Page index, starting from 0.
		 *
		 * @return {Void}
		 */
		this.activatePage = function (index) {
			// Fix overflowing
			index = Math.max(Math.min(index, pages.length - 1), 0);
			slide(pages[index], itemNav);
			syncBars();
		};

		/**
		 * Return relative positions of items based on their visibility within FRAME.
		 *
		 * @private
		 *
		 * @param {Int} slideePos Position of SLIDEE.
		 *
		 * @return {Void}
		 */
		function getRelatives(slideePos) {
			slideePos = slideePos || pos.cur;

			var newRel = {},
				centerOffset = forceCenteredNav ? 0 : frameSize / 2;

			// Determine active page
			for (var p = 0; p < pages.length; p++) {
				if (slideePos >= pos.max || p === pages.length - 1) {
					newRel.activePage = pages.length - 1;
					break;
				}

				if (slideePos <= pages[p] + centerOffset) {
					newRel.activePage = p;
					break;
				}
			}

			// Relative item indexes
			if (itemNav) {
				var first = false,
					last = false,
					center = false;

				/* From start */
				for (var i = 0; i < items.length; i++) {
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
				newRel.firstItem  = isNumber(first) ? first : 0;
				newRel.centerItem = isNumber(center) ? center : newRel.firstItem;
				newRel.lastItem   = isNumber(last) ? last : newRel.centerItem;
			}

			return newRel;
		}

		/**
		 * Update object with relative positions.
		 *
		 * @private
		 *
		 * @return {Void}
		 */
		function updateRelatives() {
			$.extend(rel, getRelatives(pos.cur));
		}

		/**
		 * Disable buttons when needed.
		 *
		 * Adds disabledClass, and when the button is <button> or <input>, activates :disabled state.
		 *
		 * @private
		 *
		 * @return {Void}
		 */
		function disableButtons() {
			// Item navigation
			if (itemNav) {
				var isFirstItem = rel.activeItem === 0,
					isLastItem  = rel.activeItem >= items.length - 1;

				if ($prevButton.is('button,input')) {
					$prevButton.prop('disabled', isFirstItem);
				}

				if ($nextButton.is('button,input')) {
					$nextButton.prop('disabled', isLastItem);
				}

				$prevButton[isFirstItem ? 'removeClass' : 'addClass'](o.disabledClass);
				$nextButton[isLastItem ? 'removeClass' : 'addClass'](o.disabledClass);
			}

			// Pages navigation
			if ($pages.length) {
				var isStart = pos.cur <= pos.min,
					isEnd = pos.cur >= pos.max;

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

		/**
		 * Start cycling.
		 *
		 * @public
		 *
		 * @return {Void}
		 */
		this.cycle = function () {
			if (cycleIndex || !o.cycleBy || o.cycleBy === 'items' && !items.length) {
				return;
			}

			// Trigger :cycleStart event
			$frame.trigger(pluginName + ':cycleStart', [pos, $items, rel]);

			// Cycling loop
			(function loop() {
				if (!o.cycleInterval) {
					return;
				}

				cycleIndex = setTimeout(function () {
					if (!isDragging) {
						switch (o.cycleBy) {
							case 'items':
								self.activate(rel.activeItem >= items.length - 1 ? 0 : rel.activeItem + 1);
								break;

							case 'pages':
								self.activatePage(rel.activePage >= pages.length - 1 ? 0 : rel.activePage + 1);
								break;
						}
					}

					// Trigger :cycle event
					$frame.trigger(pluginName + ':cycle', [pos, $items, rel]);

					// Cycle the cycle!
					loop();
				}, o.cycleInterval);
			}());
		};

		/**
		 * Pause cycling.
		 *
		 * @public
		 *
		 * @param {Bool} soft Soft pause intended for pauseOnHover - won't set cycleIsPaused state to true.
		 *
		 * @return {Void}
		 */
		this.pause = function (soft) {
			if (cycleIndex) {
				if (!soft) {
					cycleIsPaused = true;
				}

				cycleIndex = clearTimeout(cycleIndex);

				// Trigger :cyclePause event
				$frame.trigger(pluginName + ':cyclePause', [pos, $items, rel]);
			}
		};

		/**
		 * Toggle cycling
		 *
		 * @public
		 *
		 * @return {Void}
		 */
		this.toggle = function () {
			self[cycleIndex ? 'pause' : 'cycle']();
		};

		/**
		 * Crossbrowser reliable way to stop default event action.
		 *
		 * @private
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
		 * @public
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
		 * @public
		 *
		 * @return {Void}
		 */
		this.destroy = function () {
			// Unbind all events
			$frame
				.add(document)
				.add($slidee)
				.add($items)
				.add($scrollSource)
				.add($handle)
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

		/**
		 * Check if variable is a number.
		 *
		 * @private
		 *
		 * @param {Mixed} value
		 *
		 * @return {Boolean}
		 */
		function isNumber(value) {
			return !isNaN(parseFloat(value)) && isFinite(value);
		}

		/** Constructor */
		(function () {
			var doc = $(document),
				dragEvents = 'mousemove.' + namespace + ' mouseup.' + namespace;

			// Extend options
			o = $.extend({}, $.fn[pluginName].defaults, o);

			// Set required styles to elements
			$frame.css('overflow', 'hidden' );
			if ($frame.css('position') === 'static') {
				$frame.css('position', 'relative');
			}
			if ($sb.css('position') === 'static') {
				$sb.css('position', 'relative');
			}
			$slidee.add($handle).css($.extend({ position: 'absolute'}, o.horizontal ? { left: 0 } : { top: 0 }));

			// Load
			load();

			// Activate requested position
			if (itemNav) {
				self.activate(o.startAt);
			} else {
				slide(o.startAt);
			}

			// Sync scrollbar & pages
			syncBars();

			// Scrolling navigation
			if (o.scrollBy) {
				$scrollSource.bind('DOMMouseScroll.' + namespace + ' mousewheel.' + namespace, function (event) {
					// If there is no scrolling to be done, leave the default event alone
					if (pos.min === pos.max) {
						return;
					}

					stopDefault(event, 1);

					var orgEvent = event.originalEvent,
						delta = 0,
						isForward, nextItem;

					// Old school scrollwheel delta
					if (orgEvent.wheelDelta) {
						delta = orgEvent.wheelDelta / 120;
					}
					if (orgEvent.detail) {
						delta = -orgEvent.detail / 3;
					}

					isForward = delta < 0;

					if (itemNav) {
						nextItem = getIndex((centeredNav ? forceCenteredNav ? rel.activeItem : rel.centerItem : rel.firstItem) + (isForward ? o.scrollBy : -o.scrollBy));
						self[centeredNav ? forceCenteredNav ? 'activate' : 'toCenter' : 'toStart'](nextItem);
					} else {
						slide(pos.cur + (isForward ? o.scrollBy : -o.scrollBy));
					}

					syncBars();
				});
			}

			// Keyboard navigation
			if (o.keyboardNav) {
				doc.bind('keydown.' + namespace, function (event) {
					switch (event.which) {
						// Left or Up
						case o.horizontal ? 37 : 38:
							stopDefault(event);
							self[o.keyboardNavByPages ? 'prevPage' : 'prev']() ;
							break;

						// Right or Down
						case o.horizontal ? 39 : 40:
							stopDefault(event);
							self[o.keyboardNavByPages ? 'nextPage' : 'next']() ;
							break;
					}
				});
			}

			// Navigation buttons
			if (o.prev) {
				$prevButton.bind('click.' + namespace, function (event) {
					stopDefault(event);
					self.prev();
				});
			}
			if (o.next) {
				$nextButton.bind('click.' + namespace, function (event) {
					stopDefault(event);
					self.next();
				});
			}
			if (o.prevPage) {
				$prevPageButton.bind('click.' + namespace, function (event) {
					stopDefault(event);
					self.prevPage();
				});
			}
			if (o.nextPage) {
				$nextPageButton.bind('click.' + namespace, function (event) {
					stopDefault(event);
					self.nextPage();
				});
			}

			// Dragging navigation
			if (o.dragContent) {
				$dragSource.bind('mousedown.' + namespace, function (event) {
					// Ignore other than left mouse button
					if (event.which !== 1) {
						return;
					}

					stopDefault(event);

					var leftInit = event.clientX,
						topInit  = event.clientY,
						posInit  = pos.cur,
						start    = +new Date(),
						srcEl    = event.target,
						isInitialized = 0;

					// Add dragging class
					$slidee.addClass(o.draggedClass);

					// Stop potential ongoing animations
					stop();

					// Bind dragging events
					doc.bind(dragEvents, function (event) {

						var released = event.type === 'mouseup',
							path     = o.horizontal ? event.clientX - leftInit : event.clientY - topInit,
							newPos   = posInit - path;

						// Initialized logic
						if (!isInitialized && Math.abs(path) > 10) {
							isInitialized = 1;
console.log('asdsa', path);
							// Trigger :dragStart event
							$slidee.trigger(pluginName + ':dragStart', [pos]);
						}

						// Limits & Elastic bounds
						if (newPos > pos.max) {
							newPos = o.elasticBounds ? pos.max + (newPos - pos.max) / 6 : pos.max;
						} else if (newPos < pos.min) {
							newPos = o.elasticBounds ? pos.min + (newPos - pos.min) / 6 : pos.min;
						}

						// Adjust newPos with easing on content release
						if (released && o.speed > 16) {
							// How long was the dragging
							var time  = +new Date() - start,
								swing = time < 300 ? Math.ceil(Math.pow(6 / (time / 300), 2) * Math.abs(path) / 120) : 0;
							newPos += path > 0 ? -swing : swing;
						}

						// Drag only when isInitialized
						if (!isInitialized) {
							return;
						}

						stopDefault(event);

						// Stop default click action on source element
						if (srcEl) {
							$(srcEl).bind('click.' + namespace, function stopMe(event) {
								stopDefault(event, 1);
								$(this).unbind('click.' + namespace, stopMe);
							});

							srcEl = 0;
						}

						// Dragging state
						isDragging = !released;

						// Animage, sync bars, and align
						slide(newPos, released, released ? o.speed : 0);
						syncBars(released ? null : 0);

						// Trigger :drag event
						if (isInitialized) {
							$slidee.trigger(pluginName + ':drag', [pos]);
						}

						// Cleanup and Trigger :dragEnd event
						if (released) {
							doc.unbind(dragEvents);
							$slidee.removeClass(o.draggedClass);
							$slidee.trigger(pluginName + ':dragEnd', [pos]);
						}
					});
				});
			}

			// Scrollbar dragging navigation
			if ($handle && o.dragHandle) {
				$handle.bind('mousedown.' + namespace, function (event) {
					// Ignore other than left mouse button
					if (event.which !== 1) {
						return;
					}

					stopDefault(event);

					var leftInit = event.clientX,
						topInit  = event.clientY,
						posInit  = hPos.cur,
						pathMin  = -hPos.cur,
						pathMax  = hPos.max - hPos.cur,
						nextDrag = 0;

					// Add dragging class
					$handle.addClass(o.draggedClass);

					// Stop potential ongoing animations
					stop();

					// Bind dragging events
					doc.bind(dragEvents, function (event) {
						stopDefault(event);

						var released = event.type === 'mouseup',
							path     = o.horizontal ? event.clientX - leftInit : event.clientY - topInit,
							newPos   = posInit + path,
							time     = +new Date();

						// Dragging state
						isDragging = !released;

						// Unbind events and remove classes when released
						if (released) {
							doc.unbind(dragEvents);
							$handle.removeClass(o.draggedClass);
						}

						// Execute only moves within path limits
						if (path < pathMax + 5 && path > pathMin - 5 || released) {
							// Fix overflows
							hPos.cur = Math.max(Math.min(newPos, hPos.max), hPos.min);

							// Move handle
							$handle.stop()[0].style[o.horizontal ? 'left' : 'top'] = hPos.cur + 'px';

							// Trigger :dragStart event
							if (!nextDrag) {
								$handle.trigger(pluginName + ':dragStart', [hPos]);
							}

							// Trigger :drag event
							$handle.trigger(pluginName + ':drag', [hPos]);

							// Trigger :dragEnd event
							if (released) {
								$handle.trigger(pluginName + ':dragEnd', [hPos]);
							}

							// Throttle sync interval -> smoother animations, lower CPU load
							if (nextDrag <= time || released || path > pathMax || path < pathMin) {
								nextDrag = time + 50;

								// Synchronize slidee position
								slide(Math.round(hPos.cur / hPos.max * (pos.max - pos.min)) + pos.min, released, released ? o.speed : 50);
							}

							// Sync pagesbar
							syncPagesbar();
						}
					});
				});
			}
		}());
	}

	// jQuery plugin extension
	$.fn[pluginName] = function (options, returnInstance) {

		var method = false,
			methodArgs, instance;

		// Basic attributes logic
		if (typeof options !== 'undefined' && !$.isPlainObject(options)) {
			method = options === false ? 'destroy' : options;
			methodArgs = arguments;
			Array.prototype.shift.call(methodArgs);
		}

		// Apply requested actions on all elements
		this.each(function (i, element) {

			// Plugin call with prevention against multiple instantiations
			var plugin = $.data(element, namespace);

			if (plugin && method) {
				// Call plugin method
				if (plugin[method]) {
					plugin[method].apply(plugin, methodArgs);
				}
			} else if (!plugin && !method) {
				// Create a new plugin object if it doesn't exist yet
				plugin = $.data(element, namespace, new Plugin(element, options));
			}

			// Register plugin instance for a first element in set
			if (!instance) {
				instance = plugin;
			}
		});

		// Return chainable jQuery object, or a plugin instance
		return returnInstance && !method ? instance : this;
	};

	// Default options
	$.fn[pluginName].defaults = {
		// Sly direction
		horizontal: 0, // Change to horizontal direction.
		itemNav:    0, // Item navigation type. Can be: basic, smart, centered, forceCentered.

		// Scrollbar
		scrollBar:     null, // Selector or DOM element for scrollbar container.
		dynamicHandle: 1,    // Scrollbar handle represents the relation between hidden and visible content.
		dragHandle:    1,    // Whether the scrollbar handle should be dragable.
		minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.

		// Pagesbar
		pagesBar:    null, // Selector or DOM element for pages bar container.
		pageBuilder:       // Page item markup generator.
			function (index) {
				return '<li>' + (index + 1) + '</li>';
			},

		// Navigation buttons
		prev:     null, // Selector or DOM element for "previous item" button.
		next:     null, // Selector or DOM element for "next item" button.
		prevPage: null, // Selector or DOM element for "previous page" button.
		nextPage: null, // Selector or DOM element for "next page" button.

		// Automated cycling
		cycleBy:       0,    // Enable automatic cycling. Can be: items, pages.
		cycleInterval: 5000, // Delay between cycles in milliseconds.
		pauseOnHover:  1,    // Dause cycling when mouse hovers over frame
		startPaused:   0,    // Whether to start in paused sate.

		// Mixed options
		scrollBy:      0,       // Number of pixels/items for one mouse scroll event. 0 to disable.
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