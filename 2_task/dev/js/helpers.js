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
$(window).scroll(
	() => {
		timeLines.css({
			position: 'fixed',
			transform: `translate(-${lastScrollLeft}px, 0)`
			
		});
		console.log(lastScrollLeft, $('.meeting-ui').scrollLeft());
		
	}
);
$('.meeting-ui').scroll(
	() => {
		if (lastScrollLeft !== $('.meeting-ui').scrollLeft()) {
			timeLines.css({
				position: 'absolute',
				transform: `translate(0, ${$(window).scrollTop()}px)`
			})
			lastScrollLeft = $('.meeting-ui').scrollLeft();
		}
	}
);
$('.day-switcher__date').on('click', () => $('.calendar').toggleClass('hidden'));

var reg = /Firefox/ig;
if (reg.test(window.navigator.userAgent)) {
	$('.input-block__input_time').css('padding', '0')
}
