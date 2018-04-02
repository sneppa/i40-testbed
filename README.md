# i40-testbed
Components for an Industrie 4.0 Testbed Prototype.

Concept and prototype described in https://github.com/sneppa/thesis-template

## Components:
- [Control Interface](https://github.com/sneppa/i40-testbed/tree/master/dockers/control)
- [Discovery Server](https://github.com/sneppa/i40-testbed/tree/master/dockers/discovery)
- [Repository](https://github.com/sneppa/i40-testbed/tree/master/dockers/repository)
- [Configurable Active I4.0 Component](https://github.com/sneppa/i40-testbed/tree/master/dockers/server)
- [WireShark](https://github.com/sneppa/i40-testbed/tree/master/dockers/wireshark)
<!--- - Configurable Active I4.0 Component Forwarder
- PKI & Identity Provider --->

## Implemented with:
- [NodeJS](https://github.com/nodejs)
- [MongoDB](https://github.com/mongodb)
- [AngularJS](https://github.com/angular)
- [NodeOPCUA](https://github.com/node-opcua)

## How to use

The testbed can be used with nodejs, docker or kubernetes

### NodeJS

Vor dem Start, alle Konfigurationsdateien auf NodeJs einstellen

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

Vor dem ersten Start:

``$ ./scripts/buildDockers.sh``

1. Start Discovery/Repository/Control Dockers

``$ ./scripts/startDockers.sh``

2. Start Servers

All virtual OPC UA Servers can be started in the controlpanel. If you want to start an individualized server, you can use the commands described in the [server readme](https://github.com/sneppa/i40-testbed/tree/master/dockers/server).

### Kubernetes

not implemented

## Beispiele

Unter [examples](https://github.com/sneppa/i40-testbed/tree/master/examples) sind diverse Beispiel für OPC UA zu finden. 
