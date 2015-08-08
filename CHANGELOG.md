# Changelog

**1.6.1** :: *8th Aug 2015*

- Improved instance clearing and method calls when called via jQuery proxy.
- Made `new` keyword in `new Sly()` optional.

**1.6.0** :: *17th Jul 2015*

- Implemented dragging threshold - distance in pixels before Sly recognizes dragging.
- Added `dragThreshold` option, which is `3` by default.

**1.5.1** :: *28th Apr 2015*

- Fixed parallax mode.
- Fixed scrolling not working when `document` or `window` was used as a scroll source.

**1.5.0** :: *28th Apr 2015*

- Added `slidee` option that forces Sly to use a specific SLIDEE element.

**1.4.4** :: *30th Mar 2015*

- Fixed `activateOn` events not bubbling when originating on interactive elements, making it impossible to bind handlers to buttons for example.

**1.4.3** :: *10th Mar 2015*

- Improved `scrollHijack` logic.
- Fixed `scrollHijack` value being ignored and instead a fixed `300` was used.

**1.4.2** :: *9th Mar 2015*

- Fixed `scrollHijack` and `scrollTrap` options not working nicely together.

**1.4.1** :: *5th Mar 2015*

- Fixed dragging somehow broken by previous commits.

**1.4.0** :: *5th Mar 2015*

