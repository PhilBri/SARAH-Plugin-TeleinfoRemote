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
	cfg = SARAH.ConfigManager.getConfig().modules.TeleinfoRemote;
	SARAH.context.io = require('./lib/socket.io')(12345);
	SARAH.context.io.sockets.on('connection', function (socket){
		SARAH.context.socket = socket;
		console.log('TéléinfoRemote [Info] => Connected...');
		socket.on('disconnect', function(){
			console.log('TéléinfoRemote [Info] => Disconnected...');
		});
		socket.on('status', function(){
			SARAH.call('TeleinfoRemote');
		})
	});
}

exports.action = function (data , callback , config , SARAH) {
	//var numCpt;
	SARAH.context.TeleinfoRemote === undefined ? numCpt = 'Compteur 1' : numCpt = SARAH.context.TeleinfoRemote.numCpt;
	if (data && data.cpt !== undefined) numCpt = data.cpt;
 	numCpt == 'Compteur 1' ? cpt = 'T1' : cpt = 'T2';
 	data && data.set_alert !== undefined ? alerts = data.set_alert : alerts = '';
 	data && data.set_timer == 'ON' && !isNaN(cfg.Timer) ? timer = cfg.Timer : timer = 'OFF';
 	if (data && data.set_timer == 'ON' && isNaN(cfg.Timer)) data.ttsAction = data.bad_req;

	if ( !cfg.Host || !cfg.User || !cfg.Password ) {
		console.log ("\nTeleinfoRemote [Erreur] => Hote ou User / Password non paramétré !");
		return callback ({'tts' : 'Erreur de configuration'});
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
				if (data && key == data.tag) data.ttsAction = data.ttsAction.replace('%', reg.split(':').shift());
			}
			if (data && data.ttsAction) {
				callback({'tts':data.ttsAction});
				console.log('TeleinfoRemote [OK] => ' + data.ttsAction);
			}
			SARAH.context.TeleinfoRemote = {'numCpt':numCpt,'maj':new Date(),'timer':timer,'alerts':alerts,'tab':tabPlug};
			if (SARAH.context.socket) SARAH.context.socket.emit('send_Data', SARAH.context.TeleinfoRemote);
			console.log( '\rTeleinfoRemote [OK] => Mise à jour portlet...' );
		});
	}
	var a =	require('http').request('http://'+cfg.User+':'+cfg.Password+'@'+cfg.Host+'/protect/settings/teleinfo'+cpt[1]+'.xml',clbk);
	a.end();
	a.on ('error', function (error) {
		console.log ('\nTeleinfoRemote [Erreur] => http request: ' + error.message);
	});
}
