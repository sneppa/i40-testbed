config = {};

var client = require('./functions/client');

config.discovery = {};
config.discovery.url = 'opc.tcp://localhost:4840'; // URL zum Discovery Server
config.discovery.enabled = true; // Discovery Server an/aus schalten

config.applicationUri = 'urn:SERVER_1';
config.productUri = 'SERVER_1';
config.productName = 'Testserver';

config.port = 4334; // Port des OPC UA Servers

config.methods = [];
config.methods[0] = {
    'name': 'Zuschneiden',
    'inputArguments': [
        {
            'name': 'producturi',
            'description': 'Komplette Adresse zu Produkt',
            'dataType': 'String'
        },
        {
            'name': 'forward',
            'description': 'An nächste Produktionsstufe weitergeben?',
            'dataType': 'Boolean'
        }
    ],
    'outputArguments': [
        {
            'name': 'success',
            'description': 'Gibt zurück ob Auftrag angenommen wurde',
            'dataType': 'Boolean'
        }
    ],
    'method': function (args, callback) {
        var forward = args[1].value;
        client.setUrl(args[0].value);
        client.setStep(config.methods[0].name);
        client.createSession(function (err) {
            client.produce(function (err) {
                console.log("producing...");
                var result = true;
                if (err)
                    result = false;
                else
                {
                    // After n seconds set product as finished
                    setTimeout(function () {
                        client.createSession(function (err) {
                            client.finished(function () {
                                console.log("aaaand finished");
                                client.stopSession();
                                
                                if (forward)
                                {
                                    console.log("to the next station");
                                }
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
//config.methods[1] = {
//    'name': 'hodor',
//    'duration': 10000,
//    'inputArguments': [
//        {
//            'name': 'times',
//            'description': 'Wie oft hodor',
//            'dataType': 'Int16'
//        }
//    ],
//    'outputArguments': [
//        {
//            'name': 'answer',
//            'description': 'hodorhodorhodor',
//            'dataType': 'String'
//        }
//    ],
//    'method': function (args) {
//        var nbBarks = args[0].value;
//        var retValue = "";
//        for (var i = 0; i < nbBarks; i++)
//        {
//            retValue += " hoder";
//        }
//        return retValue;
//    }
//};

module.exports = config;