- Fixed broken `startAt`.
- `startAt` is now optional, and resolves to `null` by default with no item being activated at the start.
- Fixed Sly breaking in `jQuery.noConflict()` mode.
- Fixed `.destroy()` method nuking `document` event listeners of other Sly instances. When you destroyed one Sly instance, keyboard navigation stopped working on all Sly instances.
- Fixed last item in horizontal navigation sometimes being placed on a new line. * ***important note***
- Fixed dragging termination (when draggin in direction opposite to Sly's) breaking `activateMiddle` functionality.
- Fixed buttons's disabled states sometimes not being updated.

\* **IMPORTANT** this was is possible only by retrieving item sizes with `getBoundingClientRect()` method, which is the only way how to get the element size with subpixel precision. This has a side effect of retrieving the item's rendered rectangle dimensions as opposed to layout dimensions. This means you can't apply CSS transforms to items anymore, as that changes element's rendered box dimensions and breaks Sly's item offsets. Apply transforms to item's children instead.

**1.3.0** :: *30th Nov 2014*

- `destroy()` now correctly restores previous element styles.
- Implemented `scrollTrap` option.

**1.2.7** :: *30th Oct 2014*

- Prevent native image dragging in Firefox when Sly dragging is active.

**1.2.6** :: *11th Oct 2014*

- Fixed dragging navigation collisions in nested Sly instances with crossed directions.

**1.2.5** :: *28th Aug 2014*

- Dragging overhaul. Fixes a lot of issues with touch dragging on mobile devices. You can test the difference here: http://fiddle.jshell.net/0duf5h6b/show/light/

**1.2.4** :: *19th Aug 2014*

- Implemented protection against hijacking global scrolling.
- Moved scrolling implementation from `mousewheel` + `DOMMouseScroll` to `wheel` event with fallback to `mousewheel` in IE8-. Introduced Chrome 31+ requirement if you want to use mouse wheel/trackpad scrolling.

**1.2.3** :: *9th Feb 2014*

- Fixed the need to click on an item twice to activate it after dragging finished from different target.

**1.2.2** :: *18th Nov 2013*

- Fixed Sly locking perpendicular touch scrolling.

**1.2.1** :: *12th Nov 2013*

- Fixed page generation for item-based navigation.

**1.2.0** :: *31st Oct 2013*

- Implemented scrolling speed normalization between different browsers and input devices. Scrolling speed with mouse or MacBook trackpads should feel similar now.
- Dragging initiation optimized to be more responsive. You no longer need to drag a certain destination before dragging kicks in.
- Sly'll now refuse to initiate dragging if source element is interactive. Meaning if you mousedown/touchstart on an `input`, `button`, `textarea`, or a `select` element, dragging won't start.
- Added `interactive` option. It is a selector to extend the pool of what should be considered an *interactive element*.
- Hand full of bug fixes.

**1.1.0** :: *10th Sep 2013*

- New method [`.one()`](https://github.com/Darsain/sly/wiki/Methods#one), binding events that should be executed only once.
- Exposing [`sly.initialized`](https://github.com/Darsain/sly/wiki/Properties#slyinitialized) flag.
- Fixed duplicate execution of some events.
- Fixed executing undefined callbacks when one of the prior callbacks in the queue unbound itself.

**1.0.2** :: *4th Aug 2013*

- Fixed dragEnd to correctly fire moveEnd event.
- Fixed infinite caused by dragEnd when `speed: 0`.
- Fixed mousewheel scrolling not working when jquery.mousewheel plugin is present.

**1.0.1** :: *8th Jun 2013*

- Implemented direction dependent dragging (horizontal Sly won't disable vertical scrolling on touch devices).
- Iteration on unresponsive taps when `touchDragging` is enabled. **Needs feedback!**
- Optimized & improved `moveBy` method. It is now way faster, and can be called super often. Useful when you want to control `moveBy()` speed by mouse cursor position.
- `moveBy` method now correctly triggers `moveStart` & `moveEnd` events.
- Fixed bugged handle resulting into bugged everything in one edge case of forceCentered navigation.
- Fixed incorrect styles being applied to FRAME & SLIDEE when 2D transforms are supported, but 3D are not.
- Fixed handle not moving in IE8 + parallax mode.
- Fixed some positioning functions not accepting `immediate` argument.
- Fixed `add()` method not working in IE8.
- Fixed `load()` sometimes generating a redundant page item.
- Fixed dragging release sometimes not un-binding event prevention handlers.
- Added dynamic native FRAME scroll reset. Native scroll on FRAME element happenes sometimes in some browsers, and shifts the SLIDEE position. Sly now listens for `scroll` event on FRAME, and resets `frame.scrollLeft` & `frame.scrollTop` to `0` when that happens.

**1.0.0** :: *24th Mar 2013*

- Quite a hand full of bug fixes.
- **itemNav** split to multiple options to provide more control.
- New options **activateOn** & **activatePageOn** for more control over item/pages activation.
- **dragging** split to **mouseDragging** & **touchDragging** to provide more control.
- New options **releaseSwing** & **swingSpeed** for dragging navigation.
- Some option name changes for better semantics.
- `.cycle()` method changed to `.resume()`.
- `cycleStart` & `cyclePause` events renamed to `resume` & `pause`.
- Implemented continuous movement navigation type.
- New methods `.moveBy()` & `.stop()` for controlling the continuous movement.
- New button options `forward` & `backward` utilizing the continuous movement.
- New item manipulation methods `.add()`, `.remove()`, `.moveAfter()`, and `.moveBefore()`.
- Exposed a lot of Sly object properties, now documented on [Properties page](https://github.com/Darsain/sly/wiki/Properties).
- Event callback arguments API change.
- New option **itemSelector**.
- `new Sly()` now accepts selector as 1st argument.

### Release candidates

---

**1.0.0-rc.6** :: *6th Feb 2013*

Well, this is embarrassing. It turns out, translateX/Y on its own doesn't trigger GPU acceleration. Which means that
improvements in **0.10.0** were so awesome that it looked like it did anyway :) Changes made in this release:

- Finally enabling GPU acceleration in browsers that support it.
- Sets correct required properties on init.
- Minor bug fix in IE8 and lower.

This is the difference in repaint times when Sly is animating an area with 1080p resolution full of images.

![Repaints before after](http://i.imgur.com/nk5EhNF.png)

**1.0.0-rc.5** :: *27th Jan 2013*

- Smarter division into pages for item based navigations.
- Bug fixes.

**1.0.0-rc.4** :: *25th Jan 2013*

- Fixed animated cycling broken in previous version. Whoops.

**1.0.0-rc.3** :: *25th Jan 2013*

- Position object min/max property names renamed to start/end.
- Implemented `immediate` boolean argument for positioning methods. When `true`, SLIDEE will be re-positioned without animation.
- Bug fixes.

**1.0.0-rc.2** :: *17th Jan 2013*

- Item's position object returned from `.getPos()` method in non-item based navigation now extended with item `size` property.

**1.0.0-rc.1** :: *17th Jan 2013*

- Added `sly.jquery.json` for jQuery plugins registry.
- Extended `.getPos()` method to accept `item` argument, and return the passed item's position object.

**1.0.0-rc** :: *15th Jan 2013*

- Option `drag` renamed to `dragging`. I'm sorry, ... my OCD.
- Restructured repository.
- Registered into Bower.
- Added proper build system with grunt.

### Beta

---

**0.14.0** :: *15th Jan 2013*

- Implemented [Parallax API](https://github.com/Darsain/sly/wiki/Parallax).
- Increased path required for touch dragging initialization, so you can actually click items on touch devices when dragging is enabled.

**0.13.1** :: *6th Jan 2013*

- Fixed jQuery's `event.which` not normalizing click events in <IE9, which basically disabled activation of items by clicking on them.

**0.13.0** :: *5th Jan 2013*

- Implemented touch events support.
- Added `.slyTo()` and `.slideBy()` methods for non-item based navigations.
- Added `.getPos()` and `.getRel()` methods for retrieving the current Sly state.
- Fixed `.destroy()` method not resetting everything.
- Minor speed optimization when removing `activeClass` from items.

**0.12.0** :: *4th Jan 2013*

- New callbacks API providing better event driven interface than DOM events.
- New methods for callbacks API: `.on()` & `.off()`.
- Removed `returnInstance` argument. It is being replaced by a proper `Sly` class call alternative.
- Added `callbacksMap` argument to bind callbacks along with a plugin call before anything gets executed.
- Options `keyboardNav` & `keyboardNavByPages` merged into `keyboardNavBy` with possible values: `items`, or `pages`.
- New option `domEvents` that controls whether Sly triggers DOM events or not. Disabled by default.

**0.11.0** :: *22nd Dec 2012*

- Added navigation by clicking on scrollbar.
- New option `clickBar` that enables this feature - disabled by default.

**0.10.0** :: *21st Dec 2012*

- Minor plugin rewrite with huge performance improvements.
- Implemented custom animation rendering with requestAnimationFrame (ditching jQuery.animate altogether).
- Support for GPU accelerated animations in browsers that support it (using translateX/Y instead of absolute positioning).
- Using tweesing instead of tweening animation when dragging scrollbar handle or SLIDEE.
- New option `syncFactor` controlling handle => SLIDEE synchronization tweesing speed.

Sly is now super smooth!

![FPS before after](http://i.imgur.com/gx4RP.png)

**0.9.7** :: *31st Oct 2012*

- Tweaks, bug fixes, and improved cycling API.

**0.9.6** :: *19th Jul 2012*

- Added `.set()` method for changing options in runtime. Very limited though...

**0.9.1-0.9.5** :: *13th Feb 2012* ~ *19th Jul 2012*

- Goofing around, tweaking and fixing.
- Implemented automated cycling.

**0.9.0** :: *13th Feb 2012*

- First public version.