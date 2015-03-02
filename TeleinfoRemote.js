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
	'PAPP':'% VA',
	'HHPHC':'%'};

exports.action = function ( data , callback , config , SARAH ) {
	var cfg = SARAH.ConfigManager.getConfig().modules.TeleinfoRemote, 
		numCpt ;

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
			
			if (data.need) SARAH.speak(data.need);
			callback({'tts':JSON.stringify(SARAH.context.TeleinfoRemote)});
		});
	}
	var a =	require ('http').request('http://'+cfg.User+':'+cfg.Password+'@'+cfg.Host+'/protect/settings/teleinfo' + cpt[1] + '.xml', clbk);
	a.end();
	a.on ( 'error', function ( error ) {
		console.log ( '\nTeleinfoRemote [Erreur] => ' + error.message );
	}); 
}