/*global Base64, moment, store, tim */
jQuery(function ($) {
	'use strict';

	// ==========================================================================
	//   Navigation
	// ==========================================================================
	var $nav = $('#mainnav');
	var $navUl = $('<ul/>').prependTo($nav);
	var $footer = $('footer');
	var waypoints = {};
	var loadHash = document.location.hash.substr(2);
	var windowSpy = new jQuery.Espy(window, {
		offset: 300,
		size: 0
	});

	/**
	 * Controls the stickiness of navigation.
	 */
	function stickNavigation() {
		var isSticky = $nav.data('sticky') && $(window).height() >= $nav.height();
		// Makes navigation fixed
		$nav[isSticky ? 'addClass' : 'removeClass']('fixed');
		// Makes navigation positioned at the bottom of content, so it won't collide with footer
		$nav[(isSticky && $footer.data('collides')) ? 'addClass' : 'removeClass']('bottom');
	}

	// Sticky navigation
	$nav.espy(function (entered, state) {
		$nav.data('sticky', state === 'up');
		stickNavigation();
	}, { contain: 1 });

	$(window).on('resize', stickNavigation);

	/**
	 * Scroll to waypoint.
	 */
	function scrollTo(pointName) {
		$(window).scrollTo(pointName === 'download' ? 0 : waypoints[pointName].element, { duration: 300 });
	}

	// Scroll to waipoint
	$(document).on('click', '[href^="#!"]', function () {
		var name = $(this).attr('href').match(/#!(.*)$/)[1];
		scrollTo(name);
	});

	// Waypoints
	$('[data-point]').each(function (i, point) {
		var $point = $(point);
		var pointName = $point.data('point');
		var pointTitle = $point.data('title') || pointName;
		var activeWhen = $point.data('active-when');
		var $navlink = $('<li><a href="#!' + pointName + '">' + pointTitle + '</a></li>');

		waypoints[pointName] = {
			element: point,
			activeWhen: activeWhen,
			title: pointTitle
		};

		windowSpy.add($point, function (entered, pos) {
			$navlink[(entered || pos === activeWhen) ? 'addClass' : 'removeClass']('active');
		});

		if (pointName === loadHash) {
			scrollTo(pointName);
		}

		$navlink.appendTo($navUl);
	});

	// Footer <-> Navigation collision
	windowSpy.add($footer, function (entered) {
		$footer.data('collides', entered);
		stickNavigation();
	}, {
		offset: 0,
		size: $nav.outerHeight()
	});

	// ==========================================================================
	//   Tooltips
	// ==========================================================================
	(function () {
		var $tooltip = $('<div />');

		function showHideHandler(event) {
			/*jshint validthis:true */
			if (event.type === 'mouseleave') {
				$tooltip.remove();
				return;
			}

			var $el = $(this);
			var title = $el.data('tooltip');
			var place = $el.data('place') || 'top';
			var style = $el.data('style') || 'dark';

			$tooltip.attr('class', 'tooltip ' + place + ' ' + style).text(title).appendTo(document.body);
			var tWidth = $tooltip.outerWidth();
			var tHeight = $tooltip.outerHeight();
			var pos = $el.offset();
			var elWidth = $el.outerWidth();
			var elHeight = $el.outerHeight();

			switch (place) {
				case 'top':
					$tooltip.css({
						top: pos.top - tHeight,
						left: pos.left + Math.round(elWidth / 2) - Math.round(tWidth / 2)
					});
					break;
				case 'left':
					$tooltip.css({
						top: pos.top + Math.round(elHeight / 2) - Math.round(tHeight / 2),
						left: pos.left - tWidth
					});
					break;
				case 'right':
					$tooltip.css({
						top: pos.top + Math.round(elHeight / 2) - Math.round(tHeight / 2),
						left: pos.left + elWidth
					});
					break;
				case 'bottom':
					$tooltip.css({
						top: pos.top + elHeight,
						left: pos.left + Math.round(elWidth / 2) - Math.round(tWidth / 2)
					});
					break;
			}
		}

		$('[data-tooltip]').on('mouseenter mouseleave', showHideHandler);
	}());

	// ==========================================================================
	//   Repository credentials
	// ==========================================================================
	var repository  = $('body').data('repo');
	var versionFile = $('body').data('metafile');
	var repoAuthor  = repository.split('/')[0];
	// var repoName    = repository.split('/')[1];

	// ==========================================================================
	//   Repository meta data
	// ==========================================================================
	var apiBase  = 'https://api.github.com';
	var repoURL  = apiBase + '/repos/' + repository;
	var metaURL  = apiBase + '/repos/' + repository + '/contents/' + versionFile;
	var reposURL = apiBase + '/users/' + repoAuthor + '/repos';

	/**
	 * Do a cached request with callbacks.
	 *
	 * cachedRequest(url, callback1, callback2, ...);
	 *
	 * Callback receives `false` when request fails.
	 *
	 * @param  {String} url Request URL.
	 *
	 * @return {Void}
	 */
	function cachedRequest(url) {
		var callbacks = Array.prototype.slice.call(arguments, 1);
		var key = url.match(/[a-z0-9_\-]/gi).join('');
		var data = store.get(key);
		var refreshInterval = 60 * 60 * 1000; // milliseconds

		if (data && data.lastcall > +new Date() - refreshInterval) {
			for (var i = 0, l = callbacks.length; i < l; i++) {
				callbacks[i](data.response);
			}
		} else {
			$.ajax(url, { type: 'GET', dataType: 'jsonp', timeout: 3000 }).done(function (response) {
				store.set(key, {
					lastcall: +new Date(),
					response: response
				});

				for (var i = 0, l = callbacks.length; i < l; i++) {
					callbacks[i](response);
				}
			}).fail(function () {
				for (var i = 0, l = callbacks.length; i < l; i++) {
					callbacks[i](false);
				}
			});
		}
	}

	function displayMeta(response) {
		var $version = $('#version');
		var $license = $('#license');
		if (!response) {
			$version.find('.loading')
			.add($license)
			.text('Loading failed');
			return;
		}

		var meta = JSON.parse(Base64.decode(response.data.content));
		var date = meta.date ? moment(meta.date).format('Do MMM YYYY') : 'date N/A';
		var url = meta.licenses[0].url;
		var license = meta.licenses[0].type;

		$version.find('.loading').replaceWith(tim('version', { version: meta.version, date: date }));
		$license.attr('href', url).html(tim('license', { license: license }));
	}

	function displayWatchers(response) {
		var $repo = $('#repo');
		if (!response) {
			$repo.find('.loading').text('Loading failed');
			return;
		}

		$repo.find('.loading').replaceWith(tim('watchers', response.data));
	}

	function displayRepos(response) {
		var $repos = $('#repos');
		if (!response) {
			$repos.text('Loading other repositories failed');
			return;
		}

		var display = $repos.data('display').split(',');
		$repos.html(tim('repos', {
			items: $.grep(response.data, function (repo) {
				repo.url = repo.homepage || repo.html_url;
				return $.inArray(repo.name, display) !== -1;
			}).sort(function (a, b) {
				return a.watchers > b.watchers ? 1 : ( a.watchers < b.watchers ? -1 : 0);
			}).reverse()
		}));
	}

	// Make requests
	cachedRequest(repoURL, displayWatchers);
	cachedRequest(metaURL, displayMeta);
	cachedRequest(reposURL, displayRepos);
});