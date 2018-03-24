config = {};

config.port = 8080; // Port des API Servers

// MongoDB Einstellungen
config.db = {};
config.db.url = 'mongodb://localhost:27017'; // Started with: node
//config.db.url = 'mongodb://localhost:27017'; // Started with: docker
config.db.name = 'interface';

// URL zur Repository API
config.repository = 'http://localhost:8090/api'; // Started with: node
//config.repository = 'http://localhost:8090/api'; // Started with: docker
//config.repository = 'http://localhost:8090/api'; // Started with: kubernetes

config.discovery = {};
config.discovery.url = 'opc.tcp://localhost:4840'; // URL zum Discovery Server
config.discovery.enabled = true; // Discovery Server an/aus schalten

config.demo = false; // Datenbank wird automatisch gefüllt.

module.exports = config;