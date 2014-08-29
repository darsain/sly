# [Sly](http://darsa.in/sly)

JavaScript library for one-directional scrolling with item based navigation support.

Sly supports navigation with:

- mouse wheel scrolling
- scrollbar (dragging the handle or clicking on scrollbar)
- pages bar
- various navigation buttons
- content dragging with mouse or touch
- automated cycling by items or pages
- lots of super useful methods

... and has a powerful & developer friendly API!

That's all build around a custom [highly optimized animation rendering](http://i.imgur.com/nszjJBZ.png) with
requestAnimationFrame, and GPU accelerated positioning with fallbacks for browsers that don't support it.

#### Dependencies

- jQuery 1.7+

#### Compatibility

Works everywhere, even in IE6+ abominations, but that is a complete accident :) IE 6-7 are not officially supported.

### [Forum](https://groups.google.com/d/forum/sly-js)

Forum is for questions. Issues are for bug reports and feature requests. Don't mix the two :)

## Usage

Constructor:

```js
var options = {
	horizontal: 1,
	itemNav: 'basic',
	speed: 300,
	mouseDragging: 1,
	touchDragging: 1
};
var frame = new Sly('#frame', options).init();
```

jQuery proxy:

```js
var options = {
	horizontal: 1,
	itemNav: 'basic',
	speed: 300,
	mouseDragging: 1,
	touchDragging: 1
};
$('#frame').sly(options);
```

jQuery proxy is good when you want to create an instance and forget about it. For anything more complex, like using methods, events, accessing instance properties, ... use the constructor and work with the instance directly.

## Download

Latest stable release:

- [Production `sly.min.js`](https://raw.github.com/darsain/sly/master/dist/sly.min.js) - 16KB, 7KB gzipped
- [Development `sly.js`](https://raw.github.com/darsain/sly/master/dist/sly.js) - 55KB

When isolating issues on jsfiddle, you can use this URL:

- [http://darsain.github.io/sly/js/sly.min.js](http://darsain.github.io/sly/js/sly.min.js)

## Documentation

Can be found in the [docs](https://github.com/darsain/sly/tree/master/docs) directory.

## Contributing

Please, read the [Contributing Guidelines](CONTRIBUTING.md) for this project.

## License

MIT