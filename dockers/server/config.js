config = {};

var clientClass = require('./functions/client');

config.discovery = {};
//config.discovery.url = 'opc.tcp://localhost:4840'; // URL zum Discovery Server bei NodeJS Ausführung
config.discovery.url = 'opc.tcp://discoveryserver:4840'; // URL bei Docker Ausführung
config.discovery.enabled = true; // Discovery Server an/aus schalten

//config.applicationUri = 'urn:SERVER_1'; // Wird durch Command Line Parameter gesetzt
//config.productUri = 'SERVER_1'; // Wird durch Command Line Parameter gesetzt
//config.productName = 'Testserver'; // Wird durch Command Line Parameter gesetzt

config.port = 4334; // Port des OPC UA Servers

config.methods = [];
config.methods[0] = {
//    'name': 'Zuschneiden', // Wird durch Command Line Parameter gesetzt
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
                    status = 'PRODUCING';
                    var result = true;
                    if (err)
                    {
                        result = false;
                        status = 'WAIT';
                    }
                    else
                    {
                        // After n seconds set product as finished
                        setTimeout(function () {
                            var finishedClient = new clientClass(endpoint);
                            finishedClient.setStep(config.methods[0].name);
                            finishedClient.setLocation(config.productName);
                            finishedClient.createSession(function (sess, err) {
                                finishedClient.finished(function () {
                                    console.log("aaaand finished");
                                    status = 'WAIT';
                                    finishedClient.stopSession();
                                    callbackProduced();
                                });
                            });
                        }, config.duration);
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
        //callback(null, "Boolean", false);
    }
};

module.exports = config;