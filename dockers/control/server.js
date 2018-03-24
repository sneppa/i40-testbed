'use strict';

var config = require('./config');
var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var assert = require('assert');
var MongoClient = mongodb.MongoClient;
var app = express();
var logger;


var url = 'mongodb://localhost:27017';
var dbName = 'interface';

// Bereitstellen des static contents
app.use(express.static('public'));
// BodyParsergeschiss
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Cross Origin
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// App bereitstellen
app.listen(8080, function () {
    logger('Controlpanel listening on port 8080!');
});


// Datenbankoperationen
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    logger("Connected successfully to mongoDB server");
    var db = client.db(dbName);
    var producttypes = db.collection('producttypes');
    var products = db.collection('products');
    var servers = db.collection('servers');

    // Neuer Server erstellen
    app.post('/api/server', function (req, res) {
        servers.insert(req.body, function (err, records) {
            if (err == null)
                res.status(200);
            else
                res.status(500);
            res.send("");
        });
//        logger(req.body);
    });

//     Server abfragen
    app.get('/api/server', function (req, res) {
        servers.find({}).toArray(function (err, result) {
            if (err == null)
            {
                res.status(200);
                res.send(result);
            } else
            {
                res.status(500);
                res.send("");
            }
            logger("Queried Servers");
//            logger(result);
        });
    });

    // Löschen eines Servers
    app.delete('/api/server/:typeid', function (req, res) {
        logger("Delete server: " + req.params.typeid);
        servers.remove({"_id": new mongodb.ObjectID(req.params.typeid)}, function (err, result) {
            if (err == null)
                res.status(200);
            else
                res.status(500);

            res.send("");
        });
    })

    // Neues Produkt erstellen -> Ausgelagert auf Repo
//    app.post('/api/product', function (req, res) {
//        products.insert(req.body, function (err, records) {
//            if (err == null)
//                res.status(200);
//            else
//                res.status(500);
//            res.send("");
//        });
//        logger(req.body);
//    });

    // Produkte abfragen -> Ausgelagert auf Repo
//    app.get('/api/product', function (req, res) {
//        products.find({}).toArray(function (err, result) {
//            if (err == null)
//            {
//                res.status(200);
//                res.send(result);
//            } else
//            {
//                res.status(500);
//                res.send("");
//            }
//            logger("Queried Product");
//            logger(result);
//        });
//    });

    // Neuer Produkttyp erstellen
    app.post('/api/producttype', function (req, res) {
        producttypes.insert(req.body, function (err, records) {
            if (err == null)
                res.status(200);
            else
                res.status(500);

            res.send("");
        });
        logger(req.body);
    });

    // Produkttypen abfragen
    app.get('/api/producttype', function (req, res) {
        producttypes.find({}).toArray(function (err, result) {
            if (err == null)
            {
                res.status(200);
                res.send(result);
            } else
            {
                res.status(500);
                res.send("");
            }
            logger("Queried Producttypes");
//            logger(result);
        });
    });

    // Löschen eines Produkttypens
    app.delete('/api/producttype/:typeid', function (req, res) {
        logger("remove: " + req.params.typeid);
        producttypes.remove({"_id": new mongodb.ObjectID(req.params.typeid)}, function (err, result) {
            if (err == null)
                res.status(200);
            else
                res.status(500);

            res.send("");
        });
    })

    // Repository abfragen
    app.get('/api/repository', function (req, res) {
        res.send(config.repository);
    });

    // Repository abfragen
    app.get('/api/repository', function (req, res) {
        res.send(config.repository);
    });

});

logger = function (text) {
    console.log(text);
};