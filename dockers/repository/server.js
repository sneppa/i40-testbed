'use strict';

var config = require('./config');
var opcua = require("node-opcua");
var express = require('express');
var bodyParser = require("body-parser");
var mUtil = require("./functions/db_connector");
var assert = require('assert');
var app = express();
var opcServers = [];
var opcServersIds = [];
var portcounter = config.product.startPort;
var products = [];

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

mUtil.connectToServer( function( err ) {

    assert.equal(null, err);

    logger("Connected successfully to mongoDB server");

    db = mUtil.getDb();
//    console.log(db);

    if (config.demo)
    {
        initDemoDatabase(db);
    } else
    {
        app.listen(config.port, function () {
            initServer(db);
        });
    }

    var productsColl = db.collection('products');

    // Produkte abfragen
    app.get('/api/product', function (req, res) {
        productsColl.find({}).toArray(function (err, result) {
            if (err == null)
            {
                res.status(200);
                res.send(result);
            } else
            {
                res.status(500);
                res.send("");
            }
//            logger("Queried Products");
        });
    });

    // Produkte löschen
    app.delete('/api/product/:productid', function (req, res) {
        logger("remove: " + req.params.productid);
        mUtil.deleteProduct(req.params.productid, function (err, result) {
            if (err == null)
            {
                stopOpcUaProductServer(req.params.productid, function () {  });
                res.status(200);
            } else
                res.status(500);
            res.send("");
        });
    })

    // Neues Produkt erstellen
    app.post('/api/product', function (req, res) {
        productsColl.insert(req.body, function (err, records) {
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

    // Produkt aktualisieren
    app.post('/api/product/:productid', function (req, res) {
        logger("Updated: " + req.body.name);
        var product = req.body;
        mUtil.updateProduct(product, function (err, result) {
            if (err)
                res.status(500);
            else
            {
                product._id = req.params.productid;
                products[product._id] = product;
                console.log(products);
                res.status(200);
            }
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
    server.serverInfo.applicationName = {text: product.name, locale: "de"};

    logger("Add Product Server: " + product.name + ":" + portcounter);

    opcServers[product._id] = server;
    opcServersIds.push(product._id);
    products[product._id] = product;

    server.initialize(function () {
        logger("Init Product Server: " + product.name);
        initializeAddressspace(products[product._id], server);

        if (config.discovery.enabled)
        {
            server.registerServer(config.discovery.url, function () {
                console.log("Registered Server to " + config.discovery.url);
            });
        }

        // we can now start the server
        server.start(function () {
            var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
            logger(("Product Server is now listening (" + server.buildInfo.productName + ": " + endpointUrl + " - ID: " + server.serverInfo.productUri + ")").green);
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
    var folder = addressSpace.addObject({
        nodeId: "ns=1;s=Product",
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Product"
    });
    //var folder = addressSpace.addFolder("ObjectsFolder", {browseName: "Product", nodeId: "ns=1;s=Product"});

    // Hinterlegen der produktspezifischen Variablen
    product.var.forEach(function (variable) {
        addVarToAdressspace(addressSpace, folder, variable, product, null);
    });

//    console.log(product._id);

    // Hinterlegen der standardisierten Werte:
    addVarToAdressspace(addressSpace, folder, {name: "currentStep", type: "Int16", value: product.currentStep}, product, "currentStep");
    addVarToAdressspace(addressSpace, folder, {name: "status", type: "String", value: product.status}, product, "status");
    addVarToAdressspace(addressSpace, folder, {name: "location", type: "String", value: product.location}, product, "location");
    addVarToAdressspace(addressSpace, folder, {name: "idproduct", type: "String", value: "ID: " + product._id}, product, null);

    var steps = addressSpace.addObject({
        nodeId: "ns=1;s=Step",
        organizedBy: folder,
        browseName: "Step"
    });
    //var steps = addressSpace.addFolder(folder, {browseName: "Step", nodeId: "ns=1;s=Step"});
    var stepcounter = 0;
    product.step.forEach(function (step) {
//        console.log(step.name);
        addStepToAdressspace(addressSpace, steps, stepcounter, step.name);
        stepcounter++;
    });
    
    addMethodsToAdressspace(addressSpace, folder, product);

//    addVarToAdressspace(addressSpace, folder, {name: "", type:"String", value: ""}, product);

}

/**
 * Fügt dem übergebenen Adressraum die Variable hinzu
 * @param {type} addressSpace
 * @param {type} folder
 * @param {type} variable
 * @returns {undefined}
 */
function addVarToAdressspace(addressSpace, folder, variable, product, varName)
{
    var getMethod = function () {
        var value = "";
        // Produkt Objekt aktualiseren vorm speichern
        if (variable.name == "location")
            value = products[product._id].location;
        else if (variable.name == "status")
            value = products[product._id].status;
        else if (variable.name == "currentStep")
            value = products[product._id].currentStep;
        else
        {
            products[product._id].var.forEach(function (cvar) {
                if (cvar.name == variable.name)
                    value = cvar.value;
            })
        }

        return new opcua.Variant({dataType: toEnum(variable.type), value});
    };
    /* Versuch eine Datenbank dran zu hängen.
    var getMethod = function () {
        logger("get: " + variable.name + " (" + product._id + ")");
        
        return mUtil.getProduct(""+product._id).then( (prod) => {
            console.log(prod);
            var value = "";

            if (variable.name == "location")
                value = prod.location;
            else if (variable.name == "status")
                value = prod.status;
            else if (variable.name == "currentStep")
                value = prod.currentStep;
            else
            {
                prod.var.forEach(function (cvar) {
                    if (cvar.name == variable.name)
                    value = cvar.value;
                })
            }

            return new opcua.Variant({dataType: toEnum(variable.type), value});
        });
    };*/

    var setMethod = null;

    setMethod = function (variant) {
        logger("changed: " + variable.name + " (" + product._id + ")");
        variable.value = variant.value;

        // Produkt Objekt aktualiseren vorm speichern
        if (variable.name == "location")
            product.location = variant.value;
        else if (variable.name == "status")
            product.status = variant.value;
        else if (variable.name == "currentStep")
            product.currentStep = variant.value;
        else
        {
            product.var.forEach(function (cvar) {
                if (cvar.name == variable.name)
                    cvar.value = variant.value;
            })
        }

        // Datenbank aktualisieren
        mUtil.updateProduct(product, function (err, res) {
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
        nodeId: "ns=1;s="+toUri(variable.name),
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
        nodeId: "ns=1;s=step" + stepnr,
        dataType: "String",
        value: {
            get: getMethod
        }
    });
}

function addMethodsToAdressspace(addressSpace, folder, product)
{
        var amethod = addressSpace.addMethod(folder, {
            browseName: "setStatus",
            nodeId: "ns=1;s=setStatus",
            inputArguments: [
                {
                    name: "step",
                    description: {text: "Name der Produktionsstufe"},
                    dataType: opcua.DataType.String
                }, {
                    name: "status",
                    description: {text: "Mögliche Status: WAIT, PRODUCE, FINISHED, FAILURE"},
                    dataType: opcua.DataType.String
                }, {
                    name: "location",
                    description: {text: "Platz"},
                    dataType: opcua.DataType.String
                }
            ],
            outputArguments: [{
                    name: "success",
                    description: {text: "Status konnte gesetzt werden"},
                    dataType: opcua.DataType.Boolean,
                    valueRank: 1
                }]
        });
        amethod.bindMethod(async function (inputArguments, context, callback) {
            var step = inputArguments[0].value;
            var stepIndex = null;
            var status = inputArguments[1].value.toUpperCase();
            var location = inputArguments[2].value;
            var allowedStatus = ["WAIT", "PRODUCE", "FINISHED", "FAILURE", "PRODUCED"];
            
            var returnValue = [false];

            console.log(context.session.clientDescription); // );
            
//            console.log(inputArguments);
            var idproduct = context.server.serverInfo.productUri;
            console.log("Status change: "+idproduct+" ("+step+": "+status+")");
            
            var product = await mUtil.getProduct(idproduct);
            var dbid = product._id;
            
            // Index der Produktionsstufe auslesen
            product.step.forEach(function (astep) {
                if (astep.name.toUpperCase() == step.toUpperCase())
                    stepIndex = astep.index;
            });
            
//            console.log((product.status != "FAILURE")+" && "+inArray(status, allowedStatus)+" && "+(stepIndex != null) + " step: "+stepIndex);
            // Änderungen nur wenn Produkt und Status und Produktionsstufe i.O.
            if (product.status != "FAILURE" && inArray(status, allowedStatus) && stepIndex != null) 
            {
                if (status == "PRODUCED")
                {
                    if (product.step.length == product.currentStep+1)
                    {
                        product.status = status;
                        product.location = "Lager";

                        mUtil.updateProduct(product, function () {});
                        returnValue = [true];
                    }
                }
                else if (stepIndex == product.currentStep)
                {
                    product.status = status;
                    product.currentStep = stepIndex;
                    
                    if (status == "PRODUCE")
                    {
                        product.location = location;
                    }
                    else if (status == "FINISHED")
                        product.location = "Lager";
                    
                    mUtil.updateProduct(product, function () {});
                    returnValue = [true];
                }
                else if(stepIndex == product.currentStep+1 && product.status == "FINISHED") // Nächster Produktionsschritt
                {
                    product.status = "WAIT";
                    product.location = "Lager";
                    product.currentStep = stepIndex;
                    mUtil.updateProduct(product, function () {});
                    returnValue = [true];
                }
                
                product._id = dbid;
                products[dbid] = product;
                console.log("Pallimm Palimm");
                console.log(products);
            }
        
            // console.log("Pallimm Palimm 2");
            // console.log(product);
//            console.log(stepIndex);
            //product.currentStep;

            var callMethodResult = {
                statusCode: opcua.StatusCodes.Good,
                outputArguments: [{
                        dataType: opcua.DataType.Boolean,
                        arrayType: opcua.VariantArrayType.Array,
                        value: returnValue
                    }]
            };
            callback(null, callMethodResult);
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
 * Entfernt unerlaubte Zeichen für den Identifier bei OPC UA
 * @param {String} text
 * @returns {String}
 */
function toUri(text)
{
    text = text.replace(" ", "_");
    text = text.replace("ö", "oe");
    text = text.replace("Ö", "Oe");
    text = text.replace("ä", "ae");
    text = text.replace("Ä", "ae");
    text = text.replace("ü", "ae");
    text = text.replace("Ü", "_");
    
    return text;
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
    console.log("Stop Server".red);
    opcServersIds.forEach(function (id, index) {
        var callback = function () {};
        if (index == opcServersIds.length - 1)
            callback = function () {
                process.exit();
            };
        stopOpcUaProductServer(id, callback);
    });
});

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}