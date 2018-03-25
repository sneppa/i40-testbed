# Controlpanel für Verwaltung

Docker, der ein Interface bereitstellt um das Testbed zu verwalten.

## Starten mit NodeJS

``$ node server.js``

## Starten mit Docker

Vor dem ersten Start:

``$ docker-compose build``

Starten mit:

``$ docker-compose up -d``

Troubleshooting: Sollte das Interface über http://localhost:8080 nicht erreichbar sein, könnte dies an der Windows Docker Installation liegen, diese prüfen, ggf. auf Linux testen oder anderem System.

<!-- Test:

``$ docker run -p 8080:8080 -p 30000-30100:30000-30100 -v /var/run/docker.sock:/var/run/docker.sock i40/control`` -->
