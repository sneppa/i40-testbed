# Docker für Discovery Server

Standard LDS + Service Registry

## Starten mit NodeJS

``$ node server.js``

## Starten mit Docker

Vor dem ersten Start:

``$ docker build -t i40/discovery .``

Starten mit:

``$ docker run --name discoveryServer -p 4840:4840 i40/discovery``