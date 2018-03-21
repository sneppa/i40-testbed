config = {};

config.port = 8080; // Port des API Servers

// MongoDB Einstellungen
config.db = {};
config.db.url = 'mongodb://localhost:27017';
config.db.name = 'interface';

config.repository = 'http://localhost:8090/api'; // URL zur Repository API

config.demo = true; // @TODO Datenbank wird automatisch gefüllt.

module.exports = config;