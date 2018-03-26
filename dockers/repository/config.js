config = {};

config.port = 8090; // Port des API Servers

config.discovery = {};
config.discovery.url = 'opc.tcp://localhost:4840'; // URL bei NodeJS
config.discovery.url = 'opc.tcp://discoveryServer:4840'; // URL als Docker
config.discovery.enabled = true; // Discovery Server an/aus schalten

// MongoDB Einstellungen
config.db = {};
config.db.url = 'mongodb://localhost:27017'; // NodeJS
config.db.url = 'mongodb://repodb:27017'; // Docker
config.db.name = 'repository';

config.product = {};
config.product.startPort = 30000; // Erster Port der für die OPC UA Server verwendet wird

config.demo = false; // Datenbank wird automatisch gefüllt und Testdaten werden bereitgestellt.

module.exports = config;