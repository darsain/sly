# Sly

jQuery plugin for one-directional scrolling simulation with item based navigation support and lots of other goodies.

**This plugin is in beta testing!**

[See the DEMO](http://darsain.github.com/sly)


## Layout & requirements

![Terminology](http://darsain.github.com/sly/img/terminology.png?v=1)

Sly is being applied to FRAME. SLIDEE is a first child of a FRAME. The content is than inside of a SLIDEE.

Content can be random slug of tags and text, or - if you want to use item based navigation - a strict list of items.

FRAME should have **no padding** in corresponded sly direction (`padding-left` & `padding-right` for horizontal, and `padding-top` & `padding-bottom` for vertical sly),
and SLIDEE should have **no margin** in corresponded sly direction (`margin-left` & `margin-right` for horizontal, and `margin-top` & `margin-bottom` for vertical sly).
If you wish to apply padding to SLIDEE, or margins to items, you can do so
(`sly` is accounting for that), but do not use any other units than **pixels**. Using **%**, **em**, or anything other than pixels will break offsets and limits.

Plugin should work everywhere including IE6.

Also, despite all the awesome things that this plugin does, there is **no other** dependency than jQuery.
That means no jQuery-UI required, everything is included in this nice 9KB[minified] action - you are welcome :)

## Calling

```js

$frame.sly( [ options [, returnInstance ]] );
```

### [options]

###### Sly type

**horizontal:** `default: 0` set to 1 to change the sly direction to horizontal

**itemNav:** `default: 0` type of item based navigation. when `itemNav` is enabled, items snap to frame edges or frame center (according to navigation type).
`itemNav` also enables "item activation" functionality and methods associated with it (explained in Methods section). List of navigation types:

+ **basic**: items snap to edges (ideal if you don't care about "active item" functionality)
+ **smart**: same as basic, but activated item close to, or outside of the visible edge will be positioned to the best logical position to help with further navigation
+ **centered**: activated items are positioned to the center of visible frame if possible
+ **forceCentered**: active items are always centered & centered items are always active. every change in position activates item that is right now in center.
with this navigation type, each item is considered to be a separate page, so each item receives a page button in pages bar.

###### Scrollbar

**scrollBar:** `default: null` selector or DOM element for scrollbar container (scrollbar container should have one child element representing scrollbar handle)

**dynamicHandle:** `default: 1` resizes scrollbar handle to represent the relation between hidden and visible content. set to "0" to leave it as big as CSS made it

**dragHandle:** `default: 1` set to 0 to disable dragging of scrollbar handle with mouse

**minHandleSize:** `default: 50` minimal height, or width for handle size (depends on sly direction) in pixels

###### Pages bar

**pagesBar:** `default: null` selector or DOM element for pages bar container

**pageBuilder:** `default: function` function that returns HTML for one page item. function receives one argument: `index` (starting at 0)

###### Navigation buttons

**prev:** `default: null` selector or DOM element for "previous item" button ; doesn't work when not using `byItems` navigation type

**next:** `default: null` selector or DOM element for "next item" button ; doesn't when work not using `byItems` navigation type

**prevPage:** `default: null` selector or DOM element for "previous page" button ; does the same thing as **prev** button when `forceCentered` navigation type is used

**nextPage:** `default: null` selector or DOM element for "next page" button ; does the same thing as **next** button when `forceCentered` navigation type is used

###### Automated cycling

**cycleBy:** `default: 0` enable automated cycling by `'items'`, or `'pages'`

**cycleInterval:** `default: 5000` number of milliseconds between cycles

**pauseOnHover:** `default: 1` pause cycling when mouse hovers over frame

**startPaused:** `default: 0` set to "1" to start in paused state. cycling can be than started with **cycle** method

###### Mixed options

**scrollBy:** `default: 0` how many pixels or items (when **itemNav** is enabled) should one mouse scroll go. leave `0` to disable mousewheel scrolling

**dragContent:** `default: 0` set to 1 to enable navigation by dragging the content with your mouse

**elasticBounds:** `default: 0` when dragging past limits, stretch them a little bit (like on spartphones)

**speed:** `default: 300` animations speed. set to `0` to disable animating, in which case the `jQuery.css` method will be used

**easing:** `default: 'swing'` animations easing. build in jQuery are "linear" and "swing". for more, install [jQuery Easing Plugin](http://gsgd.co.uk/sandbox/jquery/easing/)

**scrollSource:** `default: null` selector or DOM element for catching the mouse wheel events for sly scrolling if anything other than FRAME should be used

**dragSource:** `default: null` selector or DOM element for catching the mouse dragging events for sly dragging if anything other than FRAME should be used

**startAt:** `default: 0` starting offset in pixels or items (depends on **itemsNav** option). index of first item is `0`

**keyboardNav:** `default: 0` set to `0` to allow navigation by keybord arrows (left & right for horizontal, up & down for vertical).
keyboard navigation will disable page scrolling with keyboard arrows in correspondent sly direction

###### Classes

**draggedClass:** `default: 'dragged'` class that will be added to scrollbar handle, or content when dragged

**activeClass:** `default: 'active'` class that will be added to the active item, or active page element

**disabledClass:** `default: 'disabled'` class that will be added to buttons when there is no use for them

### [ returnInstance ]

Boolean argument requesting to return a plugin instance instead of a chainable jQuery object. You can than use all methods documented below directly on this instance.

If motio is called on more than one element, it returns an array of instances.

## Methods

Sly has a bunch of very useful methods that provide almost any functionality required.

#### Activate

```js
$frame.sly( 'activate', item );
```

Activates an item, and depending on **itemNav** type, repositions it. Doesn't work when **itemNav** is disabled.

Activation means that item receives **activeClass** (option described above) as its class, and is the starting point for **next** & **prev** methods described below.

**item:** index or DOM element of an item in SLIDEE that should be activated

#### ActivatePage

```js
$frame.sly( 'activatePage', index );
```

Activates a page, and positions SLIDEE to it.

Activation means that element `.eq(index)` in pages bar receives **activeClass** (option described above) as its class,
and is the starting point for **nextPage** & **prevPage** methods described below.

**index:** index of a page that should be activated, starting at `0`

#### Cycle

```js
$frame.sly( 'cycle' [, pause [, soft ] ] );
```

Start or pause automatic cycling.

**pause:** pass `true` to pause cycling. it won't get un-paused until you call this method again
**soft:** pass `true` to use soft pause - pause that will be canceled when mouse hovers in & out of the frame. This is for internal purposes and you probably won't ever need this :)

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

Activates next item. Doesn't work when **itemNav** is disabled.

#### Prev

```js
$frame.sly( 'prev' );
```

Activates previous item. Doesn't work when **itemNav** is disabled.

#### NextPage

```js
$frame.sly( 'nextPage' );
```

Animates to the next page.

#### PrevPage

```js
$frame.sly( 'prevPage' );
```

Animates to the previous page.

#### Reload

```js
$frame.sly( 'reload' );
```

Reloads `sly` instance. Call it if any change has happened to SLIDEE content, like things appended, removed, or resized.

#### Set

```js
$frame.sly( 'set', [ propertyName/object [, value ]] );
```

Updates one, or multiple values in sly options object.

```js
$frame.sly( 'set', 'speed', 0 ); // Updates one property in options object
$frame.slt( 'set', { speed: 0, cycleInterval: 0 } ) // Extends current options object with new values
```

Right now only a simple options can be updated (like `speed`, `cycleInterval`, class names ...). There should be a future update with support for updating anything.
It depends on whether I'll encounter a reasonable case where someone would need to update more than a simple options :)

#### ToCenter

```js
$frame.sly( 'toCenter', target );
```

Animates target to the center of a visible frame. When no `target` is passed, it will animate whole SLIDEE to the center.

**target:** can be selector of item inside of SLIDEE, item index, or item DOM element

*you can use this method even when **itemNav** is disabled, targeting random items from content slug, like headings and stuff*

#### ToStart

```js
$frame.sly( 'toStart', target );
```

Animates target to the start of a visible frame. Doesn't work when any type of centered item navigation is used.
When no `target` is passed, it will animate whole SLIDEE to the start.

**target:** can be selector of item inside of SLIDEE, item index, or item DOM element

*you can use this method even when **itemNav** is disabled, targeting random items from content slug, like headings and stuff*

#### ToEnd

```js
$frame.sly( 'toEnd', target );
```

Animates target to the end of a visible frame. Doesn't work when any type of centered item navigation is used.
When no `target` is passed, it will animate whole SLIDEE to the end.

**target:** can be selector of item inside of SLIDEE, item index, or item DOM element

*you can use this method even when **itemNav** is disabled, targeting random items from content slug, like headings and stuff*


## Custom events

On almost any action sly does, there is an event being triggered. All custom events receive similar arguments: `$items`, `position`, and `relatives`.

**$items:** argument is jQuery wrapped array of items. Doesn't contain anything when **itemNav** is disabled.

**position:** object with information about current SLIDEE position. Consists of:

```js
{
	cur: 200,  // current SLIDEE position
	max: 4000, // maximum limit for SLIDEE position
	min: 0     // minimum limit for SLIDEE position
}
```

**relatives:** this object provides indexes of items relative to the visible view of the FRAME, as well as bunch of other useful info. Consists of:

```js
{
	activeItem: 3,    // current active idem index
	activePage: 0,    // current page index
	centerItem: 2,    // item lying in center of visible FRAME
	firstItem: 0,     // first completely visible item in FRAME
	frameSize: 940,   // FRAME size in a direction of current sly (horizontal: width, vertical: height)
	handleSize: 157,  // scrollbar handle size in a direction of current sly (horizontal: width, vertical: height)
	items: 30,        // total number of items
	lastItem: 4,      // last completely visible item in FRAME
	pages: 6,         // number of pages
	sbSize: 940,      // scrollbar size in a direction of current sly (horizontal: width, vertical: height)
	slideeSize: 5640  // SLIDEE size in a direction of current sly (horizontal: width, vertical: height)
}
```

***

#### sly:load

Event triggered on FRAME after first sly load, and each **realod** method call.

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

Event triggered on SLIDEE or scrollbar handle on dragging start.

```js
$slidee.on( 'sly:dragStart', function( event, position ){ ... } );
$sbHandle.on( 'sly:dragStart', function( event, position ){ ... } );
```

#### sly:drag

Event triggered on SLIDEE or scrollbar handle on dragging.

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

Event triggered on FRAME on every SLIDEE move. This is triggered right before the animation start,
but the arguments represent the state of FRAME/SLIDEE/items when the animation will finish.

```js
$frame.on( 'sly:move', function( event, position, $items, relatives ){ ... } );
```

#### sly:moveEnd

Event triggered on FRAME on every SLIDEE move. This is triggered after animation has finished.

```js
$frame.on( 'sly:moveEnd', function( event, position, $items, relatives ){ ... } );
```

#### sly:cycleStart

Triggered on each cycle initialization, e.g. on sly load with cycling enabled, and every time you un-pause cycling by moving your mouse outside of the frame,
or triggering the **cycle** method.

```js
$frame.on( 'sly:cycleStart', function( event, position, $items, relatives ){ ... } );
```

#### sly:cycle

Triggered on each cycle right after the animation starts. It is essentially an equivalent of `sly:move` event, but triggered only when auto cycling.

```js
$frame.on( 'sly:cycle', function( event, position, $items, relatives ){ ... } );
```

#### sly:cyclePause

Triggered when cycling has been paused, whether it was by mouse hovering over frame, or by **pause** method.

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

+ Wen using item based navigation, you can go wild with your items. Each one can be different size, and have different margins & paddings. Sly is smart, and can figure it out :)

+ When **forceCentered** item navigation is used, every item is considered to be a new page. That's so the pages bar could render page button for each item.
Check the **forceCentered** horizontal examples in demo page. Also, in this case, the **nextPage** & **prevPage** methods do the exact same thing as **next** & **prev** methods.

+ When margin of a first item (`margin-top` for vertical, `margin-left` for horizontal) is `0`, the last margin of last item is ignored,
and SLIDEE wont go past the last item border-box. Thats so you wouldn't have to fix last item margins with `li:last-child { margin-right: 0; }`, or class on last child to support older
browsers when you want just spaces between items, but not between first/last item and SLIDEE border.