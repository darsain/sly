/*global Sly, console */
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
	var $images = $('#images');
	var titles = [
		'Ibogaine',
		'DMT',
		'Mescaline',
		'Peyote',
		'Psilocybin',
		'THC',
		'LSD',
		'Bufotenine'
	];
	var subtitles = [
		'Oh look, a prolific zeebra!',
		'Touch my nipple.',
		'Where does the air come from?',
		'Does sperm have a soul?',
		'You cunt be cereals!',
		'Was Hitler a hipster?',
		'How does the Higgs boson taste like?',
		'I need to pee.',
		'Can god dream?',
		'Universe is a void without purpose.',
		'I am a planet for microorganisms.'
	];

	// Populate images
	$images.loremImages(200, 250, {
		count: 70,
		grey: 1,
		itemBuilder: function (i, url) {
			var output = '<figure style="background-image: url(' + url + ')">';
			output += '<figcaption>';
			output += '<h4>' + titles[Math.floor(Math.random()*titles.length)] + '</h4>';
			output += '<p>' + subtitles[Math.floor(Math.random()*subtitles.length)] + '</p>';
			output += '</figcaption>';
			output += '</figure>';

			return output;
		}
	});

	// Initiate frame
	frame.init();

	// Reload on resize
	$(window).on('resize', function () {
		frame.reload();
	});

	var toggleAnimationLoop = (function () {
		var loopId;
		var speed = 500;

		return function () {
			if (loopId) {
				loopId = clearTimeout(loopId);
				frame.set(options);
			} else {
				var i = 0;
				frame.set('easing', 'linear');
				frame.set('speed', speed);
				(function loop() {
					i++;
					loopId = setTimeout(loop, speed);
					frame[i % 2 === 0 ? 'toStart' : 'toEnd']();
				} ());
			}
		};
	})();

	// Keyboard actions
	$(document).on('keydown', function (event) {
		console.log('Key pressed: ' + event.which);

		switch (event.which) {
			// L
			case 76:
				toggleAnimationLoop();
				break;
			// D
			case 68:
				console.log(frame.getPos());
				break;
		}
	});
});