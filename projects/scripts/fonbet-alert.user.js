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

var container, pre, audio;
var MATCHES = []; // текущие матчи

var MIN_TOTAL = 2; // минимальное отклонение
var MAX_TOTAL = 2; // максимальное отклонение

function getMatches() {
    var elements = document.getElementsByClassName("trEvent");
    for (var i = 0; i < elements.length; i++) {
        if ($(elements[i]).attr('style') != "display: none;"){
			var match = {};
            match.id = $(elements[i]).attr('id').toString().replace(/\D+/, "");
            match.startTotal = document.getElementById('event' + match.id + 'total').innerHTML;
			if(match.startTotal > 100 && match.startTotal < 140) {
				match.MIN_TOTAL = 20;
				match.MAX_TOTAL = 20;
			}
			if(match.startTotal > 140 && match.startTotal < 180) {
				match.MIN_TOTAL = 25;
				match.MAX_TOTAL = 25;
			}
			if(match.startTotal > 180 && match.startTotal < 220) {
				match.MIN_TOTAL = 30;
				match.MAX_TOTAL = 30;
			}
			if(match.startTotal > 220) {
				match.MIN_TOTAL = 35;
				match.MAX_TOTAL = 35;
			}
			match.name = document.getElementById('eventName' + match.id).childNodes[1].nodeValue;
			
			var pushMatch = true;
            MATCHES.forEach(function(aMatch){
				if(aMatch.id == match.id) {
					pushMatch = false;
					aMatch.currentTotal = match.startTotal;
				}
			});
			if(pushMatch)
				MATCHES.push(match);
        }
    }
}

function checkMatches() {
	MATCHES.forEach(function(m){
		if(!m.stop && m.currentTotal > 0){ //Уже была ставка и матч не закончился
			var diff = m.startTotal - m.currentTotal;
			if(diff != 0){ //ничего не изменилось
				if(diff > 0){ // тотал уменшился
					if(diff >= m.MIN_TOTAL) {
						audio.play();
						//alert('Ставь на ПОВЫШЕНИЕ ' + m.name + ' БЫЛО: ' + m.startTotal + ' СТАЛО: ' + m.currentTotal);
						m.stop = true;
                        document.getElementById('event' + m.id + 'over').onmousedown();
                        document.getElementById('event' + m.id + 'over').onmouseup();
					}
				} else { // тотал увеличился
					diff = diff - diff - diff; // -22 - (-22) - (-22) = 22
					if(diff >= m.MAX_TOTAL) {
						audio.play();
						//alert('Ставь на ПОНИЖЕНИЕ ' + m.name + ' БЫЛО: ' + m.startTotal + ' СТАЛО: ' + m.currentTotal);
						m.stop = true;
                        document.getElementById('event' + m.id + 'under').onmousedown();
                        document.getElementById('event' + m.id + 'under').onmouseup();
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

function main() {
    container = document.getElementById("lineContainer");
    pre = document.createElement("pre");
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
    setTimeout(main, 3000);
});