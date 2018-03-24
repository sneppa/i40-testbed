var config = require('../config');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var _db;
var _server;
var _client;

var logger = {
    init: function (server, client) {
        _server = server;
        _client = client;
    },
    log: function (text) {
        console.log(text);
        saveToCollection(text, "info");
    },
    error: function (text) {
        console.log(text);
        saveToCollection(text, "error");
    },
    success: function (text) {
        console.log(text);
        saveToCollection(text, "success");
    },
    getLogs: function (limit, callback) {
        _db = _client.db(config.db.name);
        var logs = _db.collection('logger');
        logs.find({}).limit(limit).sort({_id: -1}).toArray(function (err, result) {
            callback(err, result);
        });
    }
};

function saveToCollection(text, type)
{
    _db = _client.db(config.db.name);
    var logs = _db.collection('logger');
    logs.insert({server: _server, msg: text, type: type});
}

module.exports = logger;