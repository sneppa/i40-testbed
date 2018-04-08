'use strict';
var opcua = require("node-opcua");
var async = require("async");
var opcClient = require('./functions/client');
var scheduler = require('./functions/scheduler');
var config = require('./config');

var startTime = new Date();
var timer = null;

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