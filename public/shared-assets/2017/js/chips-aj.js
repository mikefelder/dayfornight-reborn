var CHIPSAJ = {
	ajaxMode:true,
	mouseClick:false,
	mouseClickTrack:null,
	pageTitle:null,
	tempTitle:null,
	defaultTitle:"",
	tempSection:null,
	tempNav:null,
	currentSection:null,
	backLink: null,
	trackScroll:null,
	trackPage:null,
	lastPage:null,
	backButton:false,
	manualStateChange:false,
	lodTimer:null,


	infiniteHTML:'',

	lastSection:null,
	init: function() {
		var scopeThis = this;
		if(typeof(devenv) !== "undefined" && devenv == "chips-dev"){
			scopeThis.ajaxMode = true;
		}
		if(typeof(CHIPSdefaultsCB) !== 'undefined'){
			CHIPSdefaultsCB();
		}

		History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
			$("body").removeClass("mobile-on");
			$(".footer-top").removeClass("topOn");
			$(".ca-static").addClass("ca-content");
			var State = History.getState(); // Note: We are using History.getState() instead of event.state
			
			scopeThis.lastPage = scopeThis.trackPage;
			scopeThis.trackPage = State.url;

			var urlSections = scopeThis.trackPage.replace(wpURL,"").split("/");
			var sameSection = false;
			if(typeof(urlSections[0]) !== "undefined"){
				var compareSection = urlSections[0];
				if(compareSection === '2007'){ compareSection = urlSections[1]; }
				if(compareSection === scopeThis.lastSection){
					sameSection = true;
				}
				scopeThis.lastSection = compareSection;
			}

			if(scopeThis.manualStateChange === true){
				// console.log("Caught the back button, scrolling to " + scopeThis.trackScroll);
				scopeThis.backButton = true;
			}
			scopeThis.manualStateChange = true;

			// var thisURL = State.url;
			// if(!thisURL.includes("?s=")){
			// 	$(".searchauto").addClass("trnz");
			// }

			var proceedWRequest = true;
			// console.log(State.url);
			if(State.url.indexOf('schedule/dec-15') !== -1 || State.url.indexOf('schedule/dec-16') !== -1 || State.url.indexOf('schedule/dec-17') !== -1){
				// if(scopeThis.manualStateChange === true){
				if($(".schedule-nav").hasClass("schedule-nav")){
					proceedWRequest = false;
				} else {
					proceedWRequest = true;
				}
			}

			if(proceedWRequest === true){
				if(typeof(State.data.currPage) !== 'undefined' && State.data.currPage.indexOf('Partial') !== -1){
					requestPartial(State.url, scopeThis.backButton);
				} else {
					requestContent(State.url, scopeThis.backButton);
				}
				if(typeof(CHIPSstateCB) !== 'undefined'){
					CHIPSstateCB();
				}
			}
		});

		$(document).on("click",".aj",function(e){  // CAUGHT AJAX LINK CLICK EVENT
			if (e.metaKey || e.ctrlKey) {  
			    return;
			} else {
				e.preventDefault();
				var targetURL = $(this).attr("href");
				scopeThis.trackScroll = $(window).scrollTop();
				if (window.location.pathname  !== targetURL) {
					scopeThis.manualStateChange = false;
					if($(this).attr("data-partial")){
						History.pushState({currPage : 'Partial: ' + targetURL}, 'Loading', targetURL);
					} else {
						History.pushState({currPage : targetURL}, 'Loading', targetURL);
					}
				}
			}
		});

		var currRequest = null;
		function requestContent(file, isBackButton) {
			var pageURL = window.location.pathname;
			$(".partial-target").html(""); // Not loading a partial. Flush it out
			$("footer,.content-loading, .loading").addClass("isLoading");
			if(currRequest !== null){
				currRequest.abort();
			}
			$(".ca-current, .ca-static").removeClass("ca-current").addClass("ca-leaving");
			setTimeout(function(){
				$(".ca-static, .ca-leaving").remove();
				cleanupAjax();
			},200);
			var separator = '?';
			if(file.indexOf('?') !== -1){
				separator = '&';
			}
			if(isBackButton === true && scopeThis.trackScroll !== null){
				$(".ca-leaving").hide();
			}
			var loadPath;
			if(file.indexOf(wpURL) > -1 || file.indexOf("http") < 0){
				loadPath = file;
			} else {
				loadPath = wpURL+file;
			}
			currRequest = $.get(loadPath, function (data){
				var matches = data.match(/<title>(.*?)<\/title>/);
				var spUrlTitle = matches[1];
				if(typeof(matches[1]) !== "undefined"){
					document.title = spUrlTitle;
				}
				data = $(data).find(".ca-static").html();
				$(".trnz").removeClass("trnz");

				var injectData = data;
				$("#holdingPen").append('<div class="ca-content ca-current" data-url="' + pageURL + '">' + injectData + '</div>');
				if(isBackButton === true && scopeThis.trackScroll !== null){
					$("html,body").animate({scrollTop : scopeThis.trackScroll},1);
					scopeThis.trackScroll = 0;
				} else {
					$("html,body").animate({scrollTop : 0},1);
				}
				scopeThis.pageLoadCB();
				currRequest = null;
				clearTimeout(scopeThis.lodTimer);
				$(".content-loading, .loading").removeClass("isLoading");
				scopeThis.lodTimer = setTimeout(function(){
					$("footer").removeClass("isLoading");
				},300);
				cleanupAjax();
				scopeThis.backButton = false;
			});
		}

		function requestPartial(file,isBackButton) {
			if(!$(".partial-target").hasClass("partial-target")){
				requestContent(file,isBackButton);
			} else {
				var pageURL = window.location.pathname;
				$("footer").addClass("isLoading");
				if(currRequest !== null){
					currRequest.abort();
				}
				$(".partial-current").removeClass("partial-current").addClass("partial-leaving");
				setTimeout(function(){
					$(".partial-leaving").remove();
				},50);
				currRequest = $.get(file, function (data){
					var matches = data.match(/<title>(.*?)<\/title>/);
					var spUrlTitle = matches[1];
					if(typeof(matches[1]) !== "undefined"){
						document.title = spUrlTitle;
					}
					$(".trnz").removeClass("trnz");
					data = $(data).find(".partial-content").html();
					randMask = getRandomInt(1,20);
					$(".partial-target").append('<div class="partial-content partial-current mask-' + randMask + '" data-url="' + pageURL + '">' + data + '</div>');
					$("html,body").animate({scrollTop : 0},1);
					$("#lineupArtist").animate({scrollTop : 0},1);
					scopeThis.pageLoadCB();
					currRequest = null;
					$("footer").removeClass("isLoading");
					cleanupAjax();
				});
			}
		}

		function cleanupAjax(){
			$(".ca-content").each(function(){
				if($(this).hasClass("ca-past") && $(this).find(".partial-target").hasClass("partial-target")){
					$(this).remove();
				}
			});
			$(".ca-past").remove();
			
			if($(".ca-static .content-wrap").hasClass("content-wrap")){
				scopeThis.tempTitle = $(".ca-static .content-wrap").data("title");
				scopeThis.tempTitlespan = $(".ca-static .content-wrap").data("titlespan");
				scopeThis.pageTitle = scopeThis.tempTitle;
				tempSubSection = $(".partial-current section").data("section");
				tempNav = $(".ca-static .content-wrap").data("nav");
				activateNav(tempNav);
			} else if($(".ca-current .content-wrap").hasClass("content-wrap")){
				scopeThis.tempTitle = $(".ca-current .content-wrap").data("title");
				scopeThis.tempTitlespan = $(".ca-current .content-wrap").data("titlespan");
				if(scopeThis.tempTitle !== scopeThis.pageTitle){
					scopeThis.pageTitle = scopeThis.tempTitle;
					// document.title = scopeThis.pageTitle + " | " + scopeThis.defaultTitle;
				}
				tempSubSection = $(".partial-current section").data("section");
				tempNav = $(".ca-current .content-wrap").data("nav");
				activateNav(tempNav);
			}
			$("header h1 i").html(scopeThis.tempTitlespan);
			
			if(typeof(chipsAJCB) !== "undefined"){
				chipsAJCB();
			}
		}

		cleanupAjax();
		scopeThis.pageLoadCB();
	},
	pageLoadCB:function(){
		this.rerouteLinks();
	},
	rerouteLinks : function(){
		var scopeThis = this;
		allowHover = false;
		clearTimeout(hoverTimer);
		hoverTimer = setTimeout(function(){
			allowHover = true;
		},2000);

		$("#app a").not(".linkInit,.noAjax,.aj,.no-aj,.checkout-button,.remove-text,.search-toggle,.page-anchor").each(function(){
			$(this).addClass("linkInit");
			var targetURL = $(this).attr("href");
			if(typeof(targetURL) !== "undefined"){
				if(targetURL.indexOf(".pdf") > -1 || targetURL.indexOf("mailto:") > -1 || targetURL.indexOf("javascript:") > -1){
					$(this).addClass("noAjax");
				} else {
					if(targetURL.indexOf(wpURL) > -1 || targetURL.indexOf("http") < 0){
						if(scopeThis.ajaxMode === true){
							$(this).addClass("aj");
						}
					}
				}
			}
		});

		// $("#app a").not(".linkInit,.noAjax,.aj,.checkout-button,.remove-text,.search-toggle,.page-anchor").each(function(){
		// 	$(this).addClass("linkInit");
		// 	var targetURL = $(this).attr("href");
		// 	if(typeof(targetURL) !== "undefined"){
		// 		if(targetURL.indexOf(".pdf") > -1 || targetURL.indexOf("mailto:") > -1 || targetURL.indexOf("javascript:") > -1){
		// 			$(this).addClass("noAjax");
		// 		} else {
		// 			if(targetURL.indexOf(wpURL) > -1 || (targetURL.indexOf("http") < 0 && targetURL.indexOf("mailto") < 0 && targetURL.indexOf(".pdf") < 0)){
		// 				if(scopeThis.ajaxMode === true){
		// 					$(this).addClass("aj");
		// 				}
		// 			}
		// 		}
		// 	}
		// });

		$(".page-anchor").on("click",function(e){
			e.preventDefault();
			var thisTarget = $(this).data("target");
			if($(".section-"+thisTarget).hasClass("section-"+thisTarget)){
				var newScrollTarget = $(".section-"+thisTarget).offset().top - 130;
				$("html,body").animate({scrollTop : newScrollTarget},800);
			}
		});
	}
};

CHIPSAJ.init();
