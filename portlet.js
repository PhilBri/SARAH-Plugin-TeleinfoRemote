$(document).ready(function() {
var tmr = '';
// Socket
var socket = io.connect('http://localhost:12345');
socket.on('send_Data', function(data) {
	maj_Data(data);
	// Timer
	if (data.timer.set == 'Désactivé') {
		if(tmr) clearInterval(tmr); // alert('tmr');}
		$('#timer_on').html(' Timer :');
		$('#next_maj').html('OFF')
	} else {
		$('#timer_on').html(' prochaine dans :');
		timer = data.timer.time;
		my_timer = timer*60;
		str = my_timer;
		//if (tmr != '') clearInterval(tmr);
		if(tmr) clearInterval(tmr);
		tmr = setInterval(actualiser, 1000);
	}	
});
// Init
$( window ).load(function() {
	socket.emit('status', 'ready');
});
// Timer refresh
function actualiser() {
	my_timer > 60 ? str= Math.floor(my_timer/60) + 'm '+ my_timer % 60 + 's' : str = (my_timer<10?'0':'') + my_timer +'s';
	$('#next_maj').html(str); 
	if (my_timer === 0) {my_timer = timer*60; str = my_timer; $('#img_logo').trigger('click');};
	my_timer -= 1;
}
// House logo click
document.getElementById("img_logo").onclick = function() {
	socket.emit('status', 'ready');
};
// Detachments
var p = $('.remove').detach();
var s = $('.info_abo2').detach();
// HTML refresh
function maj_Data (msg) {
	// Vérif. validité des compteurs
	if (msg.tab.OPTARIF) {
		p.appendTo('.static');
		s.appendTo('.info_abo');
		$('#isousc').html(msg.tab.ISOUSC);
	} else {
		$('.remove').detach();
		$('.info_abo2').detach();
		$('#isousc').html('INDISPONIBLE');
		//$('.info_abo a').css({'background-color': '#FF69B4'});
	}
	// N° compteur
	$('#compteur').html(msg.numCpt);
	// Tarif
	$('#optarif').html(msg.tab.OPTARIF);
	// Timer maj
	var y = new Date(msg.maj);
	$('#maj').html(y.getHours() + 'h' + (y.getMinutes() < 10 ? '0':'') + y.getMinutes());
	
	// Tarif en cours
	$("#hchp").html(msg.tab.PTEC.split(':').shift());

	// Couleur tarif (tempo) &  (HP - PM en rouge)
	y = msg.tab.PTEC.split(':').pop(); // y=coul_tempo
	y != '#FFFFFF' ? $('.hchp_coul a').css({"background-color":y,'color':'#FFF'}):
		$('.hchp_coul a').css({"background-color":y, 'color':$('#maj').css('color')});
	// Couleur tarif (autres)
	if (y == '#') $('.hchp_coul a').css({"background-color":'transparent', 'color':$('#maj').css('color')});

	// Consommation
	$("#conso").html(msg.tab.PAPP);

	// Mono/Tri
	msg.tab.IINST1[0] == msg.tab.IINST[0] ? $('#mono_tri').html('Triphasé') : $('#mono_tri').html('Monophasé');

	// Intensité actuelle
	$('#mono_tri').text() == 'Triphasé' ? y = msg.tab.IINST1 + msg.tab.IINST2 + msg.tab.IINST3 : y = msg.tab.IINST;
	$("#iinst").html(y);

	// Intensité maxi atteinte
	$('#mono_tri').text() == 'Triphasé' ? y = msg.tab.IMAX1 + msg.tab.IMAX2 + msg.tab.IMAX3 : y = msg.tab.IMAX;
	$("#imax").html(y);

	// Alertes
	msg.alerts ? $(".alerts a").css({"opacity":"1"}) : $(".alerts a").css({'opacity':'0.3'});
	
	// Couleur de demain (tempo)
	y = msg.tab.DEMAIN.split(':').pop(); // y=dem_coul
	y != '#FFFFFF' ? $('.dem_coul a').css({"background-color":y, 'color':'#FFFFFF', 'opacity':'1'}):
		$('.dem_coul a').css({"background-color":y,'color': $('#maj'),'opacity':'1'});
	if (y == '#') $(".dem_coul a").css({"color":$('#maj').css('color'), "opacity":"0.3"});
	
	// Avertissement EJP (30 mn)
	msg.tab.PEJP != '0' ? $(".info_pejp a").css({"background-color":"#F00", "color":'#FFF', "opacity":"1"}):
		$(".info_pejp a").css({"color":$('#maj'), 'opacity':'0.3'});
//	$('#compteur').html('AUCUNE CONNEXION');
//	$('#isousc').html('INDISPONIBLE');
}
});