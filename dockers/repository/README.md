# Docker für Repository

Mit diesem Docker werden zu fertigende Produkte als OPC UA Server angeboten.

Die Produkte werden in einer mongoDB gespeichert.

# Konfigurieren

Im Rootfolder befindet sich eine config.js. Mit Hilfe dieser können alle benötigten Parameter angepasst werden.

## Starten mit Docker

Vor dem ersten Start:

``$ docker-compose build``

Starten mit:

``$ docker-compose up -d``

Troubleshooting: Sollte das Interface über http://localhost:8090 nicht erreichbar sein, könnte dies an der Windows Docker Installation liegen, diese prüfen, ggf. auf Linux testen oder anderem System.