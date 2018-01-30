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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _getRecomendation = __webpack_require__(10);

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
// $(".input-block__input_data").on("change", function() {
//   this.setAttribute(
//     "data-date",
//     moment(this.value, "YYYY-MM-DD")
//       .format( this.getAttribute("data-date-format") )
//   )
// }).trigger("change");
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
  // сврываем из списка эдемнтов
  target.addClass('hidden');
  var login = target.data('name');
  $('.add-member-list__element[data-name=' + login + ']').removeClass('hidden').find('.member-list__checkbox')[0].checked = true;
});

// обработчик удаления людей из списка
$('.button-delete_add-member').on('click', function (event) {
  var target = $(event.target);
  var login = target.parents('.add-member-list__element').data('name');
  $('.member-list__element[data-name=' + login + ']').removeClass('hidden');
  target.parents('.add-member-list__element').addClass('hidden').find('.member-list__checkbox')[0].checked = false;
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
  // инициализация календаря
  $('.input-block__input_data').addClass('datepicker-here');
  $('.input-block__input_data').datepicker();

  // предотвращение изменения даты в формате не подходящем нам
  $('.input-block__input_data').keydown(function (e) {
    e.preventDefault();
  });
  var dateInInput = Date.parse($('#input-date.needModifyData').data('value'));
  dateInInput = new Date(dateInInput);
  var resultString = dateInInput.getUTCDate() + ' ' + getLetterMonthRu(dateInInput.getUTCMonth()) + ' ' + dateInInput.getUTCFullYear();
  $('#input-date.needModifyData').val(resultString);
  $('.timepicker').timepicker({
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

  // validation date
  $('#input-stop-time, #input-start-time').keyup(validationDateAndSendQuery);
  $('#datepickers-container .datepicker').on('click', validationDateAndSendQuery);
  console.log($('#datepickers-container .datepicker'));
});

function validationDateAndSendQuery() {
  var startTime = $('#input-start-time').val();
  var stopTime = $('#input-stop-time').val();
  var startTimeValid = validationTimeRule(startTime);
  var stopTimeValid = validationTimeRule(stopTime);
  console.log(startTimeValid, stopTimeValid);
  if (startTimeValid && stopTimeValid) {
    startTime = startTime.split(':');
    stopTime = stopTime.split(':');
    var starTimeCount = parseInt(startTime[0], 10) * 60 + parseInt(startTime[1], 10);
    var stopTimeCount = parseInt(stopTime[0], 10) * 60 + parseInt(stopTime[1], 10);
    if (starTimeCount < stopTimeCount && $('#input-date').val().length > 0) {
      var timeStart = getCorrectTimeFormat($('#input-date').val(), $('#input-start-time').val()).toISOString();
      var timeEnd = getCorrectTimeFormat($('#input-date').val(), $('#input-stop-time').val()).toISOString();
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
      var date = {
        start: timeStart,
        end: timeEnd
      };
      query(members, date).then(function (data) {
        $('#offer-rooms').html('');
        var rooms = data[1].data.rooms;
        data[0].forEach(function (recommend) {
          recommend.date.start = new Date(Date.parse(recommend.date.start));
          recommend.date.end = new Date(Date.parse(recommend.date.end));
          var roomData = rooms.filter(function (room) {
            return room.id === recommend.room;
          });
          console.log(roomData);
          var blockRecommendation = $('<li class="offer-meeting-room__element"/>').append($('<div class="offer-meeting-room__time">').html((recommend.date.start.getUTCHours() < 10 ? '0' : '') + recommend.date.start.getUTCHours() + ':' + ((recommend.date.start.getUTCMinutes() < 10 ? '0' : '') + recommend.date.start.getUTCMinutes()) + '\u2014' + ((recommend.date.end.getUTCHours() < 10 ? '0' : '') + recommend.date.end.getUTCHours()) + ':' + ((recommend.date.end.getUTCMinutes() < 10 ? '0' : '') + recommend.date.end.getUTCMinutes())), $('<div class="offer-meeting-room__room">').html(roomData[0].title + '\xA0\u2022\xA0' + roomData[0].floor + ' \u044D\u0442\u0430\u0436'), $('<button class="button-delete" type="button">').append($('<img src="/dist/assets/close.svg", alt="close"/>')));
          $('#offer-rooms').append(blockRecommendation);
        });
      });
    }
  }
}

function validationTimeRule(time) {
  time = time.split(':');
  if (parseInt(time[0], 10) >= 8 && parseInt(time[0], 10) <= 23) {
    if (parseInt(time[0], 10) === 23 && parseInt(time[1], 10) > 0) {
      return false;
    }
    return true;
  }
  return false;
}

async function query(members, date) {
  var db = {};
  // let members;
  // members = [
  //   {
  //     login: 'alt-j',
  //     avatar: 'https://avatars1.githubusercontent.com/u/3763844?s=400&v=4',
  //     floor: 3
  //   },
  //   {
  //     login: 'yeti-or',
  //     avatar: 'https://avatars0.githubusercontent.com/u/1813468?s=460&v=4',
  //     floor: 2
  //   }
  // ];
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

function getCorrectTimeFormat(date, time) {
  var dateParts = date.split(' ');
  var timeParts = time.split(':');
  var numberMonth = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'].indexOf(dateParts[1].toLowerCase());
  return new Date(Date.UTC(dateParts[2], numberMonth, dateParts[0], timeParts[0], timeParts[1]));
}
//TODO:[A.Ivankov] валидация времени
// TODO:[A.Ivankov] сделать выбор с помощью стрелок и enter

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(2);

__webpack_require__(10);

__webpack_require__(1);

__webpack_require__(0);

/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
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
    var copyEvents = db.events.slice(); //TODO:[A.Ivankov] !wtf?
    recommendedRooms.forEach(function (room) {
      var eventsInRoom = copyEvents.filter(function (event) {
        return event.room === parseInt(room.id, 10);
      });
      room.dateValid = false;
      room.events = eventsInRoom;

      // validation date
      eventsInRoom.forEach(function (eventInRoom) {
        var dateStartValid = Date.parse(date.start) >= Date.parse(eventInRoom.date.end);
        var dateEndValid = Date.parse(date.end) <= Date.parse(eventInRoom.date.start);
        if (dateEndValid || dateStartValid) {
          room.dateValid = true;
        }
      });
    });
    allRecommendation = allRecommendation.concat(recommendedRooms);
  });
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
      console.log(room);
      if (room[0] != null) {
        swap.floorEvent = room[0].floor;
      }
    });

    var sortSwapsByFloor = [];
    // сортировка комнат по наименьшему количеству пройденных этажей
    floors.forEach(function (floor) {
      var swaps = allSwaps.filter(function (swap) {
        return floor.floorNumber === swap.floorEvent;
      });
      sortSwapsByFloor = sortSwapsByFloor.concat(swaps);
    });
    // соединяем возможные переносы по комнатам которые освободятся
    var a = null;
    var resultMassive = [];
    sortSwapsByFloor.forEach(function (swap) {
      if (swap.event !== a) {
        a = swap.event;
        resultMassive.push([swap]);
      } else {
        resultMassive[resultMassive.length - 1].push(swap);
      }
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
      endTime.setUTCHours(23);
      endTime.setUTCMinutes(0);
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
      // eventsWithNewTime.filter(event => event.validEvent === true);
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

/***/ })
/******/ ]);
//# sourceMappingURL=App.bundle.js.map