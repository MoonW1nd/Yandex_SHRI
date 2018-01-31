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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRecommendation = getRecommendation;
function getRecommendation(date, members, db) {

  // sort rooms by floors
  var floors = [];
  var rooms = JSON.parse(JSON.stringify(db.rooms));
  var startEventDate = Date.parse(date.start);
  startEventDate = new Date(startEventDate);
  var needDate = new Date(startEventDate.getFullYear(), startEventDate.getMonth(), startEventDate.getDate());
  var needDateTrigerStart = needDate.getTime();
  var needDateTrigerEnd = needDate.getTime() + 86400000;
  // фильтруем по дате
  db.events = db.events.filter(function (event) {
    return needDateTrigerStart < Date.parse(event.date.start) < needDateTrigerEnd;
  });
  rooms.forEach(function (room) {
    if (floors.indexOf(room.floor) === -1) {
      floors.push(room.floor);
    }
  });
  floors = floors.map(function (floor) {
    return { floorNumber: floor };
  });
  // надем сумму этажей пройдееную всеми участниками для каждого этажа
  floors.forEach(function (floor) {
    var floorNumber = floor.floorNumber;
    floor.count = 0; // init count

    members.forEach(function (member) {
      floor.count += Math.abs(member.floor - parseInt(floorNumber, 10));
    });
  });
  // // сортируем по меньшему числу пройденных этажей
  floors.sort(function (a, b) {
    return a.count - b.count;
  });
  // // ищем подходящие комнаты на этом этаже
  var allRecommendation = [];
  floors.forEach(function (floor) {
    var recommendedRooms = rooms.filter(function (room) {
      return room.floor === floor.floorNumber;
    });
    // фильтрровка и сортировка по вместимости
    recommendedRooms = recommendedRooms.filter(function (room) {
      return room.capacity >= members.length;
    });
    recommendedRooms.sort(function (a, b) {
      return a.capacity - b.capacity;
    });
    floor.rooms = JSON.parse(JSON.stringify(recommendedRooms));
    // проверка по времени
    var copyEvents = JSON.parse(JSON.stringify(db.events));
    recommendedRooms.forEach(function (room) {
      var eventsInRoom = copyEvents.filter(function (event) {
        return event.room === parseInt(room.id, 10);
      });
      room.dateValid = true;
      room.events = eventsInRoom;

      // validation date
      eventsInRoom.forEach(function (eventInRoom) {
        var dateStartValid = Date.parse(date.start) >= Date.parse(eventInRoom.date.end);
        var dateEndValid = Date.parse(date.end) <= Date.parse(eventInRoom.date.start);
        if (!(dateEndValid || dateStartValid)) {
          room.dateValid = false;
        }
      });
    });
    allRecommendation = allRecommendation.concat(recommendedRooms);
  });
  console.log(allRecommendation);
  //копируем для будующих операций
  var roomsWithEvents = JSON.parse(JSON.stringify(rooms));
  // set recommended rooms id

  allRecommendation = allRecommendation.filter(function (room) {
    return room.dateValid;
  });
  if (allRecommendation.length !== 0) {
    var result = [];
    allRecommendation.forEach(function (room) {
      result.push({
        date: {
          start: date.start,
          end: date.end
        },
        room: room.id,
        swap: []
      });
    });
    return result;
  } else {
    // find all event in this period
    var copyEvents = db.events.slice();
    copyEvents = copyEvents.filter(function (event) {
      var firstCondition = Date.parse(event.date.end) > Date.parse(date.start) && Date.parse(date.end) > Date.parse(event.date.start);

      var secondCondition = Date.parse(date.start) <= Date.parse(event.date.start) && Date.parse(date.end) >= Date.parse(event.date.end);

      var thirdCondition = Date.parse(date.start) >= Date.parse(event.date.start) && Date.parse(date.end) <= Date.parse(event.date.end);
      return firstCondition || secondCondition || thirdCondition;
    });
    // проходимся по всем пересекающимся с нужным времем event'ам
    copyEvents.forEach(function (event) {
      // берем комнаты и проходимся по всем ивентам в комнатах
      rooms.forEach(function (room) {
        if (parseInt(room.id, 10) !== event.room) {
          var enableTransfer = true;
          room.events.forEach(function (eventInRoom) {
            // смотрим можно ли в эту комнату перенести переговорку
            var firstCondition = Date.parse(eventInRoom.date.end) > Date.parse(event.date.start) && Date.parse(event.date.end) > Date.parse(eventInRoom.date.start);

            var secondCondition = Date.parse(event.date.start) <= Date.parse(eventInRoom.date.start) && Date.parse(event.date.end) >= Date.parse(eventInRoom.date.end);

            var thirdCondition = Date.parse(event.date.start) >= Date.parse(eventInRoom.date.start) && Date.parse(event.date.end) <= Date.parse(eventInRoom.date.end);
            var dateValid = firstCondition || secondCondition || thirdCondition;

            // прошли ли все проверки по совместимости
            if (dateValid) {
              enableTransfer = false;
            }
          });
          // если все мероприятия прошли проверку совместимости то его можно перенести
          if (enableTransfer) {
            if (Array.isArray(room.swap)) {
              var duplicate = room.swap.filter(function (item) {
                return item.eventMain === event.id;
              });
              if (duplicate.length === 0) {
                room.swap.push({
                  event: event.id,
                  room: room.id,
                  roomEvent: event.room
                });
              }
            } else {
              room.swap = [{
                event: event.id,
                room: room.id,
                roomEvent: event.room
              }];
            }
          }
        }
      });
    });
    var _result = [];
    var allSwaps = [];
    // создвем мвссив для ответа
    rooms.forEach(function (room) {
      if (room.swap != null) {
        allSwaps = allSwaps.concat(room.swap);
      }
    });
    // return allSwaps
    allSwaps.forEach(function (swap) {
      var room = db.rooms.filter(function (room) {
        return parseInt(swap.roomEvent, 10) === parseInt(room.id, 10);
      });
      // console.log(room);
      if (room[0] != null) {
        swap.floorEvent = room[0].floor;
      }
    });

    var sortSwapsByFloor = [];
    // сортировка комнат по наименьшему количеству пройденных этажей
    floors.forEach(function (floor) {
      var swaps = allSwaps.filter(function (swap) {
        return String(floor.floorNumber) === String(swap.floorEvent);
      });
      // соединяем возможные переносы по комнатам которые освободятся
      sortSwapsByFloor.push(swaps);
    });
    // сортируем по освобождающимяся комнатам
    var resultMassive = [];
    sortSwapsByFloor.forEach(function (floorSwaps) {
      floorSwaps.sort(function (a, b) {
        return a.roomEvent - b.roomEvent;
      });
      var trigger = null;
      floorSwaps.forEach(function (swap) {
        if (swap.roomEvent !== trigger) {
          trigger = swap.roomEvent;
          resultMassive.push([swap]);
        } else {
          resultMassive[resultMassive.length - 1].push(swap);
        }
      });
    });

    // создаем требуемый формат ответа
    resultMassive.forEach(function (swaps) {
      _result.push({
        date: {
          start: date.start,
          end: date.end
        },
        room: swaps[0].roomEvent,
        swap: swaps.map(function (element) {
          return { event: element.event, room: element.room };
        })
      });
    });
    if (_result.length !== 0) {
      return _result;
    } else {
      // блок подбора времни по времени освобождения переговоро
      var timeDiff = Date.parse(date.end) - Date.parse(date.start);
      var endTime = new Date(Date.parse(date.start));
      endTime.setHours(23);
      endTime.setMinutes(0);
      var eventsWithNewTime = [];
      roomsWithEvents.forEach(function (room) {
        var events = room.events;
        var eventsAfterStart = events.filter(function (event) {
          return Date.parse(event.date.end) > Date.parse(date.start);
        });
        eventsAfterStart.forEach(function (eventAfterStart) {
          var newDate = {
            start: Date.parse(eventAfterStart.date.end),
            end: Date.parse(eventAfterStart.date.end) + timeDiff,
            room: eventAfterStart.room,
            validEvent: false
          };
          events.forEach(function (eventValidation) {
            console.log(eventValidation);
            var dateStartValid = newDate.start >= Date.parse(eventValidation.date.end);
            var dateEndValid = newDate.end <= Date.parse(eventValidation.date.start);
            if ((dateEndValid || dateStartValid) && newDate.end < endTime.valueOf()) {
              newDate.dateValid = true;
            }
          });
          eventsWithNewTime.push(newDate);
        });
      });
      // фильтр по ближайшей освободившейся переговрке
      eventsWithNewTime.sort(function (a, b) {
        return a.start - b.start;
      });
      var recommendation = [];
      eventsWithNewTime.forEach(function (event) {
        recommendation.push({
          date: {
            start: new Date(event.start).toISOString(),
            end: new Date(event.end).toISOString()
          },
          room: event.room,
          swap: []
        });
      });
      return recommendation;
    }
  }
};

