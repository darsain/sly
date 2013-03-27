/*global Sly, Modernizr */
jQuery(function ($) {
	'use strict';

	var size = 8000;
	var parallax = new Sly(size, {
		scrollBy: 300,
		scrollSource: document,
		scrollBar: $('#scrollbar'),
		dragHandle: 1,
		clickBar: 1,
		mouseDragging: 1,
		touchDragging: 1,
		releaseSwing: 1,
		swingSpeed: 0.1,
		dragSource: document,
		speed: 600,
		startAt: 250,
		elasticBounds: 1
	});
	var $max = $('#pos .max');
	var $cur = $('#pos .cur');
	var $particles = $('#particles');

	/**
	 * Animation frame renderer.
	 *
	 * @param  {Object} pos Sly position object.
	 *
	 * @return {Void}
	 */
	var render = (function () {
		var transform = Modernizr.prefixed('transform');
		var gpuAcceleration = Modernizr.csstransforms3d ? 'translateZ(0) ' : '';
		var count = 500;
		var screenWidth = $(window).width();
		var screenHeight = $(window).height();
		var maxY = size + screenHeight;
		var minParticleSize = 2;
		var maxParticleSize = 12;
		var particles = [];

		// Generate particles
		function generateParticles() {
			particles.length = 0;
			var elements = [];
			var $el, zoom, size;
			for (var i = 0; i < count; i++) {
				$el = $('<li/>');
				zoom = Math.random() * 0.99 + 0.01;
				size = Math.max(minParticleSize, maxParticleSize * zoom);

				// Adjust dot size
				$el.css({
					width: Math.round(size),
					height: Math.round(size),
					zIndex: Math.round(zoom * 100)
				});

				// Add to particles
				elements.push($el[0]);
				particles.push({
					el: $el[0],
					zoom: zoom,
					size: size,
					x: Math.random(),
					y: Math.random(),
					hidden: false
				});
			}
			$particles.empty().append(elements);
		}

		// Render the animation frame
		function render() {
			var x, y, isHidden;
			for (var i = 0, l = particles.length; i < l; i++) {
				x = particles[i].x * (screenWidth - particles[i].size);
				y = particles[i].y * (maxY - particles[i].size) - parallax.pos.cur * particles[i].zoom;
				isHidden = y + particles[i].size <= 0 || y > screenHeight;

				// Ignore particles out of screen, but only those that were also
				// hidden in the last frame, otherwise they'd stuck to the endges.
				if (isHidden && particles[i].hidden === isHidden) {
					continue;
				}

				// Save the hidden state for next frame
				particles[i].hidden = isHidden;

				// Update the position
				if (transform) {
					particles[i].el.style[transform] = gpuAcceleration + 'translateX(' + x + 'px) translateY(' + y + 'px)';
				} else {
					particles[i].el.style.left = Math.round(x) + 'px';
					particles[i].el.style.top = Math.round(y) + 'px';
				}
			}
		}

		// Reload on window resize
		$(window).on('resize', $.debounce(200, function () {
			screenWidth = $(window).width();
			screenHeight = $(window).height();
			maxY = size + screenHeight;
			render();
		}));

		// Generate particles on load
		generateParticles();

		// Return frame rendering function
		return render;
	}());

	// Bind events
	parallax.on('load move', render);
	parallax.on({
		load: function () {
			$cur.text(Math.round(this.pos.cur));
			$max.text(this.pos.end);
		},
		move: function () {
			$cur.text(Math.round(this.pos.cur));
		}
	});

	// Initialize Sly instance
	parallax.init();

	// Reload sly on window resize
	$(window).on('resize', $.debounce(200, function () {
		parallax.reload();
	}));
});