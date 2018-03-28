'use strict';

var config = require('./config');
var opcClient = require('./functions/client');
var dbLogger = require('./functions/logger');
var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var assert = require('assert');
var exec = require('child_process').exec;
var MongoClient = mongodb.MongoClient;
var app = express();
var logger;


var url = config.db.url;
var dbName = config.db.name;

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

// Datenbankoperationen
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    
    // App bereitstellen
    app.listen(config.port, function () {
        dbLogger.init("Control", client);
        dbLogger.log('Controlpanel listening on port '+config.port+'!');
    });
        
    logger("Connected successfully to mongoDB server");
    var db = client.db(dbName);
    var producttypes = db.collection('producttypes');
    //var products = db.collection('products');
    var servers = db.collection('servers');

    // Server des Netzwerks abfragen
    app.get('/api/network/server', function (req, res) {
        opcClient.findServers(function (err, servers) {
            if (err == null)
            {
                res.status(200);
            }
            else
                res.status(500);
            res.send(servers);
        });
//        logger(req.body);
    });

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
    app.delete('/api/server/:serverid', function (req, res) {
        logger("Delete server: " + req.params.serverid);
        servers.remove({"_id": new mongodb.ObjectID(req.params.serverid)}, function (err, result) {
            if (err == null)
                res.status(200);
            else
                res.status(500);

            res.send("");
        });
    })

    // Starten eines Servers
    app.post('/api/server/start/:serverid', function (req, res) {
        logger("Start server: " + req.params.serverid);
        var server = req.body;
        var send = "";

        var command = "docker run -d -p "+server.port+":"+server.port+" --link discoveryserver -e name='"+server.name+"' -e method='"+server.method+"' -e duration="+server.duration+" -e uri='SERVER_"+server._id+"' -e port="+server.port+" i40/server";

        //console.log(command);

        exec(command, function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                res.status(500);
                res.send(err);
            }
            else
            {
                server.paused = false;
                server.container_id = stdout;
                delete server._id;

                servers.update({"_id": new mongodb.ObjectID(req.params.serverid)}, server, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500);
                    }
                    else
                    {
                        server._id = req.params.serverid;
                        send = server;
                        console.log("Server started and updated in DB");
                        res.status(200);
                    }

                    res.send(send);
                });
            }
        });
    })

    // Stoppen eines Servers
    app.post('/api/server/stop/:serverid', function (req, res) {
        logger("Stop server: " + req.params.serverid);
        var server = req.body;
        var send = "";

        var command = "docker container kill --signal='SIGTERM' "+server.container_id;

        //console.log(command);

        exec(command, function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                res.status(500);
                res.send(err);
            }
            else
            {
                server.paused = true;
                delete server.container_id;
                delete server._id;

                servers.update({"_id": new mongodb.ObjectID(req.params.serverid)}, server, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500);
                    }
                    else
                    {
                        server._id = req.params.serverid;
                        send = server;
                        console.log("Server stopped and updated in DB");
                        res.status(200);
                    }

                    res.send(send);
                });
            }
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

    // Log abfragen
    app.get('/api/log', function (req, res) {
        dbLogger.getLogs(50, function (err, logs) {
            if (err == null)
            {
                res.status(200);
            }
            else
                res.status(500);
            res.send(logs);
        });
//        logger(req.body);
    });
    
});

logger = function (text) {
    console.log(text);
};