/***/ }),
/* 1 */
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _getRecomendation = __webpack_require__(0);

// index helpers scroll behavior
// $('.time-piece.active').on('click', () => $('body').addClass('dimmed'));
var timeLines = $('.meeting-ui__time-line');
var lastScrollLeft = $('.meeting-ui').scrollLeft();
var calendarElem = $('.calendar');

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
    if (lastScrollLeft > 250) {
      $(".table-meeting-room__floor-name-swipe").removeClass('hidden').css('left', lastScrollLeft - 238 + 'px').css('opacity', '1');
    } else {
      $(".table-meeting-room__floor-name-swipe").addClass('hidden');
    }
    console.log(lastScrollLeft);
  }
});

// helpers for position information about Event
$('.wrapper-date').on('click', function () {
  return calendarElem.toggleClass('hidden');
});
$('.time-piece.placed').on('click', function (event) {
  var target = $(event.target);
  var width = window.innerWidth;
  var offset = target.offset().left;
  var widthElem = parseInt(target.css('width'), 10);
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

// stiles for firefox browser
var regExp = /Firefox/ig;
if (regExp.test(window.navigator.userAgent)) {
  $('.input-block__input_time').css('padding', '0');
  $('.input-block__icon_calendar').css('right', '40px');
};

// функция замены числового месяца на слово
function getLetterMonthRu(month) {
  return ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][month];
}
// функция замены числового месяца на слово
function getLetterMonthShortRu(month) {
  return ['янв', 'фев', 'мaр', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][month];
}

// обработчики клика для добавления людей
$('.member-list__element').on('click', function (event) {
  var target = $(event.target);
  // сврываем из списка эдемнтов
  target.addClass('hidden');
  var login = target.data('name');
  $('.add-member-list__element[data-name=' + login + ']').removeClass('hidden').find('.member-list__checkbox')[0].checked = true;
  // для того чтобы не сбрасывала выбранную комнату
  if ($('.offer-meeting-room__element.active').length === 0) {
    validationDateAndSendQuery();
  }
});

// обработчик удаления людей из списка
$('.button-delete_add-member').on('click', function (event) {
  var target = $(event.target);
  var login = target.parents('.add-member-list__element').data('name');
  $('.member-list__element[data-name=' + login + ']').removeClass('hidden');
  target.parents('.add-member-list__element').addClass('hidden').find('.member-list__checkbox')[0].checked = false;
  // для того чтобы не сбрасывала выбранную комнату
  console.log($('.offer-meeting-room__element.active').length === 0);
  if ($('.offer-meeting-room__element.active').length === 0) {
    validationDateAndSendQuery();
  }
});

// Событие для элемента ввода
$('#input-members').keyup(function () {
  var filter = $(this).val();
  var filterTarget = $('.member-list');
  var hide = $(filterTarget).find('li:not(.hidden:Contains("' + filter + '"))');
  var show = $(filterTarget).find('li:Contains("' + filter + '"):not(.hidden)');
  hide.hide();
  show.show();
});

// выражение для нечувствительной к регистру текста функции Contains()
jQuery.expr[':'].Contains = function (a, i, m) {
  return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
};

$(document).ready(function () {
  // инициализация календаря для инпута с выборо даты
  var blockInputData = $('.input-block__input_data');
  if (blockInputData.length !== 0) {
    blockInputData.addClass('datepicker-here');
    blockInputData.datepicker();

    // предотвращение изменения даты в формате не подходящем нам
    blockInputData.keydown(function (e) {
      e.preventDefault();
    });
    var inputDate = $('#input-date.needModifyData');
    if (inputDate.data('value') != null && inputDate.data('value').length !== 0) {
      var dateInInput = Date.parse(inputDate.data('value'));
      dateInInput = new Date(dateInInput);
      var resultString = dateInInput.getDate() + ' ' + getLetterMonthRu(dateInInput.getMonth()) + ' ' + dateInInput.getFullYear();
      inputDate.val(resultString);
    }
    $('.timepicker').timepicker({
      // настройки календаря
      timeFormat: 'HH:mm',
      interval: 15,
      minTime: '8',
      maxTime: '23',
      defaultTime: '',
      startTime: '',
      dynamic: false,
      dropdown: false,
      scrollbar: false
    });
  }
  if ($('main').hasClass('meeting-ui')) {
    var startEventDate = Date.now();
    startEventDate = new Date(startEventDate);
    var needDate = new Date(startEventDate.getFullYear(), startEventDate.getMonth(), startEventDate.getDate(), 8, 0, 0);

    var needDateTrigerStart = needDate.getTime();
    var needDateTrigerEnd = needDate.getTime() + 3599985;
    var timeIndicatorHandler = $('.time-indicator__position-handler');
    var timeIndicatorHelper = $('.time-indicator__position-handler-helper');
    setTimeout(function () {
      return timeIndicatorHandler.parent().removeClass('hidden');
    }, 1000);
    // обновление состояния каждую сек
    setInterval(function () {
      if (needDateTrigerStart < Date.now() < needDateTrigerEnd) {
        var flexGrow = Math.floor((Date.now() - needDateTrigerStart) / 1000 / 60);
        var helperFlexGrow = 900 - flexGrow;
        timeIndicatorHandler.css('flex-grow', '' + flexGrow);
        timeIndicatorHelper.css('flex-grow', '' + helperFlexGrow);
        var time = new Date(Date.now());
        timeIndicatorHandler.find('.time-indicator__time p').text((time.getHours() < 10 ? '0' : '') + time.getHours() + ':' + ((time.getMinutes() < 10 ? '0' : '') + time.getMinutes()));
      }
    }, 1000);
  }
  var shortDateValue = $('.month-short-need-replace:first').text();
  $('.month-short-need-replace').text(getLetterMonthShortRu(shortDateValue));
  // validation date
  $('#input-stop-time, #input-start-time').keyup(validationDateAndSendQuery);
  $('#datepickers-container .datepicker').on('click', validationDateAndSendQuery);
  $('.offer-meeting-room__element.active .button-delete').on('click', function (event) {
    $(event.target).parents(".offer-meeting-room__element .active").remove();
    validationDateAndSendQuery();
  });
});

function validationDateAndSendQuery() {
  var startTime = $('#input-start-time').val();
  var stopTime = $('#input-stop-time').val();
  var inputDate = $('#input-date');
  // время находится в промежутке от 8 до 23
  var startTimeValid = validationTimeRule(startTime);
  var stopTimeValid = validationTimeRule(stopTime);
  if (startTimeValid && stopTimeValid) {
    // время старта больше времени конца и дата установлена
    startTime = startTime.split(':');
    stopTime = stopTime.split(':');
    var starTimeCount = parseInt(startTime[0], 10) * 60 + parseInt(startTime[1], 10);
    var stopTimeCount = parseInt(stopTime[0], 10) * 60 + parseInt(stopTime[1], 10);
    if (starTimeCount < stopTimeCount && inputDate.val().length > 0) {
      var timeStart = getCorrectTimeFormat(inputDate.val(), startTime).toISOString();
      var timeEnd = getCorrectTimeFormat(inputDate.val(), stopTime).toISOString();
      // находим участников
      var members = [];
      $('.member-list__checkbox').each(function (i, box) {
        if (box.checked) {
          var login = $(box).parents('.add-member-list__element').data('name');
          var memberListElement = $('.member-list__element[data-name=' + login + ']');
          var avatar = memberListElement.find('.avatar-round').attr('src');
          var floor = parseInt(memberListElement.find('.member__floor').text(), 10);
          members.push({
            login: login,
            avatar: avatar,
            floor: floor
          });
        }
      });
      // задем дату
      var date = {
        start: timeStart,
        end: timeEnd
      };
      var _regExp = /edit-event/ig;
      // запрос рекомендаций
      query(members, date).then(function (data) {
        $('#offer-rooms').html('');
        console.log(data);
        //добаление html на основе ответа
        var rooms = data[1].data.rooms;
        data[0].forEach(function (recommend) {
          // для корректной работы замены
          if (_regExp.test(location.href)) {
            recommend.swap = recommend.swap.filter(function (swap) {
              return String(swap.event) !== String($('#offer-rooms').data('eventid'));
            });
          }
          if (recommend.swap.length === 0) {
            recommend.swap.push({ event: null, room: null });
          }
          recommend.date.start = new Date(Date.parse(recommend.date.start));
          recommend.date.end = new Date(Date.parse(recommend.date.end));
          var roomData = rooms.filter(function (room) {
            return String(room.id) === String(recommend.room);
          });
          var blockRecommendation = $('<li class="offer-meeting-room__element"/>').append($('<div class="offer-meeting-room__time">').html((recommend.date.start.getHours() < 10 ? '0' : '') + recommend.date.start.getHours() + ':' + ((recommend.date.start.getMinutes() < 10 ? '0' : '') + recommend.date.start.getMinutes()) + '\u2014' + ((recommend.date.end.getHours() < 10 ? '0' : '') + recommend.date.end.getHours()) + ':' + ((recommend.date.end.getMinutes() < 10 ? '0' : '') + recommend.date.end.getMinutes())), $('<div class="offer-meeting-room__room">').html(roomData[0].title + '\xA0\u2022\xA0' + roomData[0].floor + ' \u044D\u0442\u0430\u0436'), $('<input class="member-list__checkbox" type="checkbox" name="room" value="' + roomData[0].id + '"/>'), $('<input type="hidden" name="swapEvent" value="' + recommend.swap[0].event + '">'), $('<input type="hidden" name="swapRoom" value="' + recommend.swap[0].room + '">'), $('<button class="button-delete" type="button">').append($('<img src="/dist/assets/close-white.svg", alt="close"/>')));
          $('#offer-rooms').append(blockRecommendation);
          $('#offer-rooms').parent().removeClass('hidden');
          $('.offer-meeting-room__label').text("Рекомендованные переговорки");
          // обработчик для выбора переговорки
          blockRecommendation.on('click', selectOffer);
        });
      });
    }
  }
}

// валидация времени
function validationTimeRule(time) {
  if (!Array.isArray(time)) {
    time = time.split(':');
  }
  if (parseInt(time[0], 10) >= 8 && parseInt(time[0], 10) <= 23) {
    if (parseInt(time[0], 10) === 23 && parseInt(time[1], 10) > 0) {
      return false;
    }
    return true;
  }
  return false;
}

// отработвка выбора переговорки
function selectOffer(event) {
  event.stopPropagation();
  var targetElement = $(event.target);
  targetElement.addClass('active');
  targetElement.find('.member-list__checkbox')[0].checked = true;
  $('.offer-meeting-room__label').text("Ваша переговорка");
  targetElement.parent().find('.offer-meeting-room__element:not(.active)').remove();
  $('.offer-meeting-room__element.active .button-delete').on('click', function (event) {
    event.stopPropagation();
    $(event.target).parents(".offer-meeting-room__element.active").remove();
    validationDateAndSendQuery();
  });
}

// запрос рекоменованных переговорок
async function query(members, date) {
  var db = {};
  var queryUsers = '{\n    users{\n      id\n      login\n      homeFloor\n      avatarUrl\n    }\n  }';
  var queryRooms = '{\n' + '  rooms {\n' + '    id\n' + '    title\n' + '    capacity\n' + '    floor\n' + '  }\n' + '}';
  var queryEvents = '{\n' + '  events {\n' + '    id\n' + '    title\n' + '    dateStart\n' + '    dateEnd\n' + '    users {\n' + '      id\n' + '      login\n' + '      homeFloor\n' + '      avatarUrl\n' + '    }\n' + '    room {\n' + '      id\n' + '      title\n' + '      capacity\n' + '      floor\n' + '    }\n' + '  }\n' + '}';
  var users = await request({ query: queryUsers });
  var rooms = await request({ query: queryRooms });
  var events = await request({ query: queryEvents });
  // console.log(users, events, rooms);
  db.persons = [];
  users.data.users.forEach(function (user) {
    db.persons.push({
      login: user.login,
      floor: user.homeFloor,
      avatar: user.avatarUrl
    });
  });
  db.rooms = rooms.data.rooms;
  db.events = [];
  events.data.events.forEach(function (event) {
    event.users.forEach(function (user, i) {
      event.users[i] = user.login;
    });
    event.room = parseInt(event.room.id);
    db.events.push({
      id: event.id,
      title: event.title,
      date: {
        start: event.dateStart,
        end: event.dateEnd
      },
      members: event.users,
      room: event.room
    });
  });
  return [(0, _getRecomendation.getRecommendation)(date, members, db), rooms];
}

// xhr graphql
function request(query) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(xhr.status);
        }
      }
    };
    xhr.ontimeout = function () {
      reject('timeout');
    };
    xhr.open("POST", "/graphql");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(JSON.stringify(query));
  });
}

// получение корректоного формата даты и времени
function getCorrectTimeFormat(date, time) {
  if (!Array.isArray(time)) {
    time = time.split(':');
  }
  var dateParts = date.split(' ');
  var timeParts = time;
  var numberMonth = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'].indexOf(dateParts[1].toLowerCase());
  return new Date(dateParts[2], numberMonth, dateParts[0], timeParts[0], timeParts[1]);
}
//TODO:[A.Ivankov] валидация времени
// TODO:[A.Ivankov] сделать выбор с помощью стрелок и enter

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(3);

__webpack_require__(0);

__webpack_require__(2);

__webpack_require__(1);

/***/ })
/******/ ]);
//# sourceMappingURL=App.bundle.js.map