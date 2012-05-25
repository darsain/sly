jQuery(function($){

	// -----------------------------------------------------------------------------------
	//   Examples
	// -----------------------------------------------------------------------------------

	// Function for populating lists with placeholder items
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

		var items = parseInt( $(e).data('items'), 10 );

		populate( e, items );

	});

	// Activate section (it misbehaves when sly is called on hidden sections)
	$(document).on('activated', function( event, sectionId ){

		var $section = $('#'+sectionId);

		if( $section.data('examplesLoaded') ){

			return;

		}

		switch( sectionId ){

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

	});


	// -----------------------------------------------------------------------------------
	//   Page navigation
	// -----------------------------------------------------------------------------------

	// Navigation
	var $nav = $('#nav'),
		$sections = $('#sections').children(),
		activeClass = 'active';

	// Tabs
	$nav.on('click', 'a', function(e){
		e.preventDefault();
		activate( $(this).attr('href').substr(1) );
	});

	// Back to top button
	$('a[href="#top"]').on('click', function(e){
		e.preventDefault();
		$(document).scrollTop(0);
	});

	// Activate a section
	function activate( sectionID, initial ){

		sectionID = sectionID && $sections.filter('#'+sectionID).length ? sectionID : $sections.eq(0).attr('id');
		$nav.find('a').removeClass(activeClass).filter('[href=#'+sectionID+']').addClass(activeClass);
		$sections.hide().filter('#'+sectionID).show();

		if( !initial ){
			window.location.hash = '!' + sectionID;
		}

		$(document).trigger('activated', [ sectionID ] );

	}

	// Activate initial section
	activate( window.location.hash.match(/^#!/) ? window.location.hash.substr(2) : 0, 1 );


	// -----------------------------------------------------------------------------------
	//   Additional plugins
	// -----------------------------------------------------------------------------------

	// Trigger prettyPrint
	prettyPrint();

});