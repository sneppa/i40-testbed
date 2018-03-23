# Aktiver OPC UA Server

Mit diesem (späteren) Docker können neue OPC UA Server für das Testbed erstellt werden.
Über die config.js können alle Methoden angepasst werden, die der Server bereitstellt.
Die erste Methode des Servers ist die Produktionsmethode (kann später erweitert werden).

Starten des Servers:

``$ node server.js -name='' -method='' -duration='' -uri='' [-port='']``

- Name: Servername
- Method: Name der Produktionsmethode
- Duration: Dauer der Produktion in ms
- Uri: Eindeutige ID des Servers (Einmalig im Netz)
- [optional] Port: Port auf dem der Server läuft

Beispielaufruf:

``$ node server.js -name='Zuschneider 3000' -method=zuschneiden -duration=1000 -uri=ZUSCHNEIDSERVER``

ToDo:
- Automatische Produktionsketter