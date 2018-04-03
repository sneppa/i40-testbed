config = {};

var clientClass = require('./functions/client');
var exec = require('child_process').exec;
var fs = require('fs');

config.discovery = {};
//config.discovery.url = 'opc.tcp://localhost:4840'; // URL zum Discovery Server bei NodeJS Ausführung
config.discovery.url = 'opc.tcp://discoveryserver:4840'; // URL bei Docker Ausführung
config.discovery.enabled = true; // Discovery Server an/aus schalten

config.applicationUri = 'urn:RealPrinter'; // Wird durch Command Line Parameter gesetzt
config.productUri = 'RealPrinter'; // Wird durch Command Line Parameter gesetzt
config.productName = 'Realer Drucker'; // Wird durch Command Line Parameter gesetzt

config.printingTime = 13000; // Dauer des Ausdrucks

// config.port = 4334; // Port des OPC UA Serverss // wird über Arguments übergeben

config.methods = [];
config.methods[0] = {
    'name': 'Drucken',
    'inputArguments': [
        {
            'name': 'producturi',
            'description': 'Komplette Adresse zu Produkt',
            'dataType': 'String'
        }
    ],
    'outputArguments': [
        {
            'name': 'success',
            'description': 'Gibt zurück ob Auftrag angenommen wurde',
            'dataType': 'Boolean'
        }
    ],
    'method': function (args, status, callback, callbackProduced) {
        if (status == 'WAIT')
        {
            status = 'ATTEMPTING'; // Set Status 
            
            var endpoint = args[0].value;
            // client.setUrl(args[0].value);
            var produceClient = new clientClass(endpoint);
            produceClient.setStep(config.methods[0].name);
            produceClient.setLocation(config.productName);
            produceClient.createSession(function (err) {
                console.log("connected with "+endpoint);
                produceClient.produce(function (err) {
                    console.log("producing...");
                    var result = true;
                    if (err)
                    {
                        result = false;
                        status = 'WAIT';
                    }
                    else
                    {
                        status = 'PRODUCING';

                        var connectedServer = produceClient.session.endpoint.server;
                        var bookName = connectedServer.applicationName.text;

                        

                        var command = "yes | cp -rf print_template.ps print.ps "+ // Copy template to printfile
                                      "&& sed -i 's/__PLACEHOLDER__/"+bookName+"/g' print.ps"; // replace placeholder with title
                        exec(command, function (err, stdout, stderr) {
                            if (err)
                                console.log(stderr);
                            else {
                                command = "lpr print.ps";
                                exec(command, function (err, stdout, stderr) {
                                    if (err)
                                    {
                                        console.log(err);
                                        console.log(stderr);
                                    }
                                    else{
                                        console.log("printing");
                                        console.log(stdout);

                                        // After n seconds set product as finished
                                        setTimeout(function () {
                                            var finishedClient = new clientClass(endpoint);
                                            finishedClient.setStep(config.methods[0].name);
                                            finishedClient.setLocation(config.productName);
                                            finishedClient.createSession(function (sess, err) {
                                                finishedClient.finished(function () {
                                                    console.log(config.methods[0].name+" fertig");
                                                    status = 'WAIT';
                                                    finishedClient.stopSession();
                                                    callbackProduced();
                                                });
                                            });
                                        }, config.printingTime);
                                    }
                                });
                            }
                        });
                    }
                    produceClient.stopSession();
                    callback(err, "Boolean", result, status);
                });
            });
        }
        else
        {
            callback(null, "Boolean", false, status);
        }
    }
};

module.exports = config;