/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(0);

__webpack_require__(8);

__webpack_require__(9);

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// index helpers
$('.time-piece.active').on('click', function () {
	return $('body').addClass('dimmed');
});
var timeLines = $('.meeting-ui__time-line');
var lastScrollLeft = $('.meeting-ui').scrollLeft();
var calendarElem = $('.calendar');
var meetingInfo = $('.meeting-info');
$('.month-UTC').each(function (i, elem) {
	return $(elem).text(getLetterMonthRu($(elem).text()));
});
$(window).scroll(function () {
	$('.time-piece.placed .meeting-info').addClass('hidden');
	calendarElem.addClass('hidden');
	calendarElem.css('transform', 'translate(0, ' + $(window).scrollTop() + 'px)');
	timeLines.css({
		position: 'fixed',
		transform: 'translate(-' + lastScrollLeft + 'px, 0)'

	});
});
$('.meeting-ui').scroll(function () {
	if (lastScrollLeft !== $('.meeting-ui').scrollLeft()) {
		$('.time-piece.placed .meeting-info').addClass('hidden');
		calendarElem.addClass('hidden');
		timeLines.css({
			position: 'absolute',
			transform: 'translate(0, ' + $(window).scrollTop() + 'px)'
		});
		lastScrollLeft = $('.meeting-ui').scrollLeft();
	}
});
$('.day-switcher__date').on('click', function () {
	return calendarElem.toggleClass('hidden');
});
$('.time-piece.placed').on('click', function (event) {
	var target = $(event.target);
	var width = window.innerWidth;
	var offset = target.offset().left;
	var widthElem = parseInt(target.css('width'), 10);
	console.log(widthElem);
	var meetingInfoWidth = parseInt(target.find('.meeting-info').css('width'), 10);
	var needOffset = void 0;
	var rightTrigger = offset + widthElem / 2 + meetingInfoWidth / 2;
	var leftTrigger = offset + widthElem / 2 - meetingInfoWidth / 2;
	var cornerOffset = void 0;

	target.find('.meeting-info').toggleClass('hidden');
	if (!(rightTrigger < width && leftTrigger > 0)) {
		if (rightTrigger < width) {
			needOffset = leftTrigger - widthElem / 2;
			cornerOffset = offset + widthElem / 2;
			console.log('r<w', leftTrigger, offset);
		}
		if (leftTrigger > 0) {
			needOffset = rightTrigger - width - widthElem / 2;
			cornerOffset = meetingInfoWidth - (width - offset) + widthElem / 2;
		}

		target.find('.meeting-info').css('left', -needOffset + 'px');
		target.find('.meeting-info__corner').css('left', cornerOffset + 'px');

		if (rightTrigger < width && leftTrigger > 0) {
			console.log('both');
			$('.meeting-info').css('left', widthElem / 2 + 'px');
			$('.meeting-info__corner').css('left', meetingInfoWidth / 2 + 'px');
		}
	} else {
		console.log("true");
		$('.meeting-info').css('left', widthElem / 2 + 'px');
		$('.meeting-info__corner').css('left', meetingInfoWidth / 2 + 'px');
	}
});

// fix styles TODO:[A.Ivankov] вынести в стили
// let reg = /Firefox/ig;
// if (reg.test(window.navigator.userAgent)) {
// 	$('.input-block__input_time').css('padding', '0')
// }

// fix for pages edit and add
$('.input-block__input_members').focus(function () {
	$('.member-list').fadeIn(500);
});
$('.input-block__input_members').focusout(function () {
	$('.member-list').fadeOut(500);
});
$(".input-block__input_data").on("change", function () {
	this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format(this.getAttribute("data-date-format")));
}).trigger("change");
var regExp = /Firefox/ig;
if (regExp.test(window.navigator.userAgent)) {
	$('.input-block__input_time').css('padding', '0');
	$('.input-block__icon_calendar').css('right', '40px');
};

// функция замены числового месяца на слово
function getLetterMonthRu(month) {
	return ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][month];
}

// обработчики клика для добавления людей
$('.member-list__element').on('click', function (event) {
	var target = $(event.target);
	var login = target.data('name');
	$('.add-member-list__element[data-name=' + login + ']').removeClass('hidden').find('.member-list__checkbox')[0].checked = true;
});

// обработчик удаления людей из списка
$('.button-delete_add-member').on('click', function (event) {
	var target = $(event.target);
	target.parents('.add-member-list__element').addClass('hidden').find('.member-list__checkbox')[0].checked = false;
});

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function calendar(id, year, month) {
  var Dlast = new Date(year, month + 1, 0).getDate(),
      D = new Date(year, month, Dlast),
      DNlast = new Date(D.getFullYear(), D.getMonth(), Dlast).getDay(),
      DNfirst = new Date(D.getFullYear(), D.getMonth(), 1).getDay(),
      calendar = '<tr>',
      month = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  if (DNfirst !== 0) {
    for (var i = 1; i < DNfirst; i++) {
      calendar += '<td>';
    }
  } else {
    for (var i = 0; i < 6; i++) {
      calendar += '<td>';
    }
  }
  for (var i = 1; i <= Dlast; i++) {
    if (i === new Date().getDate() && D.getFullYear() === new Date().getFullYear() && D.getMonth() === new Date().getMonth()) {
      calendar += '<td class="today">' + i;
    } else {
      calendar += '<td>' + i;
    }
    if (new Date(D.getFullYear(), D.getMonth(), i).getDay() === 0) {
      calendar += '<tr>';
    }
  }
  for (var i = DNlast; i < 7; i++) {
    calendar += '<td> ';
  }document.querySelector('#' + id + ' tbody').innerHTML = calendar;
  document.querySelector('#' + id + ' thead td:nth-child(2)').innerHTML = month[D.getMonth()] + ' ' + D.getFullYear();
  document.querySelector('#' + id + ' thead td:nth-child(2)').dataset.month = D.getMonth();
  document.querySelector('#' + id + ' thead td:nth-child(2)').dataset.year = D.getFullYear();
  if (document.querySelectorAll('#' + id + ' tbody tr').length < 6) {
    // чтобы при перелистывании месяцев не "подпрыгивала" вся страница, добавляется ряд пустых клеток. Итог: всегда 6 строк для цифр
    document.querySelector('#' + id + ' tbody').innerHTML += '<tr><td> <td> <td> <td> <td> <td> <td> ';
  }
}

if ($('#calendar').length !== 0) {
  calendar("calendar", new Date().getFullYear(), new Date().getMonth());
  // переключатель минус месяц
  document.querySelector('#table-arrow-left').onclick = function () {
    calendar("calendar", document.querySelector('#calendar thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar thead td:nth-child(2)').dataset.month) - 1);
  };
  // переключатель плюс месяц
  document.querySelector('#table-arrow-right').onclick = function () {
    calendar("calendar", document.querySelector('#calendar thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar thead td:nth-child(2)').dataset.month) + 1);
  };
}

/***/ })
/******/ ]);
//# sourceMappingURL=App.bundle.js.map