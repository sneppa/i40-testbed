'use strict';

var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var app = express();
var logger;


var url = 'mongodb://localhost:27017';
var dbName = 'interface';

// Bereitstellen des static contents
app.use(express.static('public'));
// BodyParsergeschiss
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// App bereitstellen
app.listen(8080, function () {
    logger('Example app listening on port 8080!');
});


// Datenbankoperationen
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    logger("Connected successfully to mongoDB server");
    var db = client.db(dbName);
    var collection = db.collection('producttypes');

    // Neues Produkt erstellen
    app.post('/api/product', function (req, res) {

        var collection = db.collection('products');

        collection.insert(req.body, function (err, records) {

            if (err == null)
                res.status(200);
            else
                res.status(500);

            res.send("");
        });
        logger(req.body);
    });

    // Neuer Produkttyp erstellen
    app.post('/api/producttype', function (req, res) {

        var collection = db.collection('producttypes');

        collection.insert(req.body, function (err, records) {

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

        collection.find({}).toArray(function (err, result) {
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
            logger(result);
        });
    });
    
    // Löschen eines Produkttypens
    app.delete('/api/producttype/:typeid', function (req, res) {
        
        logger("remove: "+req.params.typeid);
        
        collection.remove({"_id": new mongodb.ObjectID(req.params.typeid)}, function (err, result) {
            if (err == null)
                res.status(200);
            else
                res.status(500);

            res.send("");
        });
    })

});

logger = function (text) {
    console.log(text);
};