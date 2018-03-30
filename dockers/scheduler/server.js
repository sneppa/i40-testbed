'use strict';
var opcua = require("node-opcua");
var async = require("async");
var opcClient = require('./functions/client');
var scheduler = require('./functions/scheduler');

opcClient.getServerList(function (err, servers) { 
    
//console.log(servers);
    scheduler.setOpcClient(opcClient);

    async.forEachOf(servers, function (server, index, callback) { 
        var endpoint = server.discoveryUrls[0];
        var client = require('./functions/client');

        console.log(endpoint);

        if (endpoint != config.discovery.url && !scheduler.existsServer(endpoint))
        {
            client.createSession(endpoint, function (sess, err) {
                if (err)
                {
                    console.log("Can't conntect to "+endpoint);
                    callback(err);
                }
                else
                {
                    client.getChildren("ns=1;s=Service", sess, function (data, err) {
                        //console.log(data);
                        //console.log(err);
                        if (!err)
                        {
                            console.log("An Schedular übergeben (Machine)");
                            scheduler.addMachine(server, sess, data, function () { callback(); });
                        }
                        else if (err == "BadNodeIdUnknown")
                        {
                            client.getChildren("ns=1;s=Product", sess, function (data, err) {
                                if (!err)
                                {
                                    console.log("An Schedular übergeben (Product)");
                                    scheduler.addProduct(server, sess, data, function () { callback(); });
                                }
                                else
                                    callback(err);
                            });
                        }
                        else
                            callback(err);
                    });


                }
            });
        } 
        else
            callback();

    }, function(err) {
        if (err) console.error(err.message);
        // configs is now a map of JSON data
        console.log("Fertig initialisiert");
        scheduler.printServers();
    });

});