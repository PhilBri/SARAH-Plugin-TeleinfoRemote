var tabDev = {	
	'OPTARIF':{'HC..':'HC/HP','EJP.':'EJP','BBRX':'Tempo'},
	'ISOUSC':'% A',
	'PEJP':'%',
	'PTEC':{'TH':'Toutes Heures:#','HP':'Heures Pleines:#','HC':'Heures Creuses:#','HP':'Heures Pleines:#','HN':'Heures Normales:#',
			'PM':'Heures Pointe:#','HCJB':'Heures Creuses:#00BFFF','HPJB':'Heures Pleines:#00BFFF','HCJW':'Heures Creuses:#FFFFFF',
			'HPJW':'Heures Pleines:#FFFFFF','HCJR':'Heures Creuses:#FF0000','HPJR':'Heures Pleines:#FF0000'},
	'DEMAIN':{'----':'indisponible:#','BLEU':'Bleu:#00BFFF','ROUG':'Rouge:#FF0000','BLAN':'Blanc:#FFFFFF'},
	'IINST':'% A','IINST1':'%-','IINST2':'%-','IINST3':'% A',
	'ADPS':'% A',
	'IMAX':'% A','IMAX1':'%-','IMAX2':'%-','IMAX3':'% A',
	'PPAP':'% VA',
	'HHPHC':'%'},cfg;

exports.init = function ( SARAH ) {
	cfg = SARAH.ConfigManager.getConfig().modules.TeleinfoRemote; 
	console.log ('\nTeleinfoRemote[OK] ====>     init     <====');
	SARAH.call('TeleinfoRemote',{'Host':cfg.Host,'User':cfg.User,'Password':cfg.Password});
}

exports.action = function ( data , callback , config , SARAH ) {
	var numCpt ;
	SARAH.context.TeleinfoRemote===undefined ? numCpt ='Compteur 1' : numCpt = SARAH.context.TeleinfoRemote.numCpt;
	if (data.cpt!==undefined) numCpt = data.cpt;
 	numCpt == 'Compteur 1' ? cpt = 'T1' : cpt = 'T2';

	if ( !cfg.Host || !cfg.User || !cfg.Password ) {
		console.log ( "\nTeleinfoRemote [Erreur] => Hote ou User / Password non paramétré !" );
		return callback ({ 'tts' : 'Erreur de configuration' });
	}

	clbk = function( response ) {
		var str = '';
		var tabPlug = {};

		response.on ( 'data', function ( chunk ) { str += chunk });

		response.on ( 'end', function () {
			for( var key in tabDev ) {
				reg = new RegExp ( '<' + cpt + '_'+ key + '>(.*?)</' + cpt + '_' + key + '>',"gm" ).exec(str);
				if (reg) reg=reg[1];

				if ( typeof tabDev[key] != 'object') tabPlug[key] = tabDev[key].replace ( '%', reg );
				else {
					tabPlug[key] = tabDev[key][reg];
					reg = tabDev[key][reg];
				}
				if ( key == data.tag ) data.ttsAction = data.ttsAction.replace( '%', reg.split(':').shift() );
			}
			if (data.ttsAction) {
				callback({'tts':data.ttsAction});
				console.log('\nTeleinfoRemote [OK] => ' + data.ttsAction);
			} else console.log( '\nTeleinfoRemote [OK] => Mise à jour portlet...' );

			SARAH.context.TeleinfoRemote= { 'numCpt':numCpt, 'maj': new Date(), 'tab': tabPlug };

			// tests
			//SARAH.context.TeleinfoRemote.tab.PTEC = 'Heures Pleines:#FF0000';
			//SARAH.context.TeleinfoRemote.tab.OPTARIF = 'EJP';
			//SARAH.context.TeleinfoRemote.tab.DEMAIN = 'Rouge:#FF0000';
			//SARAH.context.TeleinfoRemote.tab.PEJP = '30';
			//SARAH.context.TeleinfoRemote.numCpt = 'Compteur 2';
			// tests end
			
			if (data.need) SARAH.speak(data.need);
			callback({'tts':JSON.stringify(SARAH.context.TeleinfoRemote)});
			console.log('\nValeurs :........................\n');
			console.log(SARAH.context.TeleinfoRemote);
		});
	}
	require ('http').request('http://'+cfg.User+':'+cfg.Password+'@'+cfg.Host+'/protect/settings/teleinfo' + cpt[1] + '.xml', clbk).end();
}