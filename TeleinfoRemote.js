var tabEco = {	
	'ISOUSC':'% A',
	'PPAP':'% VA',
	'IINST':'% A',
	'IINST1':'%-',
	'IINST2':'%-',
	'IINST3':'% A',
	'OPTARIF': 	{'HC..':'HC/HP','EJP.':'EJP','BBRX':'Tempo'},
	'PTEC':{'TH':'Toutes Heures','HP':'Heures Pleines','HC':'Heures Creuses','HP':'Heures Pleines','HN':'Heures Normales',
			'PM':'Pointe','HCJB':'Heures Creuses:#00BFFF','HPJB':'Heures Pleines:#00BFFF','HCJW':'Heures Creuses:#FFFFFF',
			'HPJW':'Heures Pleines:#FFFFFF','HCJR':'Heures Creuses:#FF0000','HPJR':'Heures Pleines:#FF0000'},
	'DEMAIN':{'----':'indisponible:-----:#FAF0E6','Bleu':'Bleu:#00BFFF','Rouge':'Rouge:#FF0000','Blanc':'Blanc:#FFFFFF'},
	'HHPHC':'%'},
	cfg;

exports.init = function ( SARAH ) {
	SARAH.context.TeleinfoRemote= {'numCpt': 'Compteur 1'};
	console.log ('\nTeleinfoRemote[OK] ====> init <====\n');
	cfg = SARAH.ConfigManager.getConfig().modules.TeleinfoRemote; 
	SARAH.call('TeleinfoRemote',{"Host":cfg.Host,"User":cfg.User,"Password":cfg.Password});
}

exports.action = function ( data , callback , config , SARAH ) {
	if (data.cpt) SARAH.context.TeleinfoRemote.numCpt = data.cpt;
	SARAH.context.TeleinfoRemote.numCpt == 'Compteur 1' ? cpt = 'T1' : cpt = 'T2';
	SARAH.context.TeleinfoRemote.maj = require('moment')().format('HH[h]:mm');

	if ( !cfg.Host || !cfg.User || !cfg.Password ) {
		console.log ( "\nTeleinfoRemote [Erreur] => Hote ou User / Password non paramétré !" );
		return callback ({ 'tts' : 'Erreur de configuration' });
	}

	clbk = function( response ) {
		var str = '';
		var tabExp = {};

		response.on ( 'data', function ( chunk ) {
			str += chunk;
		});

		response.on ( 'end', function () {
			for( var key in tabEco ) {
				reg = new RegExp ( '<' + cpt + '_'+ key + '>(.*?)</' + cpt + '_' + key + '>',"gm" ).exec(str)[1];

				if (typeof tabEco[key] != 'object') tabExp[key] = tabEco[key].replace ('%', reg);
				else {
					tabExp[key] = tabEco[key][reg];
					reg = tabEco[key][reg];
				}
				if ( key == data.tag ) {
					callback({'tts': data.ttsAction.replace( '%', reg.split(':').shift() )});
					console.log ( '\nTeleinfoRemote [OK] => ' + data.ttsAction.replace('%',reg) );
				}
			}
			SARAH.context.TeleinfoRemote.tab = tabExp;
			callback({'tts':JSON.stringify(SARAH.context.TeleinfoRemote)});
		});
	}
	require ('http').request('http://'+cfg.User+':'+cfg.Password+'@'+cfg.Host+'/protect/settings/teleinfo' + cpt[1] + '.xml', clbk).end();

}