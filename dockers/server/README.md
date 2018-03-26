# Aktiver OPC UA Server

Mit diesem (späteren) Docker können neue OPC UA Server für das Testbed erstellt werden.
Über die config.js können alle Methoden angepasst werden, die der Server bereitstellt.
Die erste Methode des Servers ist die Produktionsmethode (kann später erweitert werden).

## Starten des Servers:

``$ node server.js -name='' -method='' -duration='' -uri='' [-port='']``

- Name: Servername
- Method: Name der Produktionsmethode
- Duration: Dauer der Produktion in ms
- Uri: Eindeutige ID des Servers (Einmalig im Netz)
- [optional] Port: Port auf dem der Server läuft

Beispielaufruf:

``$ node server.js -name='Zuschneider 3000' -method=zuschneiden -duration=1000 -uri=ZUSCHNEIDSERVER``

## Starten mit Docker:

Vor dem ersten Starten bauen:

`` $ sudo docker build -t i40/server .``

Starten mit:

`` $ sudo docker run -d -p 4334:4334 --link discoveryserver -e name='' -e method='' -e duration='' -e uri='' [-e port=''] i40/server``

Beispielaufruf:

`` $ sudo docker run -d -p 4334:4334 --link discoveryserver -e name='Zuschneider 3000' -e method=zuschneiden -e duration=1000 -e uri=ZUSCHNEIDSERVER -e port=4334 i40/server``

Troubleshooting: Sollte das Interface über http://localhost:8080 nicht erreichbar sein, könnte dies an der Windows Docker Installation liegen, diese prüfen, ggf. auf Linux testen oder anderem System.

## ToDo:
- Automatische Produktionsketter
