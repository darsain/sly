## Beta

**v0.11.0** - Added navigation by clicking on scrollbar.

- New option `clickBar` that enables this feature - disabled by default.

**v0.10.0** - Minor plugin rewrite with huge performance improvements.

- Implemented custom animation rendering with requestAnimationFrame (ditching jQuery.animate altogether).
- Support for GPU accelerated animations in browsers that support it (using translateX/Y instead of absolute positioning).
- Using tweesing instead of tweening animation when dragging scrollbar handle or SLIDEE.
- New option `syncFactor` controlling handle => SLIDEE synchronization tweesing speed.

Sly is now as smooth as possible!

![FPS before after](http://i.imgur.com/gx4RP.png)

**v0.9.7** - Tweaks, bug fixes, and improved cycling API.

**v0.9.6** - Added `.set()` method for changing options in runtime. Very limited though...

**v0.9.2-0.9.5** - Goofing around, tweaking and fixing.

**v0.9.1** - Automatron!

- Implemented automated cycling by *items* or *pages*. Hand full of new options with it.
- New methods `.cycle()`, `.pause()`, and `.toggle()`.

**v0.9.0** - First public version.