'use strict';
var opcua = require("node-opcua");
var async = require("async");
var opcClient = require('./functions/client');

var machines = [];
var products = [];

console.log("Hello");

opcClient.getServerList(function (err, servers) { 
    
console.log(servers);

    servers.forEach(function (server, index, servers) {
        var endpoint = server.discoveryUrls[0];
        //endpoint = endpoint.replace('repository', 'localhost'); // Test
        var client = require('./functions/client')
        console.log(endpoint);
        if (endpoint != config.discovery.url)
        // ns=1;s=Product // Ordner für Produktvariablen
        // ns=1;s=Service // Ordner für angebotene Methoden/Services


        client.createSession(endpoint, function (err) {
            if (err)
            {
                console.log("Can't conntect to "+endpoint);
            }
            else
            {
                console.log("Conntected to "+endpoint);
            }

            client.stopSession();
        });
    });

});