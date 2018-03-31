config = {};

var client = require('./functions/client');

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
    'method': function (args, status, callback) {
        client.setUrl(args[0].value);
        client.setStep(config.methods[0].name);
        client.createSession(function (err) {
            client.produce(function (err) {
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
                        client.createSession(function (err) {
                            client.finished(function () {
                                console.log("aaaand finished");
                                status = 'WAIT';
                                client.stopSession();
                            });
                        });
                    }, 10000);
                }
                callback(err, "Boolean", result);
            });
            client.stopSession();
        });
    }
};

module.exports = config;