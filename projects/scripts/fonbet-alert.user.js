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
		if(!m.stop){ //Уже была ставка
			var diff = m.startTotal - m.currentTotal;
			if(diff != 0){ //ничего не изменилось
				if(diff > 0){ // тотал уменшился
					if(diff >= MIN_TOTAL) {
						playSound();
						alert('Ставь на ПОВЫШЕНИЕ ' + m.name + ' БЫЛО: ' + m.startTotal + ' СТАЛО: ' + m.currentTotal);
						m.stop = true;
					}
				} else { // тотал увеличился
					diff = diff - diff - diff; // -22 - (-22) - (-22) = 22
					if(diff >= MAX_TOTAL) {
						playSound();
						alert('Ставь на ПОНИЖЕНИЕ ' + m.name + ' БЫЛО: ' + m.startTotal + ' СТАЛО: ' + m.currentTotal);
						m.stop = true;
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

function playSound (){
	var audio = document.createElement('audio');
	audio.src = 'http://wav-library.net/sfx/ReturnTone/WavLibraryNet_ReturnTone33.wav';
	audio.autoplay = true;
}

function main() {
    container = document.getElementById("lineContainer");
    pre = document.createElement("pre");
	container.appendChild(pre);
	
    setInterval(function () {
		getMatches();
		checkMatches()
        debug(MATCHES, true);
    }, 2000);


}

$(window).load(function () {
    setTimeout(main, 3000);
});