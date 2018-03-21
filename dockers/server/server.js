var config = require('./config');
var opcua = require("node-opcua");

var server = new opcua.OPCUAServer({
    port: config.port // the port of the listening socket of the server
});

function post_initialize() {

    var addressSpace = server.engine.addressSpace;

    var myDevice = addressSpace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Service"
    });

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

            var output = method.method(inputArguments);
            
            console.log(context + " generated: " + output);

            var callMethodResult = {
                statusCode: opcua.StatusCodes.Good,
                outputArguments: [{
                        dataType: opcua.DataType.String,
                        arrayType: opcua.VariantArrayType.Array,
                        value: [output]
                    }]
            };
            sleep(method.duration).then(() => {callback(null, callMethodResult);});
        });
    });
}

server.initialize(post_initialize);

server.start(function () {
    console.log("Server is now listening ... ( press CTRL+C to stop)");
});

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
    }
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}