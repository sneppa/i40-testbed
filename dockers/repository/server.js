'use strict';

var config = require('./config');
var opcua = require("node-opcua");
var express = require('express');
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var app = express();
var opcServers = [];
var portcounter = config.product.startPort;

var url = config.db.url;
var dbName = config.demo ? 'demorepo' : config.db.name;

logger("Server beenden mit CTRL + C".red);

MongoClient.connect(url, function (err, client) {

    assert.equal(null, err);

    logger("Connected successfully to mongoDB server");

    var db = client.db(dbName);
    
    if (config.demo)
    {
        initDemoDatabase(db);
    }
    else
    {
        app.listen(config.port, function () {
            initServer(db);
        });
    }
    
    var products = db.collection('products');

    // Produkte abfragen
    app.get('/api/product', function (req, res) {
        products.find({}).toArray(function (err, result) {
            if (err == null)
            {
                res.status(200);
                res.send(result);
            } else
            {
                res.status(500);
                res.send("");
            }
            logger("Queried Product");
            logger(result);
        });
    });

    // Neues Produkt erstellen
    app.post('/api/product', function (req, res) {
        products.insert(req.body, function (err, records) {
            if (err == null)
                res.status(200);
            else
                res.status(500);
            res.send("");
        });
        logger(req.body);
    });
});

/**
 * Initialisiert den Server
 * @param {mongoDatabase} db
 */
function initServer(db)
{
    logger("Server started");
    initProductsInDatabase(db);
}

/**
 * Ruft alle Produkte aus der Datenbank ab und übergibt zum Initialisieren
 * @param {mongoDatabase} db
 */
function initProductsInDatabase(db)
{
    var products = db.collection('products');
    products.find({}).toArray(function (err, result) {
        logger("Objekte aus Datenbank: "+result.length);
        if (err == null)
            result.forEach(function (item) {
                addOpcUaProductServer(item);
            });
        else
            return false;
    });
}

/**
 * Erstellt einen neuen OPC UA Server für ein Produkt
 * @param {ProductObject} product
 */
function addOpcUaProductServer(product)
{
    var server = new opcua.OPCUAServer({
        port: portcounter,
        nodeset_filename: opcua.standard_nodeset_file,
        buildInfo: {
            productName: product.name,
            buildNumber: "1",
            buildDate: product.buildDate > 0 ? Date(product.date) : Date(),
            productUri: "PRODUCT_"+product._id
        }
    });

    logger("Add Product Server: " + product.name + ":" + portcounter);

    opcServers[product._id] = server;

    server.initialize(function () {
        logger("Init Product Server: " + product.name);
        initializeAddressspace(product, server);
        
        // we can now start the server
        server.start(function () {
            var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
            logger(("Product Server is now listening ("+server.buildInfo.productName+": "+endpointUrl+")").green);
//            server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
//                console.log(endpoint.endpointUrl, endpoint.securityMode.toString(), endpoint.securityPolicyUri.toString());
//            });
        })
    });

    portcounter++;
}

/**
 * Initialisiert den Adressraum des Servers, der übergeben wird
 * @param {ProductObject} product
 * @param {OPCUAServer} server
 */
function initializeAddressspace(product, server)
{
    var addressSpace = server.engine.addressSpace;
    var folder = addressSpace.addFolder("ObjectsFolder", {browseName: "Product"});

    // Hinterlegen der produktspezifischen Variablen
    product.var.forEach(function (variable) {
        addVarToAdressspace(addressSpace, folder, variable);
    });
    
    // Hinterlegen der standardisierten Werte:
    addVarToAdressspace(addressSpace, folder, {name: "status", type: "Int16", value: product.status});
    addVarToAdressspace(addressSpace, folder, {name: "location", type:"String", value: product.location});
    
    var steps = addressSpace.addFolder(folder, {browseName: "Step"});
    var stepcounter = 0;
    product.step.forEach(function (step) {
        addVarToAdressspace(addressSpace, steps, {name: "step-"+stepcounter, type:"String", value: step.name});
        stepcounter++;
    });
    
//    addVarToAdressspace(addressSpace, folder, {name: "", type:"String", value: ""});

}

/**
 * Fügt dem übergebenen Adressraum die Variable hinzu
 * @param {type} addressSpace
 * @param {type} folder
 * @param {type} variable
 * @returns {undefined}
 */
function addVarToAdressspace(addressSpace, folder, variable)
{
//    logger(variable.name + " (" + variable.type + "): " + variable.value);
    addressSpace.addVariable({
        componentOf: folder,
        browseName: variable.name,
        dataType: variable.type,
        value: {
            get: function () {
                return new opcua.Variant({dataType: toEnum(variable.type), value: variable.value});
            },
            set: function (variant) {
                variable.value = variant.value;
                return opcua.StatusCodes.Good;
            }
        }
    });
}

/**
 * Konvertiert Datentyp String zu Enum
 * @param {type} text
 * @returns {opcua.DataType}
 */
function toEnum(text)
{
    switch (text.toUpperCase()) {
        case "STRING":
            return opcua.DataType.String;
            break;
        case "FLOAT":
            return opcua.DataType.Float;
        case "INT16":
            return opcua.DataType.Int16;
            break;
    }
}

/**
 * Zwischenschicht für Logger für bspw. späteres Remotelogging
 * @param {String} text
 */
function logger(text)
{
    console.log(text);
}

/**
 * 
 * @param {MongoDatabase} db
 */
function initDemoDatabase(db)
{
    db.dropDatabase();
    
    var products = db.collection('products');
    var demo = require('./demo');
    
    products.insert(demo.products, function (err, records) {
        if (err == null)
            console.log("Inserted Demo Products");
        else
            console.log("Error Insert Demo Products");
        
        app.listen(config.port, function () {
            initServer(db);
        });
    });
}