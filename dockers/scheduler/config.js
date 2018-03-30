config = {};

config.discovery = {};
//config.discovery.url = 'opc.tcp://localhost:4840'; // URL zum Discovery Server bei NodeJS Ausführung
config.discovery.url = 'opc.tcp://discoveryServer:4840'; // URL bei Docker Ausführung
config.discovery.enabled = true; // Discovery Server an/aus schalten

config.interval = 30000; // Interval des Schedulers

module.exports = config;