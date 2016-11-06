// ==UserScript==
// @name        fonbet-alert
// @namespace   lapshina.net
// @description FonbetAlert Script
// @include     http://www.fonbet.com/live/*
// @include     https://www.fonbet.com/live/*
// @version     1
// @grant       none
// @require     http://www.flotcharts.org/flot/jquery.js
// ==/UserScript==

var container, pre, audio, w, body, table;
var MATCHES = []; // текущие матчи
/*
 * 20 - больше ста менньше 
 * 25 - больше 140 меньше 180 и т.д.
 */
//var TOTALS = [25, 25, 30, 35]; 

//для отладки
var TOTALS = [2, 3, 4, 5]; 

//Страховочная ставка (пока одна)
var STRAH = 5; 

function getMatches() {
    var elements = document.getElementsByClassName("trEvent");
    for (var i = 0; i < elements.length; i++) {
        if ($(elements[i]).attr('style') != "display: none;"){
					var match = {};
					match.id = $(elements[i]).attr('id').toString().replace(/\D+/, "");
					match.startTotal = document.getElementById('event' + match.id + 'total').innerHTML;
					match.name = document.getElementById('eventName' + match.id).childNodes[1].nodeValue; 
					if(match.startTotal > 100 && match.startTotal < 140) {
						match.MIN_TOTAL = TOTALS[0]+ 5;
						match.MAX_TOTAL = TOTALS[0];
					}
					if(match.startTotal > 140 && match.startTotal < 180) {
						match.MIN_TOTAL = TOTALS[1] + 5;
						match.MAX_TOTAL = TOTALS[1];
					}
					if(match.startTotal > 180 && match.startTotal < 220) {
						match.MIN_TOTAL = TOTALS[2] + 5;
						match.MAX_TOTAL = TOTALS[2];
					}
					if(match.startTotal > 220) {
						match.MIN_TOTAL = TOTALS[3] + 5;
						match.MAX_TOTAL = TOTALS[3];
					}
					if(match.startTotal > 80)
					{	
						var pushMatch = true;
						MATCHES.forEach(function(aMatch){
							if(aMatch.id == match.id) {
								pushMatch = false;
								aMatch.currentTotal = match.startTotal;
							}
						});
						if(pushMatch){
							MATCHES.push(match);
						}
					}
				}
    }
}


//повышение >
function UP (m, diff){
	audio.play();
	ALERT('Ставь на ПОВЫШЕНИЕ ' + m.name + ' БЫЛО: ' + m.startTotal + ' СТАЛО: ' + m.currentTotal);
	TABLE(m.name, m.startTotal, m.currentTotal, 'ПОВЫШЕНИЕ', diff);
	document.getElementById('event' + m.id + 'over').onmousedown();
	document.getElementById('event' + m.id + 'over').onmouseup();
}

//понижение <
function DOWN (m, diff){
	audio.play();
	ALERT('Ставь на ПОНИЖЕНИЕ ' + m.name + ' БЫЛО: ' + m.startTotal + ' СТАЛО: ' + m.currentTotal);
	TABLE(m.name, m.startTotal, m.currentTotal, 'ПОНИЖЕНИЕ', diff);
	document.getElementById('event' + m.id + 'under').onmousedown();
	document.getElementById('event' + m.id + 'under').onmouseup();
}

function checkMatches() {
	MATCHES.forEach(function(m, i){
		if(!m.stop && m.currentTotal > 0){ //Уже была ставка и матч не закончился
			var diff = m.startTotal - m.currentTotal;
			if(diff != 0){ //ничего не изменилось
				if(diff > 0){ // тотал уменшился
					if(diff >= m.MIN_TOTAL) {
						UP(m, diff);
						m.stop = '>';
					}
				} else { // тотал увеличился
					diff = diff - diff - diff; // -22 - (-22) - (-22) = 22
					if(diff >= m.MAX_TOTAL) {
						DOWN(m, diff);
						m.stop = '<';
					}
				}
			}
		}
		if(!m.vilka && m.stop == '<' && m.currentTotal > 0){ //Вилка на понижение
			if(m.currentTotal <= m.startTotal){
				UP(m, 'ВИЛКА');
				m.vilka = true;
			}
		}
		if(!m.vilka && m.stop == '>' && m.currentTotal > 0){ //Вилка на повышение
			if(m.currentTotal >= m.startTotal){
				DOWN(m, 'ВИЛКА');
				m.vilka = true;
			}
		}
		if(!m.strah && m.stop && m.currentTotal > 0){ //Страховка
			var diff = m.startTotal - m.currentTotal;
			if(diff != 0){ //ничего не изменилось
				if(diff > 0){ // тотал уменшился
					if(diff >= m.MIN_TOTAL + STRAH && m.stop == '>') {
						UP(m, 'СТРАХОВКА');
						m.strah = true;
					}
				} else { // тотал увеличился
					diff = diff - diff - diff; // -22 - (-22) - (-22) = 22
					if(diff >= m.MAX_TOTAL + STRAH && m.stop == '<') {
						DOWN(m, 'СТРАХОВКА');
						m.strah = true;
					}
				}
			}
		}
	});
}

function debug(data, clear) {
  if(clear)
    pre.innerHTML = JSON.stringify(data);
  else
    pre.innerHTML += JSON.stringify(data);
}

function ALERT(msg){
	var container = document.getElementById("lineContainer");
	var div = document.createElement("div");
	div.innerHTML = msg;
	container.appendChild(div);
}

function TABLE(name, startTotal, currTotal, type, diff){
	var date = new Date();
	var tr = document.createElement("tr");
	tr.innerHTML = '<td>'+ date.toDateString() + '</td><td>' + date.toTimeString() + '</td><td>' + name + '</td><td>' + startTotal + '</td><td>' + currTotal + '</td><td>' + type + '</td><td>' + diff+ '</td>';
	table.appendChild(tr);
}

function main() {
	container = document.getElementById("lineContainer");
	pre = document.createElement("div");
	container.appendChild(pre);
	audio = document.createElement('audio');
	audio.src = 'http://wav-library.net/sfx/ReturnTone/WavLibraryNet_ReturnTone33.wav';
	setInterval(function () {
		getMatches();
		checkMatches()
		debug(MATCHES, true);
	}, 2000);


}

$(window).load(function () {
	  w = window.open('/');
	  setTimeout(function(){
			body = w.window.document.getElementsByTagName('html');
			body[0].innerHTML = '';
			body = body[0];
			setTimeout(function(){
				table = document.createElement('table');
				table.border = 1;
				table.innerHTML = "<tr><td>Дата</td> <td>Время</td> <td>Название матча</td> <td>Начальный тотал</td> <td>Текущий тотал</td> <td>Ставка</td> <td>Разница</td> </tr>";
				body.appendChild(table);
			}, 2000)
		}, 5000);
    setTimeout(main, 3000);
});