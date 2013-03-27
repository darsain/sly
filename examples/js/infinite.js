/*global Sly */
jQuery(function ($) {
	'use strict';

	var options = {
		scrollBy: 200,
		speed: 200,
		easing: 'easeOutQuart',
		scrollBar: '#scrollbar',
		dynamicHandle: 1,
		dragHandle: 1,
		clickBar: 1,
		mouseDragging: 1,
		touchDragging: 1,
		releaseSwing: 1
	};
	var frame = new Sly('#frame', options);
	var $items = $('#items');

	/**
	 * Populates the container with dummy items
	 *
	 * @param  {Int} count
	 * @param  {Int} offset
	 *
	 * @return {Void}
	 */
	function populate(count) {
		var output = '';
		var offset = $items.children().length;
		for (var i = 0; i < count; i++) {
			output += '<li>' + (offset + i) + '</li>';
		}
		return $items.append(output);
	}

	// Add more items when close to the end
	frame.on('load change', function () {
		if (this.pos.dest > this.pos.end - 200) {
			populate(10);
			this.reload();
		}
	});

	// Populate items
	populate(20);

	// Initiate Sly
	frame.init();

	// Reload on resize
	$(window).on('resize', function () {
		frame.reload();
	});
});