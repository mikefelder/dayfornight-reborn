var scrollTrigger = false;
var allowHover=true,hoverTimer=null;
var onScroll, update;
var exhibitionsArray = [null, null, null];
var yearArray = [];
var boundHashEvent = false;
var footerOffset = 2000;
var partialInlineWidth = 900;
var rotateGallery;

var wH = $(window).height();
var cH = $("#main").height();

var loadGfxCount = 10,
	loadGfxCurr = 1;

var winW = null, 
	winH = null, 
	mouseX = null, 
	mouseY = null;


(function ($) {	
	$("#app").addClass($(".ca-static .content-wrap").data("section"));
	activateNav($(".ca-static .content-wrap").data("nav"));
})(jQuery);


function activateNav(navValue){
	$(".menu .active").removeClass("active");
	if(typeof(navValue) !== "undefined" && navValue !== ""){
		$(".menu .nav-"+navValue).addClass("active");
	}
}

function setSizes(){ 
	winW = $(window).width();
	winH = $(window).height();
	// console.log(centers);
}
setSizes();
$(window).resize(setSizes);

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

closeModal = function(){
	$("body").removeClass("modal-on").removeClass("gallery-on");
};

setVideo = function(vID){
	var vColor = "00ffff";
	var safeVID = String(vID || "").replace(/[^\d]/g, "");
	var vScr = $(".media-playlist").offset().top;
	if(!safeVID){
		return;
	}
	if($("body").hasClass("mode-night1") || $("body").hasClass("mode-night2")){
		vColor = "f7931e";
	}
	// console.log(vColor);
	var iframeSrc = "https://player.vimeo.com/video/" + safeVID + "?autoplay=1&color=" + vColor + "&title=0&byline=0&portrait=0";
	var $iframe = $("<iframe>")
		.attr("src", iframeSrc)
		.attr("width", "640")
		.attr("height", "360")
		.attr("frameborder", "0")
		.attr("webkitallowfullscreen", "webkitallowfullscreen")
		.attr("mozallowfullscreen", "mozallowfullscreen")
		.attr("allowfullscreen", "allowfullscreen");
	var $vidPad = $("<div>").addClass("vid-pad").append($iframe);
	$(".mainVid").empty().append($vidPad);
	$("html, body").animate({ scrollTop:vScr - 30 });
};

