#![](../master/img/maison.png) TeleinfoRemote

Plugin for S.A.R.A.H. project by JP Encausse http://blog.encausse.net/s-a-r-a-h/




## Plugin de gestion de l'Ecodevice Téléinfo (by GCE)

Permet à S.A.R.A.H. de relever les information Téléinfo de votre fournisseur d'énergie électrique :
- Via commandes vocales.
- Via les icônes du portlet.
- De manière autonome via la mise en place d'un timer.

Une suveillance peut aussi être mise en place pour :
- Le passage en Heures Creuses.
- Le changement de "couleur" du tarif Tempo.
- L'activation EJP. 


#### TeleinfoRemote Setup


Téléchargez le plugin TeleinfoRemote sur le MarketPlace de SARAH
http://marketplace.sarah.encausse.net/store

Démarrez SARAH et lancez l'interface Web du client. http://127.0.0.1:8080/home

Dans le portlet TeleinfoRemote, renseignez les champs suivants :
```
- Host {hostname}	: L'adresse (url) de votre Eco Devices Téléinfo.
- User {username}	: Votre nom d'utilisateur Téléinfo.
- Password {pass}	: Votre mot de passe Téléinfo.
- Timer {xx}		: La durée du "timer" en minutes (ie : 0.5 pour 30s. - 10 pour 10m.).
- Alertes {on}		: Surveillance des changements de tarif (HC/HP - Tempo - EJP).
```

Par ailleurs, le portlet doit avoir la valeur `"w" : 2` en ce qui concerne sa taille.

#### TeleinfoRemote Exemples


- Commandes vocales :
	- "SARAH quelle est ma consommation ?".
	- "SARAH quel est le tarif actuel ?".
	- "SARAH quelle est la puissance ?".
	- "SARAH quelle est la puissance souscrite ?".
	- "SARAH Quelle est l'intensité maxi ?".
	- "SARAH Active le timer".

- Icônes du porlet :
	- Mise à jour des données en cliquant l'icône <img src="../master/img/maison.png" height="20" width="20"> du plugin...
	- Changement du compteur sélectionné.
	- Activation :
		- Du timer.
		- Des alertes.

	En cliquant sur les zones "texte" correspondantes.


#### TeleinfoRemote Notes

- Si vous étes en **triphasé**, le plugin adaptera ses informations phase par phase.
- Les 2 compteurs d'énergie de l'Ecodevice sont gérés, mais pas les conmpteurs auxiliaires à impulsions (Eau/Gaz)... Pour l'instant.



#### ATTENTION

Bien lire la documentation détaillée fournie (*index.html*) accessible, une fois le plugin installé, via l'interface de S.A.R.A.H. en cliquant sur le Portlet TéléinfoRemote.



