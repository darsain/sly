jQuery(function($){

	// Trigger prettyPrint
	prettyPrint();

	// -----------------------------------------------------------------------------------
	//   Page scripts
	// -----------------------------------------------------------------------------------

	var $tabs = $('#tabs').find('li'),
		$container = $('#sections'),
		$sections = $container.children(),
		hashId = window.location.hash.replace(/^#tab=/, ''),
		initial = hashId && $sections.filter('#'+hashId).length ? hashId : $tabs.eq(0).data('activate'),
		activeClass = 'active',
		hiddenClass = 'visuallyhidden';

	// Tabs navigation
	$tabs.on('click', function(e){

		activate( $(this).data('activate') );

		e.preventDefault();

	});

	// Back to top button
	$('a[href="#top"]').on('click', function(e){
		e.preventDefault();
		$(document).scrollTop(0);
	});

	function populate( container, count, offset ){

		var output = '';

		offset = isNaN(offset) ? 0 : offset;

		for( var i = 0; i<count; i++ ){
			output += '<li>'+(offset+i)+'</li>';
		}

		return $(output).appendTo(container);

	}

	// Populate list items
	$('ul[data-items]').each(function(i,e){

		var items = parseInt($(e).data('items'), 10);

		populate( e, items );

	});

	// Activate initial section
	activate( initial );

	// Activate section (it misbehaves when sly is called on hidden sections)
	function activate( sectionId ){

		window.location.hash = 'tab='+sectionId;

		$tabs.removeClass(activeClass).filter('[data-activate='+sectionId+']').addClass(activeClass);

		var $section = $sections.addClass(hiddenClass).filter('#'+sectionId).removeClass(hiddenClass),
			isInitialized = $section.data('examplesLoaded');

		if( !isInitialized ) switch(sectionId){

			case 'infinite':

				var $frame = $section.find('.frame'),
					$ul = $frame.find('ul').eq(0),
					$scrollbar = $section.find('.scrollbar'),
					$buttons = $section.find('.controlbar [data-action]');

				populate( $ul, 10 );

				$frame.on('sly:move', function( e, pos ){

					if( pos.cur > pos.max - 100 ){

						populate( $ul, 10, $ul.children().length-1 );

						$frame.sly('reload');

					}

				}).sly({ itemNav: 'basic', scrollBy: 1, scrollBar: $scrollbar });

				// Controls
				$buttons.on('click', function(e){

					var action = $(this).data('action');

					switch(action){

						case 'reset':
							$frame.sly('toStart');
							setTimeout(function(){
								$ul.find('li').slice(10).remove();
								$frame.sly('reload');
							}, 200);
						break;

						default:
							$frame.sly(action);
					}

				});

			break;

			default:

				// Call sly instances
				$section.find(".slyWrap").each(function(i,e){
					//if( i != 3 ) return;
					var cont = $(this),
						frame = cont.find(".sly"),
						slidee = frame.find("ul"),
						scrollbar = cont.find(".scrollbar"),
						pagesbar = cont.find(".pages"),
						options = frame.data("options"),

						controls = cont.find(".controls"),
						prevButton = controls.find(".prev"),
						nextButton = controls.find(".next"),
						prevPageButton = controls.find(".prevPage"),
						nextPageButton = controls.find(".nextPage");

					options = $.extend( {}, options, {
						scrollBar: scrollbar,
						pagesBar: pagesbar,

						prev: prevButton,
						next: nextButton,
						prevPage: prevPageButton,
						nextPage: nextPageButton,
						disabledClass: 'btn-disabled'
					});

					// Call sly
					frame.sly( options );

					// Bind controls
					cont.find("button").click(function(){

						var action = $(this).data('action'),
							arg = $(this).data('arg');

						switch(action){

							case 'add':
								slidee.append( slidee.children().slice(-1).clone().removeClass().text(function(i,text){ return text/1 + 1; }) );
								frame.sly('reload');
							break;

							case 'remove':
								slidee.find("li").slice(-1).remove();
								frame.sly('reload');
							break;

							default:
								frame.sly(action, arg);

						}

					});

				});

		}

		$section.data('examplesLoaded', true);

	}


});

function getSizes( contSize, gap, maxElements ){

	maxElements = maxElements ? maxElements : 20;

	for( var i = 2; i <= maxElements; i++ ){

		var conSizeGapless = contSize - ( ( i - 1 ) * gap ),
			itemSize = conSizeGapless / i;

		if( itemSize % 1 < gap / i ) console.log( i + ' elements by ' + itemSize + ' pixels' );

	}

}