var chipsAJCB = function(){ // This is run every ajax iteration as a callback
	if($(".ca-static").hasClass("ca-static")){
		$("#app").removeClass().addClass($(".ca-static .content-wrap").data("section"));
	} else {
		$("#app").removeClass().addClass($(".ca-current .content-wrap").data("section"));
	}

	$(".hero-video-container .close, .hero-video-container .hero-vid-close-bg").on("click",function(){
		$(".hero-video-container").remove();
	});

	if($(".partial-current").hasClass("partial-current")){
		var activePartial = $(".partial-current").data("url");
		if(typeof(activePartial) !== "undefined"){
			var targetItem = $(".lineup-item[data-url='" + activePartial + "']");
			if(typeof(targetItem) !== "undefined" && targetItem.hasClass("lineup-item") && !targetItem.hasClass("active-lineup-item")){
				$(".active-lineup-item").removeClass("active-lineup-item");
				targetItem.addClass("active-lineup-item");
			}
		}
	}
	$(".lineup-item a").not(".l0d").each(function(){
		$(this).addClass("l0d").on("click",function(e){
			// e.preventDefault(); // TEMP - REMOVE FOR AJAX
			// insideFunc(); // TEMP - REMOVE AFTER AJAX REPLACES THIS
			if($(this).parent().hasClass("active-lineup-item")){
				$(".active-lineup-item").removeClass("active-lineup-item");
				if(winW > partialInlineWidth){
					$(".lineups-wrap").attr("data-active-section", "null");
					$(".lineups-labels-wrap").attr("data-active-section", "null");
					$(".lineups-labels-tabs").attr("data-active-section", "null");
				}
			} else {
				$(".active-lineup-item").removeClass("active-lineup-item");
				$(".lineups-wrap").attr("data-active-section", $(this).data("lineup-section"));
				$(".lineups-labels-wrap").attr("data-active-section", $(this).data("lineup-section"));
				$(".lineups-labels-tabs").attr("data-active-section", $(this).data("lineup-section"));
				$(this).parent().addClass("active-lineup-item");
			}
		});
	});

	$(".lineup-label").not(".l0d").each(function(){
		$(this).addClass("l0d").on("click",function(e){
			// insideFunc(); // TEMP - REMOVE AFTER AJAX REPLACES THIS
			$(".active-lineup-item").removeClass("active-lineup-item");
			$(".lineups-wrap").attr("data-active-section", "null");
			$(".lineups-labels-wrap").attr("data-active-section", "null");
		});
	});

	$(".lineup-tab a").not(".l0d").each(function(){
		$(this).addClass("l0d").on("click",function(e){
			$(".active-lineup-item").removeClass("active-lineup-item");
			$(".lineups-wrap").attr("data-active-section", $(this).data('lineup-section'));
			$(".lineups-labels-wrap").attr("data-active-section", $(this).data('lineup-section'));
			$(".lineups-labels-tabs").attr("data-active-section", $(this).data('lineup-section'));
		});
	});

	$(".stage-data").on("click",function(){
		$(".stage-data.active").removeClass("active");
		$(this).addClass("active");
		$(".schedule-content").attr("data-active-stage", $(this).data("stage"));
	});

	$(".schedule-link a").on("click",function(e){
		e.preventDefault();
		insideFunc();
		if($(this).data("day") === 679){
			$(".schedule-content").attr("data-active-stage", "blue");
		}
		$(".schedule-content").attr("data-schedule-day", $(this).data("day"));
		$(".schedule-content").attr("data-day-name", $(this).data("active-slug"));
		History.replaceState({currPage : '/schedule/' + $(this).data("active-slug")}, 'Schedule | Day for Night', '/schedule/' + $(this).data("active-slug"));
	});

	$(".faq-toggle").not(".l0d").each(function(){
		$(this).addClass("l0d").on("click",function(){
			// insideFunc();
			$("html,body").animate({scrollTop: $(this).offset().top},400);
			$(this).parent().toggleClass("toggle-on");
		});
	});

	$(".mailing-list-toggle").on("click",function(e){
		e.preventDefault();
		$("body").addClass("modal-on");
		setTimeout(function(){
			$("#mce-EMAIL").focus();
		},500);
	});

	$(".modal .close").on("click",function(e){
		e.preventDefault();
		closeModal();
	});

	$(".modal-bg").on("click",function(){
		console.log("closing modal");
		closeModal();
	});

	$(".vid-cover").on("click",function(){
		tempID = $(this).attr("data-id");
		setVideo(tempID);
	});

	$(".media-list li .item-inner").on("click",function(){
		$(".media-list li.active").removeClass("active");
		$(this).parent().addClass("active");

		tempID = $(this).attr("data-id");
		setVideo(tempID);
	});

	$(".menu-toggle").not(".l0d").each(function(){
		$(this).addClass("l0d").on("click",function(){
			$("#app").toggleClass("menu-on");
		});
	});

	$(".tunein-toggle").not(".l0d").each(function(){
		$(this).addClass("l0d").on("click",function(){
			$("body").toggleClass("radio-on");
		});
	});

	$(".has-more-toggle").on("click",function(){
		$(this).parent().parent().find(".readmore-content").show();
		$(this).parent().remove();
	});



	initModalGallery();

	if(winW <= partialInlineWidth){
		if($(".partial-current").hasClass("partial-current")){
			if(!$(".active-lineup-item").hasClass("m-version")){
				$(".active-lineup-item").addClass("m-version").append('<div class="lineup-details-mobile">' + $(".partial-current").html() + '</div>');
				if($(".active-lineup-item").hasClass("active-lineup-item")){
					var newscrollPos = $(".active-lineup-item").offset().top - 100;
					$("html,body").animate({scrollTop: newscrollPos},10);
					setTimeout(function(){
						$("html,body").animate({scrollTop: newscrollPos},10);
					},200)
				}
			}
		}
	}
};
var CHIPSstateCB = function(){
	if(typeof(insideFunc) !== "undefined" && insideFunc !== null){
		insideFunc();
	}
	$(".current-menu-item").removeClass("current-menu-item");
	// console.log(CHIPSAJ.trackPage.replace(wpURL,""));
	// $("body").removeClass().addClass($(".ca-current .content-wrap").data("section"));
};
var CHIPSdefaultsCB = function(){
	CHIPSAJ.defaultTitle = "Day For Night";
};

