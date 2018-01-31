import { getRecommendation } from './getRecomendation';

// index helpers scroll behavior
// $('.time-piece.active').on('click', () => $('body').addClass('dimmed'));
let timeLines = $('.meeting-ui__time-line');
let lastScrollLeft = $('.meeting-ui').scrollLeft();
let calendarElem = $('.calendar');

$('.month-UTC').each((i, elem) => $(elem).text(getLetterMonthRu($(elem).text())));
$(window).scroll(
  () => {
    $('.time-piece.placed .meeting-info').addClass('hidden');
    calendarElem.addClass('hidden');
    calendarElem.css('transform', `translate(0, ${$(window).scrollTop()}px)`);
    timeLines.css({
      position: 'fixed',
      transform: `translate(-${lastScrollLeft}px, 0)`
      
    });
  }
);

$('.meeting-ui').scroll(
  () => {
    if (lastScrollLeft !== $('.meeting-ui').scrollLeft()) {
      $('.time-piece.placed .meeting-info').addClass('hidden');
      calendarElem.addClass('hidden');
      timeLines.css({
        position: 'absolute',
        transform: `translate(0, ${$(window).scrollTop()}px)`
      });
      lastScrollLeft = $('.meeting-ui').scrollLeft();
    }
  }
);

// helpers for position information about Event
$('.day-switcher__date').on('click', () => calendarElem.toggleClass('hidden'));
$('.time-piece.placed').on('click', (event) => {
  let target = $(event.target);
  let width = window.innerWidth;
  let offset = target.offset().left;
  let widthElem = parseInt(target.css('width'), 10);
  let meetingInfoWidth = parseInt(target.find('.meeting-info').css('width'), 10);
  let needOffset;
  let rightTrigger = ((offset + widthElem / 2) + meetingInfoWidth / 2);
  let leftTrigger = ((offset + widthElem / 2) - meetingInfoWidth / 2);
  let cornerOffset;
  
  target.find('.meeting-info').toggleClass('hidden');
  if (!((rightTrigger < width) && (leftTrigger > 0))) {
    if (rightTrigger < width) {
      needOffset = leftTrigger - widthElem/2;
      cornerOffset = offset + widthElem/2;
      console.log('r<w', leftTrigger, offset)
    }
    if (leftTrigger > 0) {
      needOffset = rightTrigger - width - widthElem/2;
      cornerOffset = meetingInfoWidth - (width - offset) + widthElem/2;
    }
    
    target.find('.meeting-info').css('left', `${-needOffset}px`);
    target.find('.meeting-info__corner').css('left', `${cornerOffset}px`);
    
    if ((rightTrigger < width) && (leftTrigger > 0)) {
      console.log('both')
      $('.meeting-info').css('left', `${widthElem/2}px`);
      $('.meeting-info__corner').css('left', `${meetingInfoWidth/2}px`);
    }
  } else {
    console.log("true")
    $('.meeting-info').css('left', `${widthElem/2}px`);
    $('.meeting-info__corner').css('left', `${meetingInfoWidth/2}px`);
  }
});

// fix styles TODO:[A.Ivankov] вынести в стили
// let reg = /Firefox/ig;
// if (reg.test(window.navigator.userAgent)) {
// 	$('.input-block__input_time').css('padding', '0')
// }

// fix for pages edit and add
$('.input-block__input_members').focus(() => {
  $('.member-list').fadeIn(500);
});

$('.input-block__input_members').focusout(() => {
  $('.member-list').fadeOut(500);
});

// stiles for firefox browser
let regExp = /Firefox/ig;
if (regExp.test(window.navigator.userAgent)) {
  $('.input-block__input_time').css('padding', '0');
  $('.input-block__icon_calendar').css('right', '40px');
};

// функция замены числового месяца на слово
function getLetterMonthRu(month) {
  return [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря'
  ][month]
}
// функция замены числового месяца на слово
function getLetterMonthShortRu(month) {
  return [
    'янв',
    'фев',
    'мaр',
    'апр',
    'мая',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек'
  ][month]
}

// обработчики клика для добавления людей
$('.member-list__element').on('click', (event) => {
  let target = $(event.target);
  // сврываем из списка эдемнтов
  target.addClass('hidden');
  let login = target.data('name');
  $(`.add-member-list__element[data-name=${login}]`).removeClass('hidden')
    .find('.member-list__checkbox')[0].checked = true;
  // для того чтобы не сбрасывала выбранную комнату
  if($('.offer-meeting-room__element.active').length === 0) {
    validationDateAndSendQuery()
  }
});

