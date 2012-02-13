/*!
 * jQuery Sly v1.0.0
 * https://github.com/Darsain/sly
 *
 * Configurable scrolling/sliding simulation for DOM elements.
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
;(function($, undefined){

	// Plugin names
	var pluginName = 'sly',
		pluginPrefix = 'plugin_';


	/**
	 * Plugin class
	 *
	 * @class
	 * @param {Element} frame DOM element of sly container
	 * @param {Object}  o Object with plugin options
	 */
	function Plugin( frame, o ){

		/** @var {Object} Alias for this */
		var self = this;

		// Frame variables
		var $frame = $(frame),
			$slidee = $frame.children().eq(0),
			frameSize = 0,
			slideeSize = 0,
			pos = {
				cur: 0,
				max: 0,
				min: 0
			},

		// Scrollbar variables
			$sb = $(o.scrollBar),
			$handle = $sb.length ? $sb.children().eq(0) : 0,
			sbSize = 0,
			handleSize = 0,
			hPos = {
				cur: 0,
				max: 0,
				min: 0
			},

		// Pagesbar variables
			$pb = $(o.pagesBar),
			$pages = 0,
			pages = [],

		// Other variables
			$items = 0,
			items = [],
			rel = {
				firstItem: 0,
				lastItem: 1,
				centerItem: 1,
				activeItem: 0,
				activePage: 0,
				items: 0,
				pages: 0
			},
			$scrollSource = o.scrollSource ? $( o.scrollSource ) : $frame,
			$prevButton = $(o.prev),
			$nextButton = $(o.next),
			$prevPageButton = $(o.prevPage),
			$nextPageButton = $(o.nextPage),
			isDragging = 0,
			callbacks = {};


		/**
		 * (Re)Loading function
		 *
		 * Populates arrays, sets sizes, binds events, ...
		 *
		 * @public
		 */
		this.reload = function(){

			// Reset global variables
			frameSize = o.horizontal ? $frame.width() : $frame.height();
			sbSize = o.horizontal ? $sb.width() : $sb.height();
			slideeSize = o.horizontal ? $slidee.outerWidth() : $slidee.outerHeight();
			$items = $slidee.children();
			items = [];
			pages = [];

			// Set position limits & relatives
			pos.min = 0;
			pos.max = slideeSize - frameSize;
			rel.items = $items.length;

			// Sizes & offsets logic, but only when needed
			if( o.byItems ){

				var marginStart = getPx( $items, o.horizontal ? 'marginLeft' : 'marginTop' ),
					marginEnd = marginStart ? getPx( $items.slice(-1), o.horizontal ? 'marginRight' : 'marginBottom' ) : 0,
					centerOffset = 0,
					paddingStart = getPx( $slidee, o.horizontal ? 'paddingLeft' : 'paddingTop' ),
					paddingEnd = getPx( $slidee, o.horizontal ? 'paddingRight' : 'paddingBottom' ),
					areFloated = $items.css('float') != 'none';

				// Reset slideeSize
				slideeSize = 0;

				// Itare through items
				$items.each(function(i,e){

					// Item
					var item = $(e),
						itemSize = o.horizontal ? item.outerWidth(true) : item.outerHeight(true),
						marginTop    = getPx( item, 'marginTop' ),
						marginBottom = getPx( item, 'marginBottom'),
						marginLeft   = getPx( item, 'marginLeft'),
						marginRight  = getPx( item, 'marginRight');
						itemObj = {
							size: itemSize,
							offStart: slideeSize - ( !i || o.horizontal ? 0 : marginTop ),
							offCenter: slideeSize - Math.round( frameSize / 2 - itemSize / 2 ),
							offEnd: slideeSize - frameSize + itemSize - ( marginStart ? 0 : marginRight ),
							margins: {
								top:    marginTop,
								bottom: marginBottom,
								left:   marginLeft,
								right:  marginRight
							}
						};

					// Account for centerOffset & slidee padding
					if( !i ){

						centerOffset = -( o.centerActive ? Math.round( frameSize / 2 - itemSize / 2 ) : 0 ) + paddingStart;
						slideeSize += paddingStart;

					}

					// Increment slidee size for size of the active element
					slideeSize += itemSize;

					// Try to account for vertical margin collapsing in vertical mode
					// It's not bulletproof, but should work in 99% of cases
					if( !o.horizontal && !areFloated ){

						// Subtract smaller margin, but only when top margin is not 0, and this is not the first element
						if( marginBottom && marginTop && i > 0 ){
							slideeSize -= marginTop < marginBottom ? marginTop : marginBottom;
						}

					}

					// Things to be done at last item
					if( i == $items.length - 1 ){

						slideeSize += paddingEnd + marginEnd;
					}

					// Add item object to items array
					items.push(itemObj);

				});

				// Adjust position limits
				pos.min = centerOffset;
				pos.max = slideeSize - ( o.centerActive ? Math.round( frameSize / 2 + items[items.length-1].size / 2 ) : frameSize ) - marginEnd;

				// Resize slidee
				$slidee.css( o.horizontal ? { width: slideeSize+'px' } : { height: slideeSize+'px' } );

				// Fix overflowing activeItem
				if( rel.activeItem >= items.length ) self.activate( items.length-1 );

			}

			// Populate pages array
			var tempPagePos = 0;
			while( tempPagePos - frameSize <= pos.max ){

				pages.push( tempPagePos > pos.max ? pos.max : tempPagePos );
				tempPagePos += frameSize;

			}
			rel.pages = pages.length;

			// Assign relative position indexes
			assignRelatives();

			// Scrollbar
			if( $handle ){

				// Stretch scrollbar handle to represent the visible area
				handleSize = o.dynamicHandle ? Math.round( sbSize * frameSize / slideeSize ) : o.horizontal ? $handle.width() : $handle.height();
				handleSize = handleSize > sbSize ? sbSize : handleSize;
				hPos.max = sbSize - handleSize;

				// Resize handle
				$handle.css( o.horizontal ? { width: handleSize+'px' } : { height: handleSize+'px' } );

			}

			// Pagesbar
			if( $pb.length && !o.activeCenter ){

				var output = '';
				for( var i = 0; i < pages.length; i++ ){
					output += o.pageBuilder( i );
				}

				// Bind page navigation, append to pagesbar, and save to $pages variable
				$pages = $(output).bind('click.' + pluginName, function(){

					activatePage( $pages.index(this) );

				}).appendTo( $pb.empty() );

			}

			// Bind activating to items
			$items.unbind('.' + pluginName).bind('mouseup.' + pluginName + ' sly:active.' + pluginName, function(e){

				!e.button && !isDragging && self.activate( this );

			});

			// Fix overflowing
			pos.cur < pos.min && slide( pos.min );
			pos.cur > pos.max && slide( pos.max );

			// Synchronize scrollbar
			syncBars(0);

			// Disable buttons
			disableButtons();

			// Trigger sly:load event
			executeCallbacks('onLoad', $frame, [ pos, $items, rel ] );

		}


		/**
		 * Slide the slidee
		 *
		 * @private
		 *
		 * @param {Int} newPos New slidee position in relation to frame
		 * @param {Int} speed  Animation speed in milliseconds
		 * @param {Bool} align  Whetner to Align elements to the frame border
		 */
		function slide( newPos, speed, align ){

			// No sliding if not needed
			if( frameSize >= slideeSize ) newPos = pos.min;

			// Align items
			if( align && o.byItems ){

				tempRel = getRelatives( newPos );

				if( o.centerActive ){

					newPos = items[tempRel.centerItem].offCenter;
					self.activate( tempRel.centerItem, 1 );

				} else if( newPos > pos.min && newPos < pos.max ) {

					newPos = items[tempRel.firstItem].offStart;

				}

			}

			// Fix overflowing position
			if( !isDragging || !o.elasticBounds ){
				newPos = newPos < pos.min ? pos.min : newPos;
				newPos = newPos > pos.max ? pos.max : newPos;
			}

			// Stop if position has not changed
			if( newPos == pos.cur ) return;
			else pos.cur = newPos;

			// Reassign relative indexes
			assignRelatives();

			// Add disabled classes
			disableButtons();

			// halt ongoing animations
			stop();

			// Callback
			!isDragging && executeCallbacks( 'onMove', $frame, [ pos, $items, rel ] );

			// Sly move
			$slidee.animate( o.horizontal ? { left: -pos.cur+'px' } : { top: -pos.cur+'px' }, isNumber( speed ) ? speed : o.speed, o.easing, function(e){

				!isDragging && executeCallbacks( 'onMoveEnd', $frame, [ pos, $items, rel ] );

			});

		}


		/**
		 * Synchronizes scrollbar & pagesbar positions with the slidee
		 *
		 * @private
		 *
		 * @param {Int} speed Animation speed for scrollbar synchronization
		 */
		function syncBars( speed ){

			// Scrollbar synchronization
			if( $handle ){

				hPos.cur = Math.round( ( pos.cur - pos.min ) / ( pos.max - pos.min ) * hPos.max );
				hPos.cur = hPos.cur < hPos.min ? hPos.min : hPos.cur > hPos.max ? hPos.max : hPos.cur;
				$handle.stop().animate( o.horizontal ? { left: hPos.cur+'px' } : { top: hPos.cur+'px' }, isNumber(speed) ? speed : o.speed, o.easing );

			}

			// Pagesbar synchronization
			syncPages();

		}


		/**
		 * Synchronizes pagesbar
		 *
		 * @private
		 */
		function syncPages(){

			if( !$pages.length ) return;

			// Classes
			$pages.removeClass(o.activeClass).eq(rel.activePage).addClass(o.activeClass);

		}


		/**
		 * Activate previous item
		 *
		 * @public
		 */
		this.prev = function(){

			self.activate( rel.activeItem - 1 );

		};


		/**
		 * Activate next item
		 *
		 * @public
		 */
		this.next = function(){

			self.activate( rel.activeItem + 1 );

		};


		/**
		 * Activate previous page
		 *
		 * @public
		 */
		this.prevPage = function(){

			activatePage( rel.activePage - 1 );

		};


		/**
		 * Activate next page
		 *
		 * @public
		 */
		this.nextPage = function(){

			activatePage( rel.activePage + 1 );

		};


		/**
		 * Stop ongoing animations
		 *
		 * @private
		 */
		function stop(){

			$slidee.add($handle).stop();

		}


		/**
		 * Animate element or the whole slidee to the start of the frame
		 *
		 * @public
		 *
		 * @param {Element|Int} el DOM element, or index of element in items array
		 */
		this.toStart = function( el ){

			var index = getIndex( el );

			if( index === -1 ){

				slide( pos.min, null, 1 );

			} else {

				// You can't align items to the start of the frame when centerActive is enabled
				if( o.centerActive ) return;

				index !== -1 && slide( items[index].offStart );

			}

			syncBars();

		}


		/**
		 * Animate element or the whole slidee to the end of the frame
		 *
		 * @public
		 *
		 * @param {Element|Int} el DOM element, or index of element in items array
		 */
		this.toEnd = function( el ){

			var index = getIndex( el );

			if( index === -1 ){

				slide( pos.max, null, 1 );

			} else {

				// You can't align items to the end of the frame when centerActive is enabled
				if( o.centerActive ) return;

				slide( items[index].offEnd );

			}

			syncBars();

		}


		/**
		 * Animate element or the whole slidee to the center of the frame
		 *
		 * @public
		 *
		 * @param {Element|Int} el DOM element, or index of element in items array
		 */
		this.toCenter = function( el ){

			var index = getIndex( el );

			slide( index === -1 ? Math.round( pos.max / 2 + pos.min / 2 ) : items[index].offCenter, null, index === -1 );

			syncBars();

		}


		/**
		 * Get an index of the element
		 *
		 * @private
		 *
		 * @param {Element|Int} el DOM element, or index of element in items array
		 */
		function getIndex( el ){

			return isNumber(el) ? el < 0 ? 0 : el > items.length-1 ? items.length-1 : el : el === undefined ? -1 : $items.index( el );

		}


		/**
		 * Parse style to pixels
		 *
		 * @private
		 *
		 * @param {Object} $item jQuery object with element
		 * @param {Property} property Property to get the pixels from
		 */
		function getPx( $item, property ){

			return parseInt( $item.css( property ) );

		}


		/**
		 * Activates an element
		 *
		 * Element is positioned to one of the sides of the frame, based on it's current position.
		 * If the element is close to the right frame border, it will be animated to the start of the left border,
		 * and vice versa. This helps user to navigate through the elements only by clicking on them, without
		 * the need for navigation buttons, scrolling, or keyboard arrows.
		 *
		 * @public
		 *
		 * @param {Element|Int} el DOM element, or index of element in items array
		 * @param {Bool} noReposition Activate item without repositioning it
		 */
		this.activate = function( el, noReposition ){

			if( !o.byItems || el == undefined ) return;

			var index = getIndex( el ),
				oldActive = rel.activeItem;

			// Update activeItem index
			rel.activeItem = index;

			// Add active class to the active element
			$items.removeClass(o.activeClass).eq(index).addClass(o.activeClass);

			// Trigget onActive callbacks if a new element has being activated
			index != oldActive && executeCallbacks('onActive', $items.eq( rel.activeItem ), [ $items, rel ] );

			if( o.byItems && !noReposition && ( o.autoNav || o.centerActive ) ){

				// When centerActive is enabled, center the element
				if( o.centerActive ){

					self.toCenter( index );

				// Otherwise determine where to position the element
				} else {

					// If activated element is currently on the far right side of the frame, assume that
					// user is moving forward and animate it to the start of the visible frame, and vice versa
					if     ( index >= rel.lastItem )  self.toStart( index );
					else if( index <= rel.firstItem ) self.toEnd( index );

				}

			}

			// Add disabled classes
			disableButtons();

		}


		/**
		 * Activates a page
		 *
		 * @private
		 *
		 * @param {Int} index Page index, starting from 0
		 */
		function activatePage( index ){

			// There are no pages for centered navigation style
			if( o.centerActive ) return;

			// Fix overflowing
			index = index < 0 ? 0 : index >= pages.length ? pages.length-1 : index;
			slide( pages[index], null, o.byItems );

			syncBars();

		}


		/**
		 * Return relative positions of items based on their location within visible frame
		 *
		 * @private
		 *
		 * @param {Int} sPos Position of slidee
		 */
		function getRelatives( sPos ){

			var newRel = {},
				centerOffset = frameSize / 2;

			// Determine active page
			for( var i = 0; i < pages.length; i++ ){

				if( sPos >= pos.max ){
					newRel.activePage = pages.length-1;
					break;
				}

				if( o.centerActive ? sPos == pages[i] : sPos <= pages[i] + centerOffset ){
					newRel.activePage = i;
					break;
				}

			}

			// Relative item indexes
			if( o.byItems ){

				var first  = false,
					last   = false,
					center = false;

				/* From start */
				for( var i=0; i < items.length; i++ ){

					// First item
					if( first === false && sPos <= items[i].offStart ) first = i;

					// Centered item
					if( center === false && sPos - items[i].size / 2 <= items[i].offCenter ) center = i;

					// Last item
					if( i == items.length-1 || ( last === false && sPos < items[i+1].offEnd ) ) last = i;

					// Terminate if all are assigned
					if( last !== false ) break;

				}

				// Safe assignment, just to be sure the false won't be returned
				newRel.firstItem  = isNumber( first )  ? first  : 0;
				newRel.centerItem = isNumber( center ) ? center : newRel.firstItem;
				newRel.lastItem   = isNumber( last )   ? last   : newRel.centerItem;

			}

			return newRel;

		}


		/**
		 * Assign element indexes to the relative positions
		 *
		 * @private
		 */
		function assignRelatives(){

			$.extend( rel, getRelatives( pos.cur ) );

		}


		/**
		 * Disable buttons when needed
		 *
		 * Adds disabledClass, and when the button is <button> or <input>,
		 * activates :disabled state
		 *
		 * @private
		 */
		function disableButtons(){

			// byItems navigation
			if( o.byItems ){
				$prevButton.add($nextButton).removeClass(o.disabledClass);
				$prevButton.is('button,input') && $prevButton.prop('disabled', false);
				$nextButton.is('button,input') && $nextButton.prop('disabled', false);
				if( rel.activeItem == 0 ){
					$prevButton.addClass(o.disabledClass);
					$prevButton.is('button,input') && $prevButton.prop('disabled', true);
				}
				if( rel.activeItem >= items.length-1 ){
					$nextButton.addClass(o.disabledClass);
					$nextButton.is('button,input') && $nextButton.prop('disabled', true);
				}
			}

			// pages navigation
			if( $pages.length ){
				$prevPageButton.add($nextPageButton).removeClass(o.disabledClass);
				$prevPageButton.is('button,input') && $prevPageButton.prop('disabled', false);
				$nextPageButton.is('button,input') && $nextPageButton.prop('disabled', false);
				if( pos.cur <= pos.min ){
					$prevPageButton.addClass(o.disabledClass);
					$prevPageButton.is('button,input') && $prevPageButton.prop('disabled', true);
				}
				if( pos.cur >= pos.max ){
					$nextPageButton.addClass(o.disabledClass);
					$nextPageButton.is('button,input') && $nextPageButton.prop('disabled', true);
				}
			}

		}


		/**
		 * Crossbrowser reliable way to stop default event action
		 *
		 * @private
		 *
		 * @param {Event} e Event object
		 * @param {Bool} noBubbles Cancel event bubbling
		 */
		function stopDefault( e, noBubbles ){

			var evt = e || window.event;
			evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
			noBubbles && evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;

		}


		/**
		 * Removes plugin from the universe, without any regard to Conservation of information physics
		 *
		 * @public
		 */
		this.destroy = function(){

			// Unbind all events
			frame.add(document).add($slidee).add($items).add($scrollSource)
			.add($handle).add($prevButton).add($nextButton).unbind('.' + pluginName);

			// Reset some styles
			$slidee.add($handle).css( o.horizontal ? { left: 0 } : { top: 0 } );

			// Remove plugin classes
			$prevButton.add($nextButton).removeClass(o.disabledClass);

			// Remove page items
			$pb.empty();

			// Remove plugin from element data storage
			$.removeData(e, pluginPrefix + pluginName);

		};


		/**
		 * Function for adding callbacks
		 *
		 * @private
		 *
		 * @param {String} qName Callback queue name
		 * @param {Function} fn Callback function
		 */
		function addCallback( qName, fn ){

			if( !$.isFunction( fn ) ) return;

			// if queue doesn't exist, create it
			if( !$.isArray( callbacks[qName] ) ) callbacks[qName] = [];

			// Check if function is not already in queue
			else if( $.inArray( fn, callbacks[qName] ) !== -1 ) return;

			// Add function to queue
			callbacks[qName].push(fn);

		}


		/**
		 * Function for removing callbacks
		 *
		 * @private
		 *
		 * @param {String} qName Callback queue name
		 * @param {Function} fn Specify what function should be removed, otherwise all will be removed
		 */
		function removeCallback( qName, fn ){

			if( $.isFunction( fn ) && $.isArray( callbacks[qName] ) ){

				for( var i = 0; i < callbacks[qName].length; i++ ){

					// Allready in callbacks
					if( callbacks[qName][i] === fn ){

						callbacks[qName].splice(i, 1);

					}

				}

			} else {

				callbacks[qName] = [];

			}

		}


		/**
		 * Function for executing callbacks
		 *
		 * @private
		 *
		 * @param {String} qName Callbacks queue name
		 * @param {Mixed} scope Scope (`this`) to be applied to all callbacks
		 * @param {Array} args Array of arguments to be applied to all callbacks
		 */
		function executeCallbacks( qName, scope, args ){

			if( $.isArray( callbacks[qName] ) ){

				for( var i = 0; i < callbacks[qName].length; i++ ){

					callbacks[qName][i].apply( scope, args );

				}

			}

		}


		/**
		 * Shorthand for managing callbacks
		 *
		 * @private
		 *
		 * @example
		 * 	callback( 'onMove', fnName )         -> Add function 'fnName' to the 'onMove' callbacks queue
		 * 	callback( 'onMove', fnName, false )  -> Remove function 'fnName' from the 'onMove' callbacks queue
		 * 	callback( 'onMove', false )          -> Remove all functions from the 'onMove' callbacks queue
		 */
		function callback( qName, arg1, arg2 ){

			if( $.isFunction( arg1 ) ){

				arg2 == false ? removeCallback( qName, arg1 ) : addCallback( qName, arg1 );

			} else if( arg1 == false ){

				removeCallback( qName );

			}

		}


		/**
		 * Add callback to onMove queue
		 *
		 * @public
		 *
		 * @param {Function} fn Callback function
		 * @param {Bool} remove Whether to remove this function from callbacks queue
		 */
		this.onMove = function( fn, remove ){

			callback( 'onMove', fn, remove );

		};


		/**
		 * Add callback to onMoveEnd queue
		 *
		 * @public
		 *
		 * @param {Function} fn Callback function
		 * @param {Bool} remove Whether to remove this function from callbacks queue
		 */
		this.onMoveEnd = function( fn, remove ){

			callback( 'onMoveEnd', fn, remove );

		};


		/**
		 * Add callback to onActive queue
		 *
		 * @public
		 *
		 * @param {Function} fn Callback function
		 * @param {Bool} remove Whether to remove this function from callbacks queue
		 */
		this.onActive = function( fn, remove ){

			callback( 'onActive', fn, remove );

		};

		/**
		 * Check if variable is a number
		 *
		 * @param {Mixed} n Any type of variable
		 *
		 * @return {Boolean}
		 */
		function isNumber(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}


		/** @constructor */
		(function(){

			// Required styles
			$frame.css({ overflow: 'hidden' }).css('position') == 'static' && $frame.css({ position: 'relative' });
			$sb.css('position') == 'static' && $sb.css({ position: 'relative' });
			$slidee.add($handle).css( o.horizontal ? { position: 'absolute', left: 0 } : { position: 'absolute', top: 0 } );

			// Load
			self.reload();

			// Activate requested position
			o.byItems ? self.activate( o.startAt ) : slide( pos.cur - o.startAt );
			syncBars();

			// Scrolling navigation
			o.scrollBy && $scrollSource.bind('DOMMouseScroll.' + pluginName + ' mousewheel.' + pluginName, function(e){

				stopDefault( e, 1 );

				var orgEvent = e.originalEvent,
					delta = 0;

				// Old school scrollwheel delta
				if ( orgEvent.wheelDelta ){ delta = orgEvent.wheelDelta / 120; }
				if ( orgEvent.detail     ){ delta = -orgEvent.detail / 3; }

				var isForward = delta < 0;

				if( o.byItems ){

					var nextItem = getIndex( ( o.centerActive ? rel.centerItem : rel.firstItem ) + ( isForward ? o.scrollBy : -o.scrollBy ) );

					o.centerActive ? self.activate( nextItem ) : slide( items[nextItem].offStart );

				} else {

					slide( pos.cur + ( isForward ? o.scrollBy : -o.scrollBy ) );

				}

				syncBars();

			});

			// Keyboard navigation
			o.keyboardNav && $(document).bind('keydown.' + pluginName, function(e){

				switch( e.keyCode || e.which ){

					// Left or Up
					case s.horizontal ? 37 : 38:

						stopDefault(e);
						o.keyboardNavByPages ? self.prevPage() : self.prev();

					break;

					// Right or Down
					case s.horizontal ? 39 : 40:

						stopDefault(e);
						o.keyboardNavByPages ? self.nextPage() : self.next();

					break;

				}

			});

			// Development logging
			$(document).bind('keydown.' + pluginName, function(e){

				switch( e.keyCode || e.which ){

					case 82:
						log( pos, rel, items, pages );
					break;

				}

			});

			// Navigation buttons
			o.prev && $prevButton.bind('click.' + pluginName, function(e){ stopDefault(e); self.prev(); });
			o.next && $nextButton.bind('click.' + pluginName, function(e){ stopDefault(e); self.next(); });
			o.prevPage && $prevPageButton.bind('click.' + pluginName, function(e){ stopDefault(e); self.prevPage(); });
			o.nextPage && $nextPageButton.bind('click.' + pluginName, function(e){ stopDefault(e); self.nextPage(); });

			// Dragging navigation
			o.dragContent && $slidee.bind('mousedown.' + pluginName, function(e){

				// If not left mouse button, stop
				if( !!e.button ) return;

				stopDefault(e);

				var leftInit = e.clientX,
					topInit = e.clientY,
					posInit = pos.cur,
					start = +(new Date),
					srcEl = e.target || e.srcElement,
					easeoff = 0,
					doc = $(document),
					dragEvents = 'mousemove.' + pluginName + ' mouseup.' + pluginName,
					isInitialized = 0;

				// Add dragging class
				$slidee.addClass(o.draggedClass);

				// Stop potential ongoing animations
				stop();

				// Bind dragging events
				doc.bind(dragEvents, function(e){

					var released = e.type == 'mouseup',
						path = o.horizontal ? e.clientX - leftInit : e.clientY - topInit,
						newPos = posInit - path;

					// Elastic bounds
					if( newPos > pos.max ){
						newPos = pos.max + ( newPos - pos.max ) / 6;
					} else if( newPos < pos.min ){
						newPos = pos.min + ( newPos - pos.min ) / 6;
					}

					// Adjust newPos with easing when content has been released
					if( released ){

						// Cleanup
						doc.unbind(dragEvents);
						$slidee.removeClass(o.draggedClass);

						// How long was the dragging
						var time = +(new Date) - start;

						// Calculate swing length
						var swing = time < 300 ? Math.ceil( Math.pow( 6 / ( time / 300 ) , 2 ) * Math.abs( path ) / 120 ) : 0;
						newPos += path > 0 ? -swing : swing;

					}

					// Drag only after path reaches at least 10 pixels
					if( !isInitialized ){

						isInitialized = Math.abs( path ) > 10;
						return;

					}

					stopDefault(e);

					// Stop default click action on source element
					if( srcEl ){

						$(srcEl).bind('click.' + pluginName, function stopMe(e){

							stopDefault(e,true);
							$(this).unbind('click.' + pluginName, stopMe);

						});

						srcEl = 0;

					}

					// Dragging state
					isDragging = !released;

					// Animage, synch bars, & align
					slide( newPos, released ? o.speed : 0, released );
					syncBars( released ? null : 0 );

				});

			});

			// Scrollbar navigation
			$handle && o.dragHandle && $handle.bind('mousedown.' + pluginName, function(e){

				// If not left mouse button, stop
				if( !!e.button ) return;

				stopDefault(e);

				var leftInit = e.clientX,
					topInit = e.clientY,
					posInit = hPos.cur,
					pathMin = -hPos.cur,
					pathMax = hPos.max - hPos.cur,
					nextDrag = 0,
					doc = $(document),
					dragEvents = 'mousemove.' + pluginName + ' mouseup.' + pluginName;

				// Add dragging class
				$handle.addClass(o.draggedClass);

				// Stop potential ongoing animations
				stop();

				// Bind dragging events
				doc.bind(dragEvents, function(e){

					stopDefault(e);

					var released = e.type == 'mouseup',
						path = o.horizontal ? e.clientX - leftInit : e.clientY - topInit,
						newPos = posInit + path,
						time = +(new Date);

					// Dragging state
					isDragging = !released;

					// Unbind events and remove classes when released
					if( released ){

						doc.unbind(dragEvents);
						$handle.removeClass(o.draggedClass);

					}

					// Execute only moves within path limits
					if( path < pathMax+5 && path > pathMin-5 || released ){

						// Fix overflows
						hPos.cur = newPos > hPos.max ? hPos.max : newPos < hPos.min ? hPos.min : newPos;

						// Move handle
						$handle.stop().css( o.horizontal ? { left: hPos.cur+'px' } : { top: hPos.cur+'px' } );

						// Throttle sync interval -> smoother animations, lower CPU load
						if( nextDrag < time || released || path > pathMax || path < pathMin ){

							nextDrag = time + 50;

							// Synchronize slidee position
							slide( Math.round( hPos.cur / hPos.max * ( pos.max - pos.min ) ) + pos.min, released ? o.speed : o.speed / 4, released );

						}

						// Sync pagesbar
						syncPages();

					}

				});

			});

		})();

	}


	// jQuery plugin extension
	$.fn[pluginName] = function( options ){

		var method = false,
			methodArgs = Array.prototype.slice.call( arguments, 1 ),
			o = {};

		// Basic attributes logic
		if( $.isPlainObject(options) ){
			o = $.extend( {}, $.fn[pluginName].defaults, options );
		} else {
			method = options === false ? 'destroy' : options;
		}

		// Call plugin on all elements
		return this.each(function(i,e){

			// Plugin call with prevention against multiple instantiations
			var plugin = $.data( e, pluginPrefix + pluginName ) || $.data( e, pluginPrefix + pluginName, new Plugin( e, o ) );

			// Call plugin method if requested
			$.isFunction( plugin[method] ) && plugin[method].apply( plugin, methodArgs );

		});

	};


	// Default options
	$.fn[pluginName].defaults = {

		// Sly direction
		horizontal:      0,       // set to 1 to change the sly direction to horizontal

		// Navigation by items; when using this type of navigation, you should change `scrollBy` option to something smaller, like 1 :)
		byItems:         0,       // whether the stepping & scrolling should be by items in container instead of pixels (items = all direct children of sliding container)
		  autoNav:       0,       // when enabled and activated item is first/last visible item in a frame, it'll reposition itself to help with seemless navigation
		  centerActive:  0,       // set to 1 to center the active item; even the first and last items will be centetered, detaching content from frame borders

		// Scrollbar
		scrollBar:       null,    // selector or DOM element for scrollbar container (scrollbar container should have one child element representing scrollbar handle)
		  dynamicHandle: 1,       // when enabled, scrollbar handle will be dynamicaly resized to represent the relation between hidden and visible content
		  dragHandle:    1,       // set to 0 to disable mouse dragging of scrollbar handle

		// Pagesbar (when centerActive is enabled, every item is considered to be a page)
		pagesBar:        null,    // selector or DOM element for pages bar container
		  pageBuilder:   function( index ){ // function with `index` (starting at 0) as argument that returns an html for one item
		  		return '<li>'+(index+1)+'</li>';
		  	},

		// Navigation buttons
		prev:            null,    // selector or DOM element for "previous item" button ; doesn't work when not using `byItems` navigation type
		next:            null,    // selector or DOM element for "next item" button     ; doesn't work when not using `byItems` navigation type
		prevPage:        null,    // selector or DOM element for "previous page" button ; doesn't work when `centerActive` is enabled
		nextPage:        null,    // selector or DOM element for "next page" button     ; doesn't work when `centerActive` is enabled

		// Mixed options
		scrollBy:        0,       // how many pixels/items should one mouse scroll event go. set to "0" to disable mousewheel scrolling
		dragContent:     0,       // set to 1 to enable navigation by dragging the content with your mouse
		  elasticBounds: 0,       // when draggin over boundaries, stretch them a little bit (elastic boundaries like on spartphones)
		speed:           400,     // animations speed
		easing:          'swing', // animations easing. build in jquery options are "linear" and "swing". for more, install gsgd.co.uk/sandbox/jquery/easing/
		scrollSource:    null,    // selector or DOM element for cathing the mousewheel event for sly scrolling. default source is the frame container
		startAt:         0,       // starting offset in pixels or items (depends on byItems option)
		keyboardNav:     0,       // whether to allow navigation by keybord arrows (left & right for horizontal, up & down for vertical)
		                          // NOTE! keyboard navigation will disable page scrolling with keyboard arrows in correspondent sly direction (vertical or horizontal)
		keyboardNavByPages: 0,    // whether the keyboard should navigate by pages instead of items (useful when not using `byItems` navigation)

		// Classes
		draggedClass:  'dragged', // class that will be added to scrollbar handle, or content when they are beeing dragged
		activeClass:   'active',  // class that will be added to the active item, or page
		disabledClass: 'disabled' // class that will be added to prev button when on start, or next button when on end
	};

})(jQuery);
