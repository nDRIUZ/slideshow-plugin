let slideContainer = "";
let posX1 = 0,
	posX2 = 0,
	threshold = 100,
	posFinal,
	posInitial;

window.onload = function () {};
let slideIndex = 1;

document.addEventListener("DOMContentLoaded", function () {
	slideContainer = document.getElementById("slideshow-container");
	swipedetect(slideContainer, function (swipedir) {
		if (swipedir == "left") {
			plusSlides(-1);
		} else if (swipedir == "right") {
			plusSlides(1);
		}
	});

	showSlides(slideIndex);
});

function plusSlides(n) {
	showSlides((slideIndex += n));
}

function currentSlide(n) {
	showSlides((slideIndex = n));
}

function showSlides(n) {
	let i;
	let slides = document.getElementsByClassName("slide");
	let dots = document.getElementsByClassName("slide-dot");
	if (n > slides.length) {
		slideIndex = 1;
	}
	if (n < 1) {
		slideIndex = slides.length;
	}
	for (i = 0; i < slides.length; i++) {
		slides[i].style.display = "none";
	}
	for (i = 0; i < dots.length; i++) {
		dots[i].className = dots[i].className.replace(" active", "");
	}
	slides[slideIndex - 1].style.display = "block";
	dots[slideIndex - 1].className += " active";
}

var swipedetect = function (el, callback) {
		var touchsurface = el,
			swipedir,
			startX,
			distX,
			mousedown = 0,
			threshold = 150,
			allowedTime = 1000,
			elapsedTime,
			startTime,
			swipeStart,
			swipeMove,
			swipeEnd,
			handleswipe = callback || function (swipedir) {};

		swipeStart = function (e) {
			if ((e.type = "mouseDown")) {
				mousedown = 1;
			}

			if (e.changedTouches) {
				var touch = e.changedTouches[0];

				startX = touch.pageX;
			} else {
				startX = e.pageX;
			}

			distX = 0;
			distY = 0;
			swipedir = "none";
			startTime = new Date().getTime();
		};

		swipeMove = function (e) {
			if ((e.type == "mousemove" && mousedown) || e.type != "mousemove") {
				e.preventDefault();
			}
		};

		swipeEnd = function (e) {
			if ((e.type = "mouseDown")) {
				mousedown = 0;
			}

			if (e.changedTouches) {
				var touch = e.changedTouches[0];

				distX = touch.pageX - startX;
			} else {
				distX = e.pageX - startX;
			}

			elapsedTime = new Date().getTime() - startTime;

			if (elapsedTime <= allowedTime) {
				if (Math.abs(distX) >= threshold) {
					swipedir = distX < 0 ? "left" : "right";
				}
			}

			handleswipe(swipedir);
		};

		addMultiListeners(touchsurface, "touchstart mousedown", swipeStart);
		addMultiListeners(touchsurface, "touchmove mousemove", swipeMove);
		addMultiListeners(touchsurface, "touchend mouseup", swipeEnd);
	},
	addMultiListeners = function (element, events, listener) {
		var i;

		events = events.split(" ");

		for (i = events.length - 1; i >= 0; i--) {
			element.addEventListener(
				events[i],
				function (e) {
					listener(e);
				},
				false
			);
		}
	};
