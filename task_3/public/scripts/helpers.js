// index helpers
$('.time-piece.active').on('click', () => $('body').addClass('dimmed'));
let timeLines = $('.meeting-ui__time-line');
let lastScrollLeft = $('.meeting-ui').scrollLeft();
let calendarElem = $('.calendar');
let meetingInfo = $('.meeting-info');
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
$('.day-switcher__date').on('click', () => calendarElem.toggleClass('hidden'));
$('.time-piece.placed').on('click', (event) => {
  let target = $(event.target);
  let width = window.innerWidth;
  let offset = target.offset().left;
  let widthElem = parseInt(target.css('width'), 10);
  console.log(widthElem);
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
// $(".input-block__input_data").on("change", function() {
//   this.setAttribute(
//     "data-date",
//     moment(this.value, "YYYY-MM-DD")
//       .format( this.getAttribute("data-date-format") )
//   )
// }).trigger("change");
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

// обработчики клика для добавления людей
$('.member-list__element').on('click', (event) => {
  let target = $(event.target);
  // сврываем из списка эдемнтов
  target.addClass('hidden');
  let login = target.data('name');
  $(`.add-member-list__element[data-name=${login}]`).removeClass('hidden')
    .find('.member-list__checkbox')[0].checked = true;
});

// обработчик удаления людей из списка
$('.button-delete_add-member').on('click', (event) => {
  let target = $(event.target);
  let login = target.parents('.add-member-list__element').data('name');
  $(`.member-list__element[data-name=${login}]`).removeClass('hidden');
  target.parents('.add-member-list__element').addClass('hidden')
    .find('.member-list__checkbox')[0].checked = false;
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
  // инициализация календаря
  $('.input-block__input_data').addClass('datepicker-here');
  $('.input-block__input_data').datepicker();
  
  // предотвращение изменения даты в формате не подходящем нам
  $('.input-block__input_data').keydown(function(e){
    e.preventDefault();
  });
  let dateInInput = Date.parse($('#input-date.needModifyData').data('value'));
  dateInInput = new Date(dateInInput);
  let resultString = `${dateInInput.getUTCDate()} ${getLetterMonthRu(dateInInput.getUTCMonth())} ${dateInInput.getUTCFullYear()}`;
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
});

//TODO:[A.Ivankov] валидация времени
// TODO:[A.Ivankov] сделать выбор с помощью стрелок и enter