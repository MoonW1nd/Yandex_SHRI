function calendar(id, year, month) {
	var Dlast = new Date(year, month + 1, 0).getDate(),
		D = new Date(year, month, Dlast),
		DNlast = new Date(D.getFullYear(), D.getMonth(), Dlast).getDay(),
		DNfirst = new Date(D.getFullYear(), D.getMonth(), 1).getDay(),
		calendar = '<tr>',
		month = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
	if (DNfirst != 0) {
		for (var i = 1; i < DNfirst; i++) calendar += '<td>';
	} else {
		for (var i = 0; i < 6; i++) calendar += '<td>';
	}
	for (var i = 1; i <= Dlast; i++) {
		if (i == new Date().getDate() && D.getFullYear() == new Date().getFullYear() && D.getMonth() == new Date().getMonth()) {
			calendar += '<td class="today">' + i;
		} else {
			calendar += '<td>' + i;
		}
		if (new Date(D.getFullYear(), D.getMonth(), i).getDay() == 0) {
			calendar += '<tr>';
		}
	}
	for (var i = DNlast; i < 7; i++) calendar += '<td> ';
	document.querySelector('#' + id + ' tbody').innerHTML = calendar;
	document.querySelector('#' + id + ' thead td:nth-child(2)').innerHTML = month[D.getMonth()] + ' ' + D.getFullYear();
	document.querySelector('#' + id + ' thead td:nth-child(2)').dataset.month = D.getMonth();
	document.querySelector('#' + id + ' thead td:nth-child(2)').dataset.year = D.getFullYear();
	if (document.querySelectorAll('#' + id + ' tbody tr').length < 6) {  // чтобы при перелистывании месяцев не "подпрыгивала" вся страница, добавляется ряд пустых клеток. Итог: всегда 6 строк для цифр
		document.querySelector('#' + id + ' tbody').innerHTML += '<tr><td> <td> <td> <td> <td> <td> <td> ';
	}
}

calendar("calendar", new Date().getFullYear(), new Date().getMonth());
// переключатель минус месяц
document.querySelector('#table-arrow-left').onclick = function () {
	calendar("calendar", document.querySelector('#calendar thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar thead td:nth-child(2)').dataset.month) - 1);
};
// переключатель плюс месяц
document.querySelector('#table-arrow-right').onclick = function () {
	calendar("calendar", document.querySelector('#calendar thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar thead td:nth-child(2)').dataset.month) + 1);
};


// index helpers
$('.time-piece.active').on('click', () => $('body').addClass('dimmed'));
var timeLines = $('.meeting-ui__time-line');
var lastScrollLeft = $('.meeting-ui').scrollLeft();
var calendar = $('.calendar');
var meetingInfo = $('.meeting-info');
$(window).scroll(
	() => {
		calendar.addClass('hidden');
		calendar.css('transform', `translate(0, ${$(window).scrollTop()}px)`);
		timeLines.css({
			position: 'fixed',
			transform: `translate(-${lastScrollLeft}px, 0)`
			
		});
	}
);
$('.meeting-ui').scroll(
	() => {
		if (lastScrollLeft !== $('.meeting-ui').scrollLeft()) {
			// if ($('.time-piece.pressed').offset().left < 150) {
			// 	$('.meeting-info').css('left', `${parseInt($('.meeting-info').css('left'), 10) + 1}px`)
			// }
			// console.log($('.time-piece.pressed').offset().left, $('.meeting-ui').scrollLeft());
			calendar.addClass('hidden');
			timeLines.css({
				position: 'absolute',
				transform: `translate(0, ${$(window).scrollTop()}px)`
			});
			lastScrollLeft = $('.meeting-ui').scrollLeft();
		}
	}
);
$('.day-switcher__date').on('click', () => calendar.toggleClass('hidden'));
$('.time-piece.pressed').on('click', () => {
	var width = window.innerWidth;
	var offset = meetingInfo.parent().offset().left;
	var widthElem = parseInt(meetingInfo.parent().css('width'), 10);
	var meetingInfoWidth = parseInt(meetingInfo.css('width'), 10);;
	var needOffset;
	var rightTrigger = ((offset + widthElem / 2) + meetingInfoWidth / 2);
	var leftTrigger = ((offset - widthElem / 2) - meetingInfoWidth / 2);
	var cornerOffset;
	
	meetingInfo.toggleClass('hidden');
	if (!((rightTrigger < width) && (leftTrigger > 0))) {
		if (rightTrigger < width) {
			needOffset = leftTrigger + 50;
			cornerOffset = offset + 50;
		}
		if (leftTrigger > 0) {
			needOffset = rightTrigger - width - 50;
			cornerOffset = meetingInfoWidth + ( - width + offset)/2;
		}
		
		$('.meeting-info').css('left', `${-needOffset}px`);
		$('.meeting-info__corner').css('left', `${cornerOffset}px`);
		
		if ((rightTrigger < width) && (leftTrigger > 0)) {
			$('.meeting-info').css('left', `${widthElem/2}px`);
			$('.meeting-info__corner').css('left', `${meetingInfoWidth/2}px`);
		}
	} else {
		$('.meeting-info').css('left', `${widthElem/2}px`);
		$('.meeting-info__corner').css('left', `${meetingInfoWidth/2}px`);
	}
});

var reg = /Firefox/ig;
if (reg.test(window.navigator.userAgent)) {
	$('.input-block__input_time').css('padding', '0')
}
