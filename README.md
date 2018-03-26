# i40-testbed
Components for an Industrie 4.0 Testbed Prototype.

Concept and prototype described in https://github.com/sneppa/thesis-template

## Components:
- [Control Interface](https://github.com/sneppa/i40-testbed/tree/master/dockers/control)
- [Discovery Server](https://github.com/sneppa/i40-testbed/tree/master/dockers/discovery)
- [Repository](https://github.com/sneppa/i40-testbed/tree/master/dockers/repository)
- [Configurable Active I4.0 Component](https://github.com/sneppa/i40-testbed/tree/master/dockers/server)
- Configurable Active I4.0 Component Forwarder
- PKI & Identity Provider

## Implemented with:
- [NodeJS](https://github.com/nodejs)
- [MongoDB](https://github.com/mongodb)
- [AngularJS](https://github.com/angular)
- [NodeOPCUA](https://github.com/node-opcua)

## How to use

The testbed can be used with nodejs, docker or kubernetes

### NodeJS

1. Start MongoDB

``$ mongod``

2. Start Discovery Server

``$ cd ./dockers/discovery && node server.js``

3. Start Repository 

``$ cd ./dockers/repository && node server.js``

4. Start Controlpanel

``$ cd ./dockers/control && node server.js``

5. Start OPC UA Active Servers

[How to start server](https://github.com/sneppa/i40-testbed/tree/master/dockers/server)

### Docker

1. Start Discovery Docker

``$ sudo docker-compose --file ./dockers/discovery --build up -d`` (-d optional für detached)

2. Start Repository Docker

``$ sudo docker-compose --file ./dockers/repository --build up -d`` (-d optional für detached)

3. Start Controlpanel

``$ sudo docker-compose --file ./dockers/control --build up -d`` (-d optional für detached)

4. Start Servers

[How to start server](https://github.com/sneppa/i40-testbed/tree/master/dockers/server)

### Kubernetes

not implemented

## Beispiele

Unter [examples](https://github.com/sneppa/i40-testbed/tree/master/examples) sind diverse Beispiel für OPC UA zu finden. 
