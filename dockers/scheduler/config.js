config = {};

config.discovery = {};
//config.discovery.url = 'opc.tcp://localhost:4840'; // URL zum Discovery Server bei NodeJS Ausführung
config.discovery.url = 'opc.tcp://discoveryserver:4840'; // URL bei Docker Ausführung
config.discovery.enabled = true; // Discovery Server an/aus schalten

config.interval = 10000; // Interval des Schedulers

config.ignoreProduced = true; // Produkte mit Status PRODUCED werden weiterhin nach dem Status gefragt.

module.exports = config;