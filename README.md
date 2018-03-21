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

The testbed can be used only with nodejs, with docker and with kubernetes

### NodeJS

1. Start MongoDB

``$ mongod``

2. Start Discovery

``$ nodejs /dockers/discovery/server.js``

3. Start Servers

``$ nodejs /dockers/repository/server.js``

``$ nodejs /dockers/control/server.js``

4. Start OPC UA Active Servers (for each server)

``$ nodejs /dockers/server/server.js``

### Docker

not implemented

### Kubernetes

not implemented

