config = {};

config.discovery = {};
config.discovery.url = 'opc.tcp://localhost:4840'; // URL zum Discovery Server
config.discovery.enabled = true; // Discovery Server an/aus schalten

config.applicationUri = 'urn:SERVER_1';
config.productUri = 'SERVER_1';
config.productName = 'Testserver';

config.port = 4334; // Port des OPC UA Servers

config.methods = [];
config.methods[0] = {
    'name': 'bark',
    'inputArguments': [
        {
            'name': 'times',
            'description': 'Wie oft bellen',
            'dataType': 'Int16'
        }
    ],
    'outputArguments': [
        {
            'name': 'answer',
            'description': 'Bellen',
            'dataType': 'String'
        }
    ],
    'method': function (args) {
        var nbBarks = args[0].value;
        return nbBarks+' mal bellen';
    }
};
config.methods[1] = {
    'name': 'hodor',
    'duration': 10000,
    'inputArguments': [
        {
            'name': 'times',
            'description': 'Wie oft hodor',
            'dataType': 'Int16'
        }
    ],
    'outputArguments': [
        {
            'name': 'answer',
            'description': 'hodorhodorhodor',
            'dataType': 'String'
        }
    ],
    'method': function (args) {
        var nbBarks = args[0].value;
        var retValue = "";
        for (var i = 0; i < nbBarks; i++)
        {
            retValue += " hoder";
        }
        return retValue;
    }
};

module.exports = config;