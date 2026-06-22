var RotateEls = function (selector,childSelector,navSelector,extNavSelector,startSlide,updateURL) {
	this.selector = selector;
	this.elSize = $(selector).find(childSelector).length;
	this.firstLoad = true;
	if(typeof(navSelector) !== "undefined"){
		this.navEl = navSelector;
	} else {
		this.navEl = null;
	}
	if(typeof(startSlide) !== "undefined"){
		this.curr = startSlide;
	} else {
		this.curr = 1;
	}
	var scopeThis = this;

	this.next = function(){
		var temp = this.curr + 1;
		if(temp > this.elSize){
			temp = 1;
		}
		this.curr = temp;
		this.updateDOM();
	};
	this.prev = function(){
		var temp = this.curr - 1;
		if(temp < 1){
			temp = this.elSize;
		}
		this.curr = temp;
		this.updateDOM();
	};
	this.goto = function(index){
		this.curr = index;
		this.updateDOM();
	};

	$('.next').on("click",function(){
		scopeThis.next();
		clearInterval(scopeThis.rotateGalTimer);
		$(selector).removeClass("isCyclingAuto");
	});
	$(selector + ' img').on("click",function(){
		scopeThis.next();
		clearInterval(scopeThis.rotateGalTimer);
		$(selector).removeClass("isCyclingAuto");
	});
	$('.prev').on("click",function(){
		scopeThis.prev();
		clearInterval(scopeThis.rotateGalTimer);
		$(selector).removeClass("isCyclingAuto");
	});
	$(selector + ' .nav-dot, ' + extNavSelector).on("click",function(){
		scopeThis.goto($(this).index()+1);
		clearInterval(scopeThis.rotateGalTimer);
		$(selector).removeClass("isCyclingAuto");
		$(selector).addClass("userClicked");
	});

	scopeThis.rotateGalTimer = null;
	scopeThis.startTimer = function(timingDuration){
		$(selector).addClass("isCyclingAuto");
		scopeThis.rotateGalTimer = setInterval(function(){
			scopeThis.next();
		},timingDuration);
	};

	this.lazyloadImg = function(){
		var sel = $(selector).find(childSelector).eq(scopeThis.curr-1);
		if(sel.hasClass("lazyload")){
			sel.removeClass("lazyload").css({"background-image":"url(" + sel.data("src") + ")"});
		}

		setTimeout(function(){
			sel = $(selector).find(childSelector).eq(scopeThis.curr - 2);
			if(sel.hasClass("lazyload")){
				sel.removeClass("lazyload").css({"background-image":"url(" + sel.data("src") + ")"});
			}
			sel = $(selector).find(childSelector).eq(scopeThis.curr);
			if(sel.hasClass("lazyload")){
				sel.removeClass("lazyload").css({"background-image":"url(" + sel.data("src") + ")"});
			}
		},1000);
			
	};

	this.updateDOM = function(){
		scopeThis.lazyloadImg();
		$(selector + ' .active').removeClass("active");
		$(selector).find(childSelector).eq(scopeThis.curr-1).addClass("active");
		if(scopeThis.navEl !== null){
			$(scopeThis.navEl).eq(scopeThis.curr-1).addClass("active");
		}
		if(scopeThis.navEl !== null){
			$(selector).find(scopeThis.extNavEl+'.active').removeClass("active");
			$(selector).find(scopeThis.extNavEl).eq(scopeThis.curr-1).addClass("active");
		}

		$(".gal-curr").html(scopeThis.curr);
		if(typeof(updateURL) !== "undefined" && updateURL === true){
			// window.location.hash = scopeThis.curr;
			if(history.replaceState) {
				if(scopeThis.firstLoad === true){
					scopeThis.firstLoad = false;
				} else {
					history.replaceState(null, null, '#'+scopeThis.curr);
				}
			}
		}

		if(selector === '.partner-list'){
			$(".partner-list").attr("data-activegroup",scopeThis.curr);
			var groupTitle = $(selector).find(childSelector).eq(scopeThis.curr-1).data("partner-name");
			$(".partner-group-title").html(groupTitle);
			var newHeight = $(selector).find(childSelector).eq(scopeThis.curr-1).height();
			if(newHeight > 100){
				$(".partner-list .contents").css({"min-height":newHeight});
			}
		}
	};
	if(typeof(extNavSelector) !== "undefined"){
		this.extNavEl = extNavSelector;
		$(this.extNavEl).addClass("hasNav");
		$(this.extNavEl).eq(0).addClass("active");
		$(extNavSelector).on("click",function(){
			scopeThis.curr = $(this).index() + 1;
			scopeThis.updateDOM();
			$(".gallery-content").removeClass("grid-mode");
		});
	} else {
		this.extNavEl = null;
	}
	this.updateDOM();

	$(document).on("keypress keydown", function(e){
		// console.log(e.which, e.keyCode);
		if(e.keyCode === 39) {
			scopeThis.next();
			clearInterval(scopeThis.rotateGalTimer);
			$(selector).removeClass("isCyclingAuto");
		} else if (e.keyCode == 37) {
			scopeThis.prev();
			clearInterval(scopeThis.rotateGalTimer);
			$(selector).removeClass("isCyclingAuto");
		}
	});
};