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

*Mobile:* Sly has a touch support, but mobile is not tested. If you want to help with that, you are welcome!

### [Changelog](https://github.com/darsain/sly/wiki/Changelog)

Sly upholds the [Semantic Versioning Specification](http://semver.org/).

### [Forum](https://groups.google.com/d/forum/sly-js)

**Please do not populate Issues tracker with non-issues!** If you have a question about Sly, you can use the
**[Sly forum](https://groups.google.com/d/forum/sly-js)**.

## Download

Latest stable release:

- [Production `sly.min.js`](https://raw.github.com/darsain/sly/master/dist/sly.min.js) - 16KB, 7KB gzipped
- [Development `sly.js`](https://raw.github.com/darsain/sly/master/dist/sly.js) - 55KB

When isolating issues on jsfiddle, you can use this URL:

- [http://darsain.github.io/sly/js/sly.min.js](http://darsain.github.io/sly/js/sly.min.js)

## Documentation

- **[Markup](https://github.com/darsain/sly/wiki/Markup)** - how should the HTML look like
- **[Calling](https://github.com/darsain/sly/wiki/Calling)** - how to call Sly
- **[Options](https://github.com/darsain/sly/wiki/Options)** - all available options
- **[Properties](https://github.com/darsain/sly/wiki/Properties)** - accessible Sly object properties
- **[Methods](https://github.com/darsain/sly/wiki/Methods)** - all available methods, and how to use them
- **[Events](https://github.com/darsain/sly/wiki/Events)** - all available events, and how to register callbacks
- **[Parallax](https://github.com/darsain/sly/wiki/Parallax)** - how to initiate and use Sly's parallax mode

## Roadmap

All of the desired features have been implemented.

Maaaaybe never, but I'd liked to:

- Dropping jQuery dependency, and transforming Sly into a [Component](http://component.io/) component.
- RTL layout support.

## Contributing

Please, read the [Contributing Guidelines](CONTRIBUTING.md) for this project.