function debounce(fn, delay) {
  var timer = null;
  return function () {
	var context = this, args = arguments;
	clearTimeout(timer);
	timer = setTimeout(function () {
	  fn.apply(context, args);
	}, delay);
  };
}

function initModalGallery(){
	if($(".modal-gallery").hasClass("modal-gallery") && !$(".modal-gallery").hasClass("gal-init")){
		$(".modal-gallery").addClass("gal-init");
		rotateGallery = new RotateEls(".gallery-full",".gallery-img",".gNavIndex");

		$(".gallery-thumb").on("click",function(){
			var activeGalItem = $(this).data("thumb-target");
			rotateGallery.goto(activeGalItem);
			$("body").addClass("gallery-on");
		});
		$(".modal-gallery .close").on("click",function(){
			$("body").removeClass("gallery-on");
		})
	}
}

var currColor = "#40080B";

/* Paper JS Setup for working in CodePen */
/* ====================== *
 *  0. Initiate Canvas    *
 * ====================== */
paper.install(window);
var insideFunc = null;
var lastRotate = 0;
var randomXPercentage = getRandomInt(0,100);
window.onload = function() {
	with (paper) {
		paper.setup("canvas");
		/* ====================== *
		 *  1. Test Shape         *
		 * ====================== */
		var interval = 8;
		var circleGroup = new Group();
		var circleGroupOverlay = new Group();
		var newPos;
		
		var increasedInc = 3;
		var increasedIncOverlay = 10;

		var randGroup1, randGroup2, randPosX, randPosY;
		
		insideFunc = view.drawRings = function(){
			interval = 8;
			increasedInc = 3;
			increasedIncOverlay = 10;
			circleGroup.remove();
			circleGroupOverlay.remove();
			circleGroup = new Group();
			circleGroupOverlay = new Group();

			randGroup1 = [Math.random() * 2, Math.random()];
			randGroup2 = [Math.random() * 4, Math.random() * 3];


			randPosX = [getRandomInt(-view.center.x, view.viewSize.width + view.center.x), getRandomInt(-view.center.x, view.viewSize.width + view.center.x)];
			randPosY = [getRandomInt(-(view.center.y * 0.5), view.viewSize.height + (view.center.y * 0.5)), getRandomInt(-(view.center.y * 0.5), view.viewSize.height + (view.center.y * 0.5))];

			for (var i = 1; i < interval*5; i++) {
				
				var circle = new Path.Circle({
					radius:  i * (interval*increasedInc),
					position: {
						x:randPosX[0],
						y:randPosY[0]
					},
					strokeColor: currColor,
					strokeWidth: 0.1*i,
					parent:  circleGroup,
				});

				circle.skew(6*randGroup1[0]);
				circle.rotate(i*randGroup1[1]);
				increasedInc=increasedInc+0.1;

				var circleOverlay = new Path.Circle({
					radius:  i * (interval*increasedInc),
					position: {
						x:randPosX[1],
						y:randPosY[1]
					},
					strokeColor: '#000000',
					strokeWidth: i * 1.2,
					parent:  circleGroupOverlay,
				});
				// circleOverlay.scale(randGroup2[1]);
				circleOverlay.rotate(i*1.5);
				circleOverlay.skew(12*randGroup2[0]);
				increasedIncOverlay=increasedIncOverlay+0.3;
			};
			// console.log(view);
		}

		view.drawRings();
		
		view.onResize = function(event) {
			w=window;
			d=document;
			e=d.documentElement;
			g=d.getElementsByTagName('body')[0];
			x=w.innerWidth||e.clientWidth||g.clientWidth;
			y=w.innerHeight||e.clientHeight||g.clientHeight;
		}
	}
}

