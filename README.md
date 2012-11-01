# Sly

jQuery plugin for one-directional scrolling with item based navigation support.

[See the DEMO](http://darsa.in/sly)

#### Dependencies

Except jQuery, there are **no other dependencies**. That means you don't need 200kB of jQuery-UI to slide a few items.
Just this nice 9KB (minified) action - you are welcome :)

#### Compatibility

Works everywhere! I'm afraid even in IE6 (not intended, honest). Not sure about mobile thought... I have nothing to test it on :)

Sly upholds the [Semantic Versioning Specification](http://semver.org/). Right now it is in a **beta** state. For more info on that, read the [Roadmap](#roadmap).

## Layout & requirements

![Terminology](http://darsain.github.com/sly/img/terminology.png?v=1)

Sly is being applied to a FRAME. SLIDEE is a first child of a FRAME. The content/items are than inside of a SLIDEE.

FRAME should have **no padding** in a corresponded sly direction (padding left & right for horizontal, and padding top & bottom for vertical navigation),
and SLIDEE should have **no margin** in a corresponded sly direction (margin left & right for horizontal, and margin top & bottom for vertical navigation).
You can apply padding to SLIDEE, or margins to items, (sly accounts for this), but do not use any other units than **pixels**, or you'll bork things.

If you are not using one of the item based navigation logics, content can be anything:

```html
<div id="frame">
	<div class="slidee">
		<h2>This in here...</h2>
		<p>...can be anything. <strong>Anything!</strong></p>
	</div>
</div>
```

Otherwise, you need a strict list of items, like:

```html
<div id="frame">
	<ul class="slidee">
		<li></li> // Item
		<li></li> // Item
		<li></li> // Item
	</ul>
</div>
```

But the actual markup is not enforced. Dividitis is not discriminated :)

## Calling

```js

$frame.sly( [ options [, returnInstance ]] );
```

### [options]

###### Sly type

**horizontal:** `default: 0` Set to 1 to change the sly direction to horizontal.

**itemNav:** `default: 0` Type of item based navigation logic. Can be:

+ **0**: `disabled` No item based navigation, just a usual scrolling.
+ **basic**: Items in SLIDEE snap to edges.
+ **smart**: Same as basic, but activated item close to, or outside of the visible edge will be positioned to the opposite to help with further navigation.
+ **centered**: Activated items are positioned to the center of a visible frame when possible.
+ **forceCentered**: Active items are always centered & centered items are always active. Every change in position activates item that is right now in the center of a FRAME.
With this navigation type, each item is considered to be a separate page, so each item receives a page button in pages bar.

###### Scrollbar

**scrollBar:** `default: null` Selector or DOM element for scrollbar container (scrollbar should have one child element representing scrollbar handle).

**dynamicHandle:** `default: 1` Resizes scrollbar handle to represent the size of a SLIDEE in proportion to FRAME. Set to `0` to leave it to CSS.

**dragHandle:** `default: 1` Set to `0` to disable dragging of a scrollbar handle.

**minHandleSize:** `default: 50` Minimal size of a handle in pixels.

###### Pages bar

**pagesBar:** `default: null` Selector or DOM element for pages bar container.

**pageBuilder:** `default: function` Function that returns HTML for one page item. Arguments: `function (index) {}` (`index` starts at 0)

###### Navigation buttons

**prev:** `default: null` Selector or DOM element for a "previous item" button. Irrelevant in non-item based navigation.

**next:** `default: null` Selector or DOM element for a "next item" button. Irrelevant in non-item based navigation.

**prevPage:** `default: null` Selector or DOM element for a "previous page" button.

**nextPage:** `default: null` Selector or DOM element for a "next page" button.

###### Automated cycling

**cycleBy:** `default: 0` Enable automated cycling by `'items'`, or `'pages'`.

**cycleInterval:** `default: 5000` Number of milliseconds between cycles.

**pauseOnHover:** `default: 1` Pause cycling when mouse hovers over a frame.

**startPaused:** `default: 0` Set to "1" to start in paused state.

###### Mixed options

**scrollBy:** `default: 0` Enable mouse scrolling by this many **pixels**, or (in item-based navigation) **items**.

**dragContent:** `default: 0` Enable navigation by dragging the SLIDEE with a mouse.

**elasticBounds:** `default: 0` When dragging past limits, stretch them a little bit (like on smart-phones).

**speed:** `default: 300` Animations speed. Set to `0` to disable animation.

**easing:** `default: 'swing'` Animations easing. Can be `'linear'`, or `'swing'`. For more, install the [jQuery Easing Plugin](http://gsgd.co.uk/sandbox/jquery/easing/).

**scrollSource:** `default: null` Selector or DOM element for catching the mouse scroll events. By default, FRAME is used.

**dragSource:** `default: null` Selector or DOM element for catching the mouse dragging events. By default, FRAME is used.

**startAt:** `default: 0` Starting offset in ***pixels** or (in item-based navigation) **items**. Items index starts at 0.

**keyboardNav:** `default: 0` Enable navigation with keyboard arrows (left & right for horizontal, up & down for vertical).

Note: Keyboard navigation will disable page scrolling with keyboard arrows in a correspondent sly direction.

###### Classes

**draggedClass:** `default: 'dragged'` Class name for scrollbar handle, or SLIDEE when they are being dragged.

**activeClass:** `default: 'active'` Class name for active item.

**disabledClass:** `default: 'disabled'` Class name for disabled buttons. (e.g.: "Previous item" button when first item is selected)

### [ returnInstance ]

Boolean argument requesting to return a plugin instance instead of a chainable jQuery object. You can than use all methods
documented below directly on this instance.

If Sly is called on more than one element, it returns an instances for the first element in set.

## Methods

Sly has a bunch of very useful methods that provide almost any functionality required. You can call them via `.sly()` proxy,
or directly on a plugin instance. You can get the instance by:

Passing `true` into the `returnInstance` argument.

```js
var frame = $('#frame').sly(options, true);
```

Or by retrieving it from a FRAME element data.

```js
var frame = $('#frame').sly(options).data('sly');
```

You can than call all methods directly.

```js
frame.activate(2);
```

---

#### Activate

```js
$frame.sly('activate', item);
```

Activates an item, and depending on a navigation type, repositions it. Irrelevant in non-item based navigation.

**item:** Index or DOM element of an item in SLIDEE that should be activated.

#### ActivatePage

```js
$frame.sly( 'activatePage', index );
```

Activates a page.

**index:** Index of a page that should be activated, starting at 0.

#### Cycle

```js
$frame.sly( 'cycle' );
```

Starts automated cycling.

#### Pause

```js
$frame.sly( 'pause', [ soft ] );
```

Pause automated cycling.

**soft:** Pass `true` to use soft pause - pause that will be canceled when mouse hovers out of the frame. Used internally for **pauseOnHover** functionality.

#### Toggle

```js
$frame.sly( 'toggle' );
```

Start when paused, or pause when cycling.

#### Destroy

```js
$frame.sly( 'destroy' );
// or alias
$frame.sly( false );
```

Removes `sly` instance, resets positions, and unbinds all attached events.

#### Next

```js
$frame.sly( 'next' );
```

Activates next item. Irrelevant in non-item based navigation.

#### Prev

```js
$frame.sly( 'prev' );
```

Activates previous item. Irrelevant in non-item based navigation.

#### NextPage

```js
$frame.sly( 'nextPage' );
```

Activates next page. When **forceCentered** navigation is used, this is a mere alias of a **next** method.

#### PrevPage

```js
$frame.sly( 'prevPage' );
```

Activates previous page. When **forceCentered** navigation is used, this is a mere alias of a **prev** method.

#### Reload

```js
$frame.sly( 'reload' );
```

Reloads `sly` instance. Call it if any change has happened to SLIDEE content, like things appended, removed, or resized.

#### Set

```js
$frame.sly( 'set', [ propertyName/object [, value ] ] );
```

Updates one, or multiple values in a sly options object.

```js
$frame.sly( 'set', 'speed', 0 ); // Updates one property in options object
$frame.slt( 'set', { speed: 0, cycleInterval: 0 } ) // Extends current options object with new values
```

Right now only a simple options can be updated (like `speed`, `cycleInterval`, class names ...).

#### ToCenter

```js
$frame.sly( 'toCenter' [, target ] );
```

Animates target to the center of a visible frame. When no `target` is passed, it will animate whole SLIDEE to the center.

**target:** In item based navigation, it can be item index, or item DOM element. In content based scrolling, can be a selector or DOM element inside of SLIDEE.

*you can use this method even when **itemNav** is disabled, targeting random items from content, like headings, paragraphs, ...*

#### ToStart

```js
$frame.sly( 'toStart' [, target ] );
```

Animates target to the start of a visible frame. Doesn't work when any type of centered item navigation is used.
When no `target` is passed, it will animate whole SLIDEE to the start.

**target:** In item based navigation, it can be item index, or item DOM element. In content based scrolling, can be a selector or DOM element inside of SLIDEE.

*you can use this method even when **itemNav** is disabled, targeting random items from content, like headings, paragraphs, ...*

#### ToEnd

```js
$frame.sly( 'toEnd' [, target ] );
```

Animates target to the end of a visible frame. Doesn't work when any type of centered item navigation is used.
When no `target` is passed, it will animate whole SLIDEE to the end.

**target:** can be selector of item inside of SLIDEE, item index, or item DOM element

*you can use this method even when **itemNav** is disabled, targeting random items from content, like headings, paragraphs, ...*


## Custom events

On almost any action sly does, there is an event being triggered. All custom events receive similar arguments: `$items`, `position`, and `relatives`.

**$items:** argument is jQuery wrapped array of items. Empty when non-item based navigation is used.

**position:** object with information about a current SLIDEE position. Structure:

```js
{
	cur: 200,  // current SLIDEE position
	max: 4000, // maximum limit for SLIDEE position
	min: 0     // minimum limit for SLIDEE position
}
```

**relatives:** this object provides indexes of items in SLIDEE relative to a visible view of a FRAME, as well as a bunch of other useful info. Structure:

```js
{
	activeItem: 3,    // current active idem index
	activePage: 0,    // current active page index
	centerItem: 2,    // item lying in center of a visible FRAME
	firstItem: 0,     // first completely visible item in a FRAME
	frameSize: 940,   // FRAME size in a direction of current sly (horizontal: width, vertical: height)
	handleSize: 157,  // scrollbar handle size in a direction of a current sly (horizontal: width, vertical: height)
	items: 30,        // total number of items
	lastItem: 4,      // last completely visible item in a FRAME
	pages: 6,         // number of pages
	sbSize: 940,      // scrollbar size in a direction of a current sly (horizontal: width, vertical: height)
	slideeSize: 5640  // SLIDEE size in a direction of a current sly (horizontal: width, vertical: height)
}
```

---

#### sly:load

Event triggered on FRAME after first sly load, and after each **realod** method call.

```js
$frame.on( 'sly:load', function( event, position, $items, relatives ){ ... } );
```

**NOTE**: `position` argument in this event also contains an `old` property, specifying the position values before reload. The position object than looks like this:

```js
{
	cur: 100,
	max: 120,
	min: 0,
	old: {
		cur: 100,
		max: 100,
		min: 0
	}
}
```

#### sly:active

Event triggered on an item that has just been activated.

```js
$item.on( 'sly:active', function( event, $items, relatives ){ ... } );
```

#### sly:dragStart

Event triggered on a SLIDEE or a scrollbar handle on dragging start.

```js
$slidee.on( 'sly:dragStart', function( event, position ){ ... } );
$sbHandle.on( 'sly:dragStart', function( event, position ){ ... } );
```

#### sly:drag

Event triggered on a SLIDEE or a scrollbar handle on dragging.

```js
$slidee.on( 'sly:drag', function( event, position ){ ... } );
$sbHandle.on( 'sly:drag', function( event, position ){ ... } );
```

#### sly:dragEnd

Event triggered on SLIDEE or scrollbar handle on dragging end.

```js
$slidee.on( 'sly:dragEnd', function( event, position ){ ... } );
$sbHandle.on( 'sly:dragEnd', function( event, position ){ ... } );
```

#### sly:move

Event triggered on a FRAME on every SLIDEE move. This is triggered right before the animation start,
but the arguments represent the state of FRAME/SLIDEE/items when the animation will be finished.

```js
$frame.on( 'sly:move', function( event, position, $items, relatives ){ ... } );
```

#### sly:moveEnd

Event triggered on FRAME on every SLIDEE move. This is triggered after animation has finished.

```js
$frame.on( 'sly:moveEnd', function( event, position, $items, relatives ){ ... } );
```

#### sly:nav

Event triggered on each navigation change, like prev, next, prevPage, ...

This event is not triggered when SLIDEE or a scrollbar handle are being dragged, but it is triggered on alignment,
i.e. when mouse has been released, and items need to be aligned to the FRAME edges. Obviously that doesn't happen in non-item based navigation.

```js
$frame.on( 'sly:nav', function( event, position, $items, relatives ){ ... } );
```

#### sly:cycleStart

Triggered on each cycle initialization, e.g. on sly load with cycling enabled, and every time you un-pause cycling by moving your mouse outside of the frame,
or trigger the **cycle** method.

```js
$frame.on( 'sly:cycleStart', function( event, position, $items, relatives ){ ... } );
```

#### sly:cycle

Triggered on each cycle right after the animation starts. It is essentially an equivalent of `sly:move` event, but triggered only when auto cycling.

```js
$frame.on( 'sly:cycle', function( event, position, $items, relatives ){ ... } );
```

#### sly:cyclePause

Triggered when cycling has been paused, whether it was by mouse hovering over FRAME, or by **pause** method.

```js
$frame.on( 'sly:cyclePause', function( event, position, $items, relatives ){ ... } );
```

## Example of a call with all default options

```js
$frame.sly({
	// Sly type
	horizontal:      0,
	itemNav:         0,

	// Scroll bar
	scrollBar:       null,
	  dynamicHandle: 1,
	  dragHandle:    1,
	  minHandleSize: 50,


	// Pages bar
	pagesBar:        null,
	  pageBuilder: function( index ){
	      return '<li>'+(index+1)+'</li>';
	    },

	// Navigation buttons
	prev:            null,
	next:            null,
	prevPage:        null,
	nextPage:        null,

	// Automated cycling
	cycleBy:         0,
	  cycleInterval: 5000,
	  pauseOnHover:  1,
	  startPaused:   0,

	// Mixed options
	scrollBy:        0,
	dragContent:     0,
	  elasticBounds: 0,
	speed:           300,
	easing:          'swing',
	scrollSource:    null,
	startAt:         0,
	keyboardNav:     0,
	keyboardNavByPages: 0,

	// Classes
	draggedClass:  'dragged',
	activeClass:   'active',
	disabledClass: 'disabled'
});
```

## Notable behaviors

+ When using item based navigation, you can go wild with your items. Each one can be of different size, and have different margins & paddings. Sly is smart, and can figure it out :)

+ When **forceCentered** item navigation is used, every item is considered to be a separate page. That's so the pages bar could render page button for each item.
Check the **forceCentered** horizontal examples in demo page. Also, the **nextPage** & **prevPage** methods in this case do the exact same thing as **next** & **prev** methods.

+ When margin of a first item (`margin-top` for vertical, `margin-left` for horizontal) is `0`, the last margin of last item is ignored,
and SLIDEE wont go past the last item border-box. Thats so you don't have to fix last item margins with `li:last-child { margin-right: 0; }`, or class on last child to support older
browsers when you want to just spaces between items, but not between first/last item and a SLIDEE border.


## Roadmap

**This plugin is in beta testing!**

To do before 1.0.0:

- Dragging optimization.
- Navigation by clicking on scrollbar.

Maybe in 1.0.0, maybe later:

- Touch events support.