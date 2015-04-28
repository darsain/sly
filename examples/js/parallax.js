/*global Sly, Modernizr */
jQuery(function ($) {
	'use strict';

	var size = 8000;
	var parallax = window.parallax = new Sly(size, {
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
	var $content = $('#content');
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
		var frame = {};
		var content = {
			start: 0
		};
		var maxY = size + frame.height;
		var minParticleSize = 4;
		var maxParticleSize = 120;
		var particleDistributionPow = 10;
		var particles = [];

		function updateDimensions() {
			frame.width = $(window).width();
			frame.height = $(window).height();
			content.height = $content.outerHeight();
			content.end = frame.height >= content.height ? 0 : frame.height - content.height;
			maxY = size + frame.height;
		}

		// Generate particles
		function generateParticles() {
			particles.length = 0;
			var elements = [];
			var $el, zoom, size;
			for (var i = 0; i < count; i++) {
				$el = $('<li/>');
				zoom = Math.pow(Math.random(), particleDistributionPow) * 0.99 + 0.01;
				size = Math.max(minParticleSize, maxParticleSize * zoom);

				// Adjust dot size
				$el.css({
					width: Math.round(size),
					height: Math.round(size),
					zIndex: Math.round(zoom * 100),
					opacity: 1 - zoom
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
			// Content
			content.top = content.end === 0 ? 0 : parallax.pos.cur / parallax.pos.end * content.end;
			if (transform) {
				$content[0].style[transform] = gpuAcceleration + 'translateY(' + content.top + 'px)';
			} else {
				$content[0].style.top = Math.round(content.top) + 'px';
			}

			// Particles
			var x, y, wasHidden, isHidden;
			for (var i = 0, l = particles.length; i < l; i++) {
				x = particles[i].x * (frame.width - particles[i].size);
				y = particles[i].y * (maxY - particles[i].size) - parallax.pos.cur * particles[i].zoom;
				wasHidden = particles[i].curY + particles[i].size <= 0 || particles[i].curY > frame.height;
				isHidden = y + particles[i].size <= 0 || y > frame.height;

				// Ignore particles out of screen, but only those that were also
				// hidden in the last frame, otherwise they'd stuck to the endges.
				if (isHidden && wasHidden) {
					continue;
				}

				// Save current position
				particles[i].curX = x;
				particles[i].curY = y;

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
			updateDimensions();
			render();
		}));

		// Prepare frame
		updateDimensions();
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

	// Keyboard navigation
	$(document).on('keydown', function (event) {
		switch (event.which) {
			case 36:
				parallax.toStart();
				break;
			case 35:
				parallax.toEnd();
				break;
			case 33:
				parallax.slideBy(-1000);
				break;
			case 34:
				parallax.slideBy(1000);
				break;
			case 38:
				parallax.moveBy(-1000);
				break;
			case 40:
				parallax.moveBy(1000);
				break;
		}
	});
	$(document).on('keyup', function (event) {
		switch (event.which) {
			case 38:
			case 40:
				parallax.stop();
				break;
		}
	});
});