// обработчик удаления людей из списка
$('.button-delete_add-member').on('click', (event) => {
  let target = $(event.target);
  let login = target.parents('.add-member-list__element').data('name');
  $(`.member-list__element[data-name=${login}]`).removeClass('hidden');
  target.parents('.add-member-list__element').addClass('hidden')
    .find('.member-list__checkbox')[0].checked = false;
  // для того чтобы не сбрасывала выбранную комнату
  console.log($('.offer-meeting-room__element.active').length === 0);
  if($('.offer-meeting-room__element.active').length === 0) {
    validationDateAndSendQuery()
  }
});



// Событие для элемента ввода
$('#input-members').keyup(function() {
  let filter = $(this).val();
  let filterTarget = $('.member-list');
  let hide = $(filterTarget).find('li:not(.hidden:Contains("' + filter + '"))');
  let show = $(filterTarget).find('li:Contains("' + filter + '"):not(.hidden)')
  hide.hide();
  show.show();
});

// выражение для нечувствительной к регистру текста функции Contains()
jQuery.expr[':'].Contains = function(a,i,m) {
  return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase())>=0;
};

$(document).ready(() => {
  // инициализация календаря для инпута с выборо даты
  let blockInputData = $('.input-block__input_data');
  if (blockInputData.length !== 0 ) {
    blockInputData.addClass('datepicker-here');
    blockInputData.datepicker();
  
    // предотвращение изменения даты в формате не подходящем нам
    blockInputData.keydown(function(e){
      e.preventDefault();
    });
    let inputDate = $('#input-date.needModifyData');
    let dateInInput = Date.parse(inputDate.data('value'));
    dateInInput = new Date(dateInInput);
    let resultString = `${dateInInput.getUTCDate()} ${getLetterMonthRu(dateInInput.getUTCMonth())} ${dateInInput.getUTCFullYear()}`;
    // настройки календаря
    inputDate.val(resultString);
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
  }
  let shortDateValue = $('.month-short-need-replace:first').text();
  $('.month-short-need-replace').text(getLetterMonthShortRu(shortDateValue));
  // validation date
  $('#input-stop-time, #input-start-time').keyup(validationDateAndSendQuery);
  $('#datepickers-container .datepicker').on('click', validationDateAndSendQuery);
  $('.offer-meeting-room__element.active .button-delete').on('click', function (event) {
    $(event.target).parents(".offer-meeting-room__element .active").remove();
    validationDateAndSendQuery()
  });
});

function validationDateAndSendQuery() {
  let startTime = $('#input-start-time').val();
  let stopTime = $('#input-stop-time').val();
  let inputDate = $('#input-date');
  // время находится в промежутке от 8 до 23
  let startTimeValid = validationTimeRule(startTime);
  let stopTimeValid = validationTimeRule(stopTime);
  if (startTimeValid && stopTimeValid) {
    // время старта больше времени конца и дата установлена
    startTime = startTime.split(':');
    stopTime = stopTime.split(':');
    let starTimeCount = parseInt(startTime[0], 10)*60 + parseInt(startTime[1], 10);
    let stopTimeCount = parseInt(stopTime[0], 10)*60 + parseInt(stopTime[1], 10);
    if (starTimeCount < stopTimeCount && inputDate.val().length > 0) {
      let timeStart = getCorrectTimeFormat(inputDate.val(), startTime).toISOString();
      let timeEnd = getCorrectTimeFormat(inputDate.val(), stopTime).toISOString()
      // находим участников
      let members = [];
      $('.member-list__checkbox').each((i, box) => {
        if(box.checked) {
          let login = $(box).parents('.add-member-list__element').data('name');
          let memberListElement = $(`.member-list__element[data-name=${login}]`);
          let avatar = memberListElement.find('.avatar-round').attr('src');
          let floor = parseInt(memberListElement.find('.member__floor').text(), 10);
          members.push({
            login,
            avatar,
            floor
          })
        }
      });
      // задем дату
      let date = {
        start: timeStart,
        end: timeEnd
      };
      let regExp = /edit-event/ig;
      // запрос рекомендаций
      query(members, date).then( data => {
        $('#offer-rooms').html('');
        console.log(data);
        //добаление html на основе ответа
        let rooms = data[1].data.rooms;
        data[0].forEach(recommend => {
          // для корректной работы замены
          if (regExp.test(location.href)) {
            recommend.swap = recommend.swap.filter(swap => String(swap.event) !== String($('#offer-rooms').data('eventid')));
          }
          if(recommend.swap.length === 0) {
            recommend.swap.push({event: null, room: null});
          }
          recommend.date.start = new Date(Date.parse(recommend.date.start));
          recommend.date.end = new Date(Date.parse(recommend.date.end));
          let roomData = rooms.filter( room => String(room.id) === String(recommend.room));
          let blockRecommendation = $('<li class="offer-meeting-room__element"/>').append(
            $('<div class="offer-meeting-room__time">').html(`${(recommend.date.start.getUTCHours()<10?'0':'') + recommend.date.start.getUTCHours()}:${(recommend.date.start.getUTCMinutes()<10?'0':'') + recommend.date.start.getUTCMinutes()}—${(recommend.date.end.getUTCHours()<10?'0':'') + recommend.date.end.getUTCHours()}:${(recommend.date.end.getUTCMinutes()<10?'0':'') + recommend.date.end.getUTCMinutes()}`),
            $('<div class="offer-meeting-room__room">').html(`${roomData[0].title} • ${roomData[0].floor} этаж`),
            $(`<input class="member-list__checkbox" type="checkbox" name="room" value="${roomData[0].id}"/>`),
            $(`<input type="hidden" name="swapEvent" value="${recommend.swap[0].event}">`),
            $(`<input type="hidden" name="swapRoom" value="${recommend.swap[0].room}">`),
            $('<button class="button-delete" type="button">').append(
                $('<img src="/dist/assets/close-white.svg", alt="close"/>')
              )
          );
          $('#offer-rooms').append(blockRecommendation);
          // обработчик для выбора переговорки
          blockRecommendation.on('click', selectOffer)
        })
      });
    }
  }
}

