function sendEco ( url, retCmd ) {
	var http = require ( 'http' );
	var str = '';
	http.get ( url, function( res ) {
		res.on ( 'data', function ( chunk ) {
			str += chunk;
		});
		res.on ( 'end', function () {
			retCmd ( str );
		});
	}).on ( 'error', function ( error ) {
		console.log ( '\nTeleinfoRemote [erreur] => ' + error.message );
	});
}

exports.init = function ( SARAH ) {

	if ( !exports.tarif ) exports.tarif = 'Demandez à SARAH' ;
	if ( !exports.conso ) exports.conso = 'Demandez à SARAH';
}

exports.action = function ( data , callback , config , SARAH ) {
	var	cfg 	= config.modules.TeleinfoRemote;
	var ecoUrl = 'http://' + cfg.User + ':' + cfg.Password + '@' + cfg.Host + '/teleinfo.xml'; // ou api/xdevices.json

	if ( !cfg.Host || !cfg.User || !cfg.Password ) {
		console.log ( "\nTeleinfoRemote [Erreur] => Hote ou User / Password non paramétré !" );
		return callback ({ 'tts' : 'Erreur de configuration' });
	}

	sendEco( ecoUrl, function ( retCmd ) {
		var str = new RegExp ( '<' + data.tag + '>(.*?)<\/' + data.tag + '>', 'gm' ).exec( retCmd )[1];

		switch ( str ) {
			case 'HC' :
				exports.tarif = 'Heures Creuses';
				data.ttsAction = data.ttsAction.replace ( /%/, exports.tarif);
				break;
			case 'HP' :
				exports.tarif = 'Heures Pleines';
				data.ttsAction = data.ttsAction.replace ( /%/, exports.tarif);
				break;
			case '0' :
					SARAH.speak ( 'Vous êtes en triphasé');
					str = new RegExp ( '<' + data.tag + 1 + '>(.*?)<\/' + data.tag + 1 + '>', 'gm' ).exec( retCmd )[1];
					data.ttsAction = data.ttsAction.replace( /%/, str);
					data.ttsAction += ' sur la phase 1, ';
					str = new RegExp ( '<' + data.tag + 2 + '>(.*?)<\/' + data.tag + 2 + '>', 'gm' ).exec( retCmd )[1];
					data.ttsAction += str + ' ampère sur la phase 2, ';
					str = new RegExp ( '<' + data.tag + 3 + '>(.*?)<\/' + data.tag + 3 + '>', 'gm' ).exec( retCmd )[1];
					data.ttsAction += str + ' ampère sur la phase 3';
				break;
			default :
				if ( data.tag == 'T1_PPAP' ) exports.conso = str + ' VA';
				data.ttsAction = data.ttsAction.replace ( /%/, str);
		}
		console.log ( '\nTeleinfoRemote [OK] => ' + data.ttsAction );
		callback ({ 'tts' : data.ttsAction });
	});
}
