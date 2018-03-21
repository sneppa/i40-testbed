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
var opcServersIds = [];
var portcounter = config.product.startPort;

var url = config.db.url;
var dbName = config.demo ? 'demorepo' : config.db.name;
var db = null;

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

logger("Server beenden mit CTRL + C".red);

MongoClient.connect(url, function (err, client) {

    assert.equal(null, err);

    logger("Connected successfully to mongoDB server");

    db = client.db(dbName);

    if (config.demo)
    {
        initDemoDatabase(db);
    } else
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
            logger("Queried Products");
        });
    });

    // Produkte löschen
    app.delete('/api/product/:productid', function (req, res) {
        logger("remove: " + req.params.productid);
        products.remove({"_id": new mongodb.ObjectID(req.params.productid)}, function (err, result) {
            if (err == null)
            {
                stopOpcUaProductServer(req.params.productid);
                res.status(200);
            } else
                res.status(500);
            res.send("");
        });
    })

    // Neues Produkt erstellen
    app.post('/api/product', function (req, res) {
        products.insert(req.body, function (err, records) {
            if (err == null)
            {
                logger("Produkt gespeichert: " + req.body.name);
                if (records.ops[0] != null)
                    addOpcUaProductServer(records.ops[0]);
                res.status(200);
            } else
                res.status(500);
            res.send("");
        });
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
        logger("Objekte aus Datenbank: " + result.length);
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
        }
    });

    server.serverInfo.applicationUri = "urn:PRODUCT_" + product._id;
    server.serverInfo.productUri = "PRODUCT_" + product._id;

    logger("Add Product Server: " + product.name + ":" + portcounter);

    opcServers[product._id] = server;
    opcServersIds.push(product._id);

    server.initialize(function () {
        logger("Init Product Server: " + product.name);
        initializeAddressspace(product, server);

        if (config.discovery.enabled)
        {
            server.registerServer(config.discovery.url, function () {
                console.log("Registered Server to " + config.discovery.url);
            });
        }

        // we can now start the server
        server.start(function () {
            var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
            logger(("Product Server is now listening (" + server.buildInfo.productName + ": " + endpointUrl + " - ID: " + server.buildInfo.productUri + ")").green);
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
        addVarToAdressspace(addressSpace, folder, variable, product);
    });

    console.log(product._id);

    // Hinterlegen der standardisierten Werte:
    addVarToAdressspace(addressSpace, folder, {name: "status", type: "Int16", value: product.status}, product);
    addVarToAdressspace(addressSpace, folder, {name: "location", type: "String", value: product.location}, product);
    addVarToAdressspace(addressSpace, folder, {name: "idproduct", type: "String", value: "ID: " + product._id}, product);

    var steps = addressSpace.addFolder(folder, {browseName: "Step"});
    var stepcounter = 0;
    product.step.forEach(function (step) {
//        console.log(step.name);
        addStepToAdressspace(addressSpace, steps, stepcounter, step.name);
        stepcounter++;
    });

//    addVarToAdressspace(addressSpace, folder, {name: "", type:"String", value: ""}, product);

}

/**
 * Fügt dem übergebenen Adressraum die Variable hinzu
 * @param {type} addressSpace
 * @param {type} folder
 * @param {type} variable
 * @returns {undefined}
 */
function addVarToAdressspace(addressSpace, folder, variable, product)
{
    var getMethod = function () {
        return new opcua.Variant({dataType: toEnum(variable.type), value: variable.value});
    };

    var setMethod = null;

    setMethod = function (variant) {
        logger("changed: " + variable.name + " (" + product._id + ")");
        variable.value = variant.value;

        // Produkt Objekt aktualiseren vorm speichern
        if (variable.name == "location")
            product.location = variant.value;
        else if (variable.name == "status")
            product.status = variant.value;
        else
        {
            product.var.forEach(function (cvar) {
                if (cvar.name == variable.name)
                    cvar.value = variant.value;
            })
        }

        // Datenbank aktualisieren
        var newvalues = {$set: product};
        console.log(newvalues);
        db.collection("products").update({"_id": new mongodb.ObjectID(product._id)}, newvalues, function (err, res) {
            if (err == null)
            {
                logger("Wert gespeichert".green);
                logger(res.result);
            } else
                logger("Fehler bei Wert speichern".red);
        });

        return opcua.StatusCodes.Good;
    }

//    logger(variable.name + " (" + variable.type + "): " + variable.value);
    addressSpace.addVariable({
        componentOf: folder,
        browseName: variable.name,
        dataType: variable.type,
        value: {
            get: getMethod,
            set: setMethod
        }
    });
}

function addStepToAdressspace(addressSpace, folder, stepnr, name)
{
//    console.log("add step");
    var getMethod = function () {
        return new opcua.Variant({dataType: opcua.DataType.String, value: name});
    };
//    logger(variable.name + " (" + variable.type + "): " + variable.value);
    addressSpace.addVariable({
        componentOf: folder,
        browseName: "step-" + stepnr,
        dataType: "String",
        value: {
            get: getMethod
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
            break;
        case "INT16":
            return opcua.DataType.Int16;
            break;
    }
}

/**
 * Stopt den angegbenen Server
 * @param {Integer} productid
 * @returns {undefined}
 */
function stopOpcUaProductServer(productid)
{
    stopOpcUaProductServer(productid, function () {});
}

/**
 * Stopt den angegbenen Server
 * @param {Integer} productid
 * @param {function} callback
 * @returns {undefined}
 */
function stopOpcUaProductServer(productid, callback)
{
    logger(("Server gestoppt: " + productid).yellow);


    if (config.discovery.enabled)
    {
        opcServers[productid].unregisterServer(config.discovery.url, function () {
            console.log("Unregistered Server from " + config.discovery.url);
            opcServers[productid].shutdown(callback);
        });
    } else
        opcServers[productid].shutdown(callback);
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


/**
 * Safe Shutdown with unregister
 */
process.on('SIGINT', function () {
    console.log("Stop Server");

    console.log(config.discovery);

    opcServersIds.forEach(function (id, index) {
        var callback = function () {};
        if (index == opcServersIds.length - 1)
            callback = function () {
                process.exit();
            };
        stopOpcUaProductServer(id, callback);
    });
});