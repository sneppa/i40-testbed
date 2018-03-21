config = {};

config.port = 8090; // Port des API Servers

// MongoDB Einstellungen
config.db = {};
config.db.url = 'mongodb://localhost:27017';
config.db.name = 'interface';

config.product = {};
config.product.startPort = 30000; // Erster Port der für die OPC UA Server verwendet wird

config.demo = true; // @TODO Datenbank wird automatisch gefüllt.

module.exports = config;