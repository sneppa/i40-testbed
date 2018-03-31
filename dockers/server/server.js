var config = require('./config');
var client = require('./functions/client');
var args = require('./functions/command_args');
var opcua = require("node-opcua");

// Parameter aus Commando Zeile abfragen
args.init(process.argv);
config = args.setConfigs(config);

var server = new opcua.OPCUAServer({
    port: config.port, // the port of the listening socket of the server
    buildInfo: { productName: config.productName }
});
server.serverInfo.applicationUri = config.applicationUri;
server.serverInfo.productUri = config.productUri; 
//server.serverInfo.discoveryUrls = ["empty"];

var status = 'WAIT';

function post_initialize() {

    var addressSpace = server.engine.addressSpace;

    // Server Addressraum mit einem Service Object bestücken
    var myDevice = addressSpace.addObject({
        nodeId: "ns=1;s=Service",
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Service"
    });

    // Status Variable in Addressraum setzen
    server.nodeVariable1 = addressSpace.addVariable({
        componentOf: myDevice,
        nodeId: "ns=1;s=Status",
        browseName: "Status",
        dataType: "String",
        value: {
            get: function () {
                return new opcua.Variant({dataType: opcua.DataType.String, value: status});
            }
        }
    });

    // Methoden aus der Konfiguration holen (erste Methode wird über Parameter gesetzt)
    config.methods.forEach(function (method) {

        console.log("Init Method: " + method.name);

        var inputArguments = [];
        method.inputArguments.forEach(function (arg) {
            inputArguments.push({'name': arg.name, description: {text: arg.description}, dataType: toEnum(arg.dataType)});
        });

        var outputArguments = [];
        method.outputArguments.forEach(function (arg) {
            outputArguments.push({'name': arg.name, description: {text: arg.description}, dataType: toEnum(arg.dataType), valueRank: 1});
        });

        addressSpace.addMethod(myDevice, {
            browseName: method.name,
            inputArguments: inputArguments,
            outputArguments: outputArguments
        }).bindMethod(function (inputArguments, context, callback) {

            method.method(inputArguments, status, function (err, dataType, output) {
            
                console.log("Output generated: " + output);
//
                var callMethodResult = {
                    statusCode: opcua.StatusCodes.Good,
                    outputArguments: [{
                            dataType: toEnum(dataType),
                            arrayType: opcua.VariantArrayType.Array,
                            value: [output]
                        }]
                };
                
                console.log(callMethodResult);
                
                callback(null, callMethodResult);
            });
        });
    });
}

server.initialize(post_initialize);

if (config.discovery.enabled)
{
    server.registerServer(config.discovery.url, function () {
        console.log("Registered Server ("+server._get_endpoints()[0].endpointUrl+") to "+config.discovery.url);
    });
}

server.start(function () {
    console.log("Server is now listening ... ( press CTRL+C to stop)");
    console.log(server._get_endpoints()[0].endpointUrl);
});

process.on('EXIT', function () { console.log("EXIT"); shutDown(); });
process.on('SIGINT', function () { console.log("SIGINT"); shutDown(); });
process.on('SIGTERM', function () { console.log("SIGTERM"); shutDown(); });
//process.on('SIGKILL', shutDown);

function shutDown()
{
    if (config.discovery.enabled)
    {
        server.unregisterServer(config.discovery.url, function () {
            console.log("Unregistered Server ("+server._get_endpoints()[0].endpointUrl+") from "+config.discovery.url);
            server.shutdown(function () { console.log("Server herunterfahren"); });
        });
    }
    else
    {
        server.shutdown(function () { console.log("Server herunterfahren"); });
    }
}

/**
 * Konvertiert Datentyp String zu Enum
 * @param {type} text
 * @returns {opcua.DataType}
 */
function toEnum(text)
{
    switch (text.toUpperCase()) {
        case "STRING":
            return opcua.DataType.String;
            break;
        case "FLOAT":
            return opcua.DataType.Float;
            break;
        case "INT16":
            return opcua.DataType.Int16;
            break;
        case "INT32":
            return opcua.DataType.Int32;
            break;
        case "BOOLEAN":
            return opcua.DataType.Boolean;
            break;
    }
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}