// валидация времени
function validationTimeRule(time) {
  if (!Array.isArray(time)){
    time = time.split(':');
  }
  if (parseInt(time[0], 10) >= 8 && parseInt(time[0], 10) <= 23) {
    if (parseInt(time[0], 10) === 23 && parseInt(time[1], 10) > 0) {
      return false;
    }
    return true
  }
  return false
}

// отработвка выбора переговорки
function selectOffer(event) {
  event.stopPropagation();
  let targetElement = $(event.target);
  targetElement.addClass('active');
  targetElement.find('.member-list__checkbox')[0].checked = true;
  targetElement.parent().find('.offer-meeting-room__element:not(.active)').remove();
  $('.offer-meeting-room__element.active .button-delete').on('click', function (event) {
    event.stopPropagation();
    $(event.target).parents(".offer-meeting-room__element.active").remove();
    validationDateAndSendQuery()
  });
}

// запрос рекоменованных переговорок
async function query(members, date) {
  let db = {};
  const queryUsers = `{
    users{
      id
      login
      homeFloor
      avatarUrl
    }
  }`;
  const queryRooms = '{\n' +
    '  rooms {\n' +
    '    id\n' +
    '    title\n' +
    '    capacity\n' +
    '    floor\n' +
    '  }\n' +
    '}';
  const queryEvents = '{\n' +
    '  events {\n' +
    '    id\n' +
    '    title\n' +
    '    dateStart\n' +
    '    dateEnd\n' +
    '    users {\n' +
    '      id\n' +
    '      login\n' +
    '      homeFloor\n' +
    '      avatarUrl\n' +
    '    }\n' +
    '    room {\n' +
    '      id\n' +
    '      title\n' +
    '      capacity\n' +
    '      floor\n' +
    '    }\n' +
    '  }\n' +
    '}';
  let users = await request({query: queryUsers });
  let rooms = await request({query: queryRooms });
  let events = await request({query: queryEvents });
  // console.log(users, events, rooms);
  db.persons = [];
  users.data.users.forEach(user => {
    db.persons.push({
      login: user.login,
      floor: user.homeFloor,
      avatar: user.avatarUrl
    });
  });
  db.rooms = rooms.data.rooms;
  db.events = [];
  events.data.events.forEach((event) => {
    event.users.forEach( (user, i) => {
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
  return [getRecommendation(date, members, db), rooms]
}


// xhr graphql
function request(query) {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response)
        } else {
          reject(xhr.status)
        }
      }
    };
    xhr.ontimeout = function () {
      reject('timeout')
    };
    xhr.open("POST", "/graphql");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(JSON.stringify(query));
  })
}

// получение корректоного формата даты и времени
function getCorrectTimeFormat(date, time) {
  if (!Array.isArray(time)){
    time = time.split(':');
  }
  let dateParts = date.split(' ');
  let timeParts = time;
  let numberMonth = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря'
  ].indexOf(dateParts[1].toLowerCase());
  return new Date(Date.UTC(
    dateParts[2],
    numberMonth,
    dateParts[0],
    timeParts[0],
    timeParts[1]
  ));
}
//TODO:[A.Ivankov] валидация времени
// TODO:[A.Ivankov] сделать выбор с помощью стрелок и enter