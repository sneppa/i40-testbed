'use strict';
var opcua = require("node-opcua");
var async = require("async");
var opcClient = require('./functions/client');
var scheduler = require('./functions/scheduler');
var config = require('./config');

var startTime = new Date();
var timer = null;

// scheduler.getServers(true, function (err) {

//     if (err) console.error(err.message);
//     // configs is now a map of JSON data
//     console.log("Fertig initialisiert");
//     scheduler.printServers();

//     var endTime = new Date();

//     var timeDiff = (endTime - startTime) / 1000;
//     console.log("Init Time: "+timeDiff);

//     setCrawlInterval();

// });

setCrawlInterval();

function setCrawlInterval() { 
    
    timer = setTimeout(function () {
        scheduler.getServers(false, function () { // Neue Server hinzufügen

            scheduler.updateProducts(function() { // Produkte aktualisieren
        
                scheduler.scheduleProducts(function() { // Planen der Produkte
                    console.log("Crawled servers after "+config.interval+"ms interval");
                    setCrawlInterval();
                    scheduler.printServers();
                })
            });

        })

    }, config.interval);
}