# TeleinfoRemote

Plugin for S.A.R.A.H. project by JP Encausse
http://blog.encausse.net/s-a-r-a-h/



## TeleinfoRemote Setup

Téléchargez le plugin TeleinfoRemote sur le MarketPlace de SARAH
http://marketplace.sarah.encausse.net/store

Démarrez SARAH et lancez l'interface Web du client http://127.0.0.1:8080/home

Dans le portlet TeleinfoRemote, renseignez les champs suivants :
```
- Host     : L'adresse (url) de votre Eco Devices Téléinfo.
- User     : Votre nom d'utilisateur Téléinfo.
- Password : Votre mot de passe Téléinfo.
- Timer    : La durée du "timer" en minutes (ie : 0.5 pour 30s).
```

Par ailleurs, le portlet doit avoir la valeur "w" : 2 en ce qui concerne sa taille.



## TeleinfoRemote Examples

- "SARAH quelle est ma consommation ?".
- "SARAH quel est le tarif actuel ?".
- "SARAH quelle est la puissance ?".
- "SARAH quelle est la puissance souscrite ?".
- "SARAH Quelle est l'intensité maxi ?".
- "SARAH Active le timer".



### TeleinfoRemote Notes

Si vous étes en _**``triphasé``**_, le plugin adaptera ses informations phase par phase.



### News in this version

Le portlet est mis à jour interactivement à chaque demande via SARAH ou l'icône !(./img/Maison.png)de mise à jour.