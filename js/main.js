/*global prettyPrint:false */
jQuery(function($){
	'use strict';

	// -----------------------------------------------------------------------------------
	//   Examples
	// -----------------------------------------------------------------------------------

	// Function for populating lists with placeholder items
	function populate(container, count, offset) {

		var output = '';

		offset = isNaN(offset) ? 0 : offset;

		for (var i = 0; i < count; i++) {
			output += '<li>' + (offset + i) + '</li>';
		}

		return $(output).appendTo(container);

	}

	// Populate list items
	$('ul[data-items]').each(function (i, element) {

		var items = parseInt($(element).data('items'), 10);

		populate(element, items);

	});

	// Activate section (it misbehaves when sly is called on hidden sections)
	$(document).on('activated', function (event, sectionId) {

		var $section = $('#'+sectionId);

		if ($section.data('examplesLoaded')) {
			return;
		}

		switch (sectionId) {
			case 'infinite':
				var $frame = $section.find('.frame'),
					$slidee = $frame.find('ul').eq(0),
					$scrollbar = $section.find('.scrollbar'),
					$buttons = $section.find('.controlbar [data-action]'),
					reset = 0;

				populate($slidee, 10);

				$frame.on('sly:move', function (event, pos) {
					// Append more items
					if (pos.dest > pos.max - 100) {
						populate($slidee, 10, $slidee.children().length-1);
						$frame.sly('reload');
					}
				}).on('sly:moveEnd', function (event, pos) {
					// Reload when requested
					if (reset && pos.cur === pos.min) {
						reset = 0;
						$slidee.find('li').slice(10).remove();
						$frame.sly('reload');
					}
				}).sly({ itemNav: 'basic', scrollBy: 1, dynamicHandle: 1, scrollBar: $scrollbar });

				// Controls
				$buttons.on('click', function () {
					var action = $(this).data('action');

					switch (action) {
						case 'reset':
							reset = 1;
							$frame.sly('toStart');
						break;

						default:
							$frame.sly(action);
					}
				});
			break;

			default:
				// Call sly instances
				$section.find(".slyWrap").each(function (i, element) {

					var $cont = $(element),
						$frame = $cont.find(".sly"),
						$slidee = $frame.find("ul"),
						$scrollbar = $cont.find(".scrollbar"),
						$pagesbar = $cont.find(".pages"),
						options = $frame.data("options"),

						$controls = $cont.find(".controls"),
						$prevButton = $controls.find(".prev"),
						$nextButton = $controls.find(".next"),
						$prevPageButton = $controls.find(".prevPage"),
						$nextPageButton = $controls.find(".nextPage");

					$.extend(options, {
						scrollBar: $scrollbar,
						pagesBar: $pagesbar,

						prev: $prevButton,
						next: $nextButton,
						prevPage: $prevPageButton,
						nextPage: $nextPageButton,
						disabledClass: 'btn-disabled'
					});

					// Call sly
					$frame.sly(options);

					// Bind controls
					$cont.find("button").click(function () {

						var action = $(this).data('action'),
							arg = $(this).data('arg');

						switch (action) {
							case 'add':
								var children = $slidee.children().length,
									$item = $('<li>'+children+'</li>');
								$slidee.append($item);
								$frame.sly('reload');
							break;

							case 'remove':
								$slidee.children().slice(-1).remove();
								$frame.sly('reload');
							break;

							default:
								$frame.sly(action, arg);
						}
					});
				});
		}

		$section.data('examplesLoaded', true);
	});


	// -----------------------------------------------------------------------------------
	//   Page navigation
	// -----------------------------------------------------------------------------------

	// Navigation
	var $nav = $('#nav'),
		$sections = $('#sections').children(),
		activeClass = 'active';

	// Tabs
	$nav.on('click', 'a', function (event) {
		event.preventDefault();
		activate($(this).attr('href').substr(1));
	});

	// Back to top button
	$('a[href="#top"]').on('click', function (event) {
		event.preventDefault();
		$(document).scrollTop(0);
	});

	// Activate a section
	function activate(sectionID, initial) {
		sectionID = (sectionID && $sections.filter('#'+sectionID).length) ? sectionID : $sections.eq(0).attr('id');
		$nav.find('a').removeClass(activeClass).filter('[href=#'+sectionID+']').addClass(activeClass);
		$sections.hide().filter('#'+sectionID).show();

		if (!initial) {
			window.location.hash = '!' + sectionID;
		}

		$(document).trigger('activated', [sectionID]);
	}

	// Activate initial section
	activate(window.location.hash.match(/^#!/) ? window.location.hash.substr(2) : 0, 1);

	// -----------------------------------------------------------------------------------
	//   Additional plugins
	// -----------------------------------------------------------------------------------

	// Trigger prettyPrint
	prettyPrint();
});