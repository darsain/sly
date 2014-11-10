# Markup

![Terminology](http://i.imgur.com/iOOloMy.png)

**Terminology:** Sly is being applied to a **FRAME**. **SLIDEE** is a first child of a **FRAME**. The content/items are then inside of a **SLIDEE**.

## HTML

In non-item based navigation, the content can be anything, and HTML would look something like this:

```html
<div class="frame">
	<div class="slidee">
		<h2>This in here...</h2>
		<p>...can be anything. <strong>Anything!</strong></p>
	</div>
</div>
```

Otherwise in item-based navigation, you need a strict list of items, like:

```html
<div class="frame">
	<ul class="slidee">
		<li></li> // Item
		<li></li> // Item
		<li></li> // Item
	</ul>
</div>
```

But the actual tags are not enforced. Dividitis is not discriminated :)

### Scroll bar

The markup for a scroll bar is similar. You have an element that represents a scroll bar, and the handle is than its first child (doesn't have to have any class):

```html
<div class="scrollbar">
	<div class="handle"></div>
</div>
```

You then pass the element with `id="scrollbar"` into the `scrollBar` option.

## Styling elements

There are a few rules you should follow:

- FRAME should have no padding in a correspondent Sly direction.
- SLIDEE should have no margin in a correspondent Sly direction.

In other words, if you enable horizontal mode, FRAME element should have no padding top & bottom, while SLIDEE should have no margin top & bottom. The same applies in vertical mode, but for left & right margins/padding.

In item based navigation, you can apply padding to SLIDEE, or margins to items (sly accounts for this), but do not use any other units than **pixels**, or you'll bork things.

### Horizontal non-item based navigation!

In item based navigation, Sly sums up the sizes of all items, and re-sizes the SLIDEE to contain all of them. This is necessary in horizontal mode, because SLIDEE element otherwise won't overflow FRAME horizontally without being manually forced to, which would result into SLIDEE size equal FRAME size, and no scrolling & broken Sly.

In non-item based navigation, this doesn't happen. Content in such navigation can be anything of any layout, therefore Sly has no way of determining the final width of a SLIDEE.

This is not a problem in vertical mode, as height of a SLIDEE is re-sized automatically depending on a content.

However, in horizontal non-item based navigation (`itemNav: 0`), you have to set the width of a SLIDEE manually, otherwise SLIDEE size will always equal FRAME size, which means that there is nowhere to scroll.

### Examples

Horizontal item based navigation:

```css
.frame { width: 100%; height: 160px; padding: 0; }
.frame .slidee { margin: 0; padding: 0; height: 100%; list-style: none; }
.frame .slidee li { float: left; margin: 0 5px 0 0; padding: 0; width: 120px; height: 100%; }
```

Vertical item based navigation:

```css
.frame { padding: 0; width: 300px; height: 400px; }
.frame .slidee { margin: 0; padding: 0; width: 100%; list-style: none; }
.frame .slidee li { float: left; margin: 0 0 5px 0; padding: 0; width: 100%; height: 100px; }
```

Vertical non-item based navigation:

In this example `.slidee` is just a `div` and its content is whatever you want it to be.

```css
.frame { padding: 0; width: 300px; height: 400px; }
.frame .slidee { margin: 0; padding: 1em; }
```

The example for horizontal non-item based navigation doesn't exist. Read why [above](#horizontal-non-item-based-navigation).

### Styling scrollbar

When styling a scroll bar & handle, you should follow the same rules as styling FRAME & SLIDEE:

- Scroll bar should have no padding in a correspondent Sly direction.
- Handle should have no margin in a correspondent Sly direction.

In other words, if you enable horizontal mode, scroll bar element should have no padding top & bottom, while handle should have no margin top & bottom. The same applies in vertical mode, but for left & right margins/padding.

### Examples

Scrollbar for horizontal navigation:

```css
.scrollbar { width: 100%; height: 10px; }
.scrollbar .handle {
	width: 100px; /* overriden if dynamicHandle: 1 */
	height: 100%;
	background: #222;
}
```

Scrollbar for vertical navigation:

```css
.scrollbar { width: 10px; height: 400px; }
.scrollbar .handle {
	width: 100%;
	height: 100px; /* overriden if dynamicHandle: 1 */
	background: #222;
}
```

## Notable behaviors

+ When using item based navigation, you can go wild with your items. Each one can be of different size, and have different margins & paddings. Sly is smart, and can figure it out :)

+ When **forceCentered** item navigation is used, every item is considered to be a separate page. That's because pages in this context don't make sense, so Sly creates a page button for each item instead. Also, the **nextPage** & **prevPage** methods & buttons in this case do the exact same thing as **next** & **prev** methods & buttons.

+ When margin of a first item (`margin-top` for vertical, `margin-left` for horizontal) is `0`, the last margin of last item is ignored, and SLIDEE won't go past the last item border-box. That's so you don't have to fix last item margins with `li:last-child { margin-right: 0; }`, or a custom `.last-item` class to support older browsers when you want only spaces between items, but not between first/last item and a FRAME border.
