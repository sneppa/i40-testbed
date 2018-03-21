config = {};

config.port = 8090; // Port des API Servers

// MongoDB Einstellungen
config.db = {};
config.db.url = 'mongodb://localhost:27017';
config.db.name = 'repository';

config.product = {};
config.product.startPort = 30000; // Erster Port der für die OPC UA Server verwendet wird

config.demo = false; // Datenbank wird automatisch gefüllt und Testdaten werden bereitgestellt.

module.exports = config;