var simulateTime = false; // Simulate time for easier testing

dayGradient = $(".gradientclass");
function updateGradient(dayPerc) {
  dayGradient.attr("gradientTransform","rotate(" + (dayPerc * 360) + " 0.5 0.5)");
}

var displayMode = "day",
	percComplete = 0;

var todayGlobal = new Date();
function simTime(hour,min){
	console.log(hour,min);
	todayGlobal = new Date(2017,9,19,hour,min);
	doDateDisplay();
}
function getCurrDateData(){
	var today = todayGlobal;
	// var today = new Date(2016,7,16,18,55);
	// console.log(today);
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	if(dd<10){ dd='0'+dd; } 
	if(mm<10){ mm='0'+mm; }

	if(dateData.length > 0){
		for(var d = 0; d < dateData.length; d++){
			if(dateData[d].length > 0 && mm == dateData[d][0] && dd == dateData[d][1] && yyyy == dateData[d][2]){
				return dateData[d];
			}
		}
	}
	return null;
}

function doDateDisplay(){
	var currDay = getCurrDateData();
	// console.log(currDay);
	if(currDay !== null && currDay.length > 0){
		var sunrise = currDay[3].split(":");
		var sunset = currDay[4].split(":");
		var date1 = new Date(currDay[2], +currDay[0] - 1, currDay[1], sunrise[0], sunrise[1]);
		var date2 = new Date(currDay[2], +currDay[0] - 1, currDay[1], sunset[0], sunset[1]);
		var rightNow = new Date();
		if(simulateTime === true){
			rightNow = todayGlobal;
		}
		var dayLength = date2 - date1;
		var nightLength = 86400000 - dayLength;

		var tempDisplayMode = "";
		if(date1 > rightNow){
			percComplete = ((nightLength - (date1 - rightNow)) / nightLength).toFixed(4);
			tempDisplayMode = "night";
			currColor = "#001A3F";
			// console.log("Pre Sunrise: " + percComplete + '% of the night is complete');
		} else if(date1 < rightNow && date2 > rightNow){
			percComplete = ((rightNow - date1) / dayLength).toFixed(4);
			tempDisplayMode = "day";
			currColor = "#520B0E";
			// console.log("During the day: " + percComplete + '% of the day is complete');
		} else {
			percComplete = ((rightNow - date2) / nightLength).toFixed(4);
			tempDisplayMode = "night";
			currColor = "#001A3F";
			// console.log("After sunset: " + percComplete + '% of the night is complete');
		}

		updateGradient(percComplete);

		// Do display stuff here
		if(tempDisplayMode !== displayMode){
			displayMode = tempDisplayMode;
			if(displayMode === 'day'){
				$("body").removeClass("mode-night").addClass("mode-day");
			} else if(displayMode === 'night'){
				$("body").removeClass("mode-day").addClass("mode-night");
			}
			// insideFunc();
		}
	}
}

if(simulateTime === true){
	var newHour = 0;
	setInterval(function(){
		newHour++;
		if(newHour > 23){
			newHour = 0;
		}
		simTime(newHour,10);
	},1000);
} else {
	doDateDisplay();
	setInterval(doDateDisplay,10000); // Re-check every 10 seconds
}