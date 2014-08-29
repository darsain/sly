# Calling

When you want to have a direct access to all methods and complete control over Sly:

```js
var sly = new Sly( frame, options [, callbackMap ] );
```

New instance has to be than initiated. That is to give you time to bind callbacks before anything happens. For example, if you want to register callbacks, but don't want to use `callbackMap`.

```js
sly.init();
```

The `.init()` method returns the very same instance it is called on, so if you are binding callbacks via a `callbackMap` argument, or not binding callbacks at all, you can initiate the instance right after the `new Sly` call. The `sly` variable will be the same.

```js
var sly = new Sly(frame, options, callbackMap).init();
```

Now you can use all methods directly on this instance.

```js
sly.activate(1); // Activates 2nd element
sly.reload();    // Reload Sly
```
A common usecase is wanting sly to be reloaded when the user resizes the browser. The following accomplishes that
```
  $(window).resize(function(e) {
        $frame.sly('reload');
  });
```

---

### frame

Type: `Mixed`

Argument can be a selector, DOM element, or jQuery object containing an element. Examples:

```js
var sly = new Sly('#frame');                         // selector
var sly = new Sly(document.getElementById('frame')); // DOM element
var sly = new Sly(jQuery('#frame'));                 // jQuery object
```

---

### options

Type: `Object`

Object with Sly options. All options are documented in the [Options Wiki page](Options.md).

---

### [ callbackMap ]

Type: `Object`

Map with callbacks that should be registered to Sly events before Sly gets initiated. Example:

```js
var sly = new Sly(frame, options, {
	load: function () {},
	move: [
		function () {},
		function () {}
	]
});
```

This will bind one function to `load` event, and two functions to `move` event.

To see all available Sly events, head over to [Events documentation](Events.md).

## Calling via jQuery proxy

```js
$('#frame').sly( [ options [, callbackMap ] ] );
```

---

### [ options ]

Type: `Object`

Object with sly options. All options are documented in the [Options Wiki page](Options.md).

---

### [ callbackMap ]

Type: `Object`

Map with callbacks that should be registered to Sly events before Sly gets initiated. Example:

```js
$('#frame').sly(options, {
	load: function () {},
	move: [
		function () {},
		function () {}
	]
});
```

This will bind one function to `load` event, and two functions to `move` event.

To see all available Sly events, head over to [Events documentation](Events.md).