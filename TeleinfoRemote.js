var tabDev = {	
	'OPTARIF':{'HC..':'HC/HP','EJP.':'EJP','BBR':'Tempo'},
	'ISOUSC':'% A',
	'PEJP':'%',
	'PTEC':{'TH':'Toutes Heures:#','HC':'Heures Creuses:#','HP':'Heures Pleines:#FF0000','HN':'Heures Normales:#',
			'PM':'Heures Pointe:#FF0000','HCJB':'Heures Creuses:#00BFFF','HPJB':'Heures Pleines:#00BFFF',
			'HCJW':'Heures Creuses:#FFFFFF','HPJW':'Heures Pleines:#FFFFFF','HCJR':'Heures Creuses:#FF0000',
			'HPJR':'Heures Pleines:#FF0000'},
	'DEMAIN':{'----':'indisponible:#','BLEU':'Bleu:#00BFFF','ROUG':'Rouge:#FF0000','BLAN':'Blanc:#FFFFFF'},
	'IINST':'% A','IINST1':'%-','IINST2':'%-','IINST3':'% A',
	'ADPS':'% A',
	'IMAX':'% A','IMAX1':'%-','IMAX2':'%-','IMAX3':'% A',
	'PAPP':'% VA',
	'HHPHC':'%'}, cfg;

exports.init = function (SARAH) {
	console.log('\x1b[96m[ INFO ]\x1b[0m TeleinfoRemote => Initialized...');
	cfg = SARAH.ConfigManager.getConfig().modules.TeleinfoRemote;
	SARAH.context.io = require('./lib/socket.io')(12345);
	SARAH.context.io.sockets.on('connection', function (socket){
		SARAH.context.socket = socket;
		console.log('\x1b[96m[ INFO ]\x1b[0m TeleinfoRemote => Connected...');
		socket.on('disconnect', function(){
			console.log('\x1b[96m[ INFO ]\x1b[0m TeleinfoRemote => Disconnected...');
		});
		socket.on('status', function(){
			SARAH.call('TeleinfoRemote');
		})
	});
}

exports.action = function (data , callback , config , SARAH) {

	if ( !cfg.Host || !cfg.User || !cfg.Password ) {
		console.log ("\n\x1b[91m[ Error ]\x1b[0m TeleinfoRemote => Hote ou User / Password non paramétré !");
		return callback ({'tts' : 'Erreur de configuration'});
	}

	SARAH.context.TeleinfoRemote === undefined ? numCpt = 'Compteur 1' : numCpt = SARAH.context.TeleinfoRemote.numCpt;
	SARAH.context.TeleinfoRemote === undefined ? timer = {set:'Désactivé', time:''} : timer = SARAH.context.TeleinfoRemote.timer;
	SARAH.context.TeleinfoRemote === undefined ? alerts = {set:'Désactivé', stat:'Désactivé'} : alerts = SARAH.context.TeleinfoRemote.alerts;

	if (data && data.cpt !== undefined) numCpt = data.cpt;
 	numCpt == 'Compteur 1' ? cpt = 'T1' : cpt = 'T2';

	if (data && data.set_timer !== undefined) {
		data.set_timer == 'GET' ? data.tts = data.tts + timer.set : timer.set = data.set_timer;
		timer.time = cfg.Timer;
		if (timer.time =='' || isNaN(timer.time)) {
			data.tts = data.bad_req;
			timer.set = 'Désactivé';
		}
	}

	timer.set == 'Désactivé' ? alerts.stat = 'Désactivé' : alerts.stat = 'Activé';

	if (data && data.set_alert !== undefined) {
		data.set_alert == 'GET' ? data.tts = data.tts + alerts.set : alerts.set = data.set_alert;
		if (data.set_alert == 'Activé' && timer.set == 'Désactivé') {
			data.tts = data.bad_req;
			alerts.stat = 'Désactivé';
		}
	}

	clbk = function(response) {
		var str = '';
		var tabPlug = {};
		response.on ('data', function (chunk) {str += chunk});

		response.on ('end', function () {

			for (var key in tabDev) {
				reg = new RegExp ('<' + cpt + '_'+ key + '>(.*?)</' + cpt + '_' + key + '>',"gm").exec(str);
				if (reg) reg = reg[1];
				if (reg.indexOf('BBR')!=-1) reg = 'BBR';

				if (typeof tabDev[key] != 'object') tabPlug[key] = tabDev[key].replace('%', reg);
				else {
					tabPlug[key] = tabDev[key][reg];
					reg = tabDev[key][reg];
				}
				if (data && key == data.tag) data.tts = data.tts.replace('%', reg.split(':').shift());
			}
			if (data && data.tts) {
				callback({'tts':data.tts});
				console.log('\x1b[92m[   OK ]\x1b[0m] TeleinfoRemote => ' + data.tts);
			}
			SARAH.context.TeleinfoRemote = {numCpt:numCpt, maj:new Date(), timer:timer, alerts:alerts, tab:tabPlug};

			if (SARAH.context.socket) SARAH.context.socket.emit('send_Data', SARAH.context.TeleinfoRemote);
			console.log( '\x1b[92m[   OK ]\x1b[0m TeleinfoRemote => Updated...' );
		});
	}
	var a =	require('http').request('http://'+cfg.User+':'+cfg.Password+'@'+cfg.Host+'/protect/settings/teleinfo'+cpt[1]+'.xml',clbk);
	a.end();
	a.on ('error', function (error) {
		console.log ('\033[91m[ Error ]\033[0m TeleinfoRemote => http request: ' + error.message);
	});
}
