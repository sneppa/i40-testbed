var opcua = require("node-opcua");
var config = require("../config");
var opcClient = new opcua.OPCUAClient();

var endpointUrl;
var session;

var client = {
    findServers: function (callback) {
        ConnectToServer(config.discovery.url, function (err) {
            if (err) {
                console.log('err: ' + err);
            } else {
                opcClient.findServers(function (err, servers) {
//                    console.log(servers);
                    callback(err, servers);
                    opcClient.disconnect(function (err) {});
                });
            }
        });
    },
    createSession: function (callback) {
        ConnectToServer(endpointUrl, function (err) {
            if (err) {
                console.log('err: ' + err);
            } else {
                CreateSession(function (err) {
                    if (err) {
                        console.log('err: ' + err);
                    } else {
                        callback(err);
                    }
                });
            }
        });
    },
    stopSession: function () {
        session.close(function (err) {
            opcClient.disconnect(function (err) {});
        });
    }
};


function ConnectToServer(endpointUrl, callback) {
    opcClient.connect(endpointUrl, function (err) {
        if (err) {
            console.log(" cannot connect to endpoint :", endpointUrl);
        } else {
            console.log("Client connected to " + endpointUrl);
        }
        callback(err);
    });
}
function CreateSession(callback) {
    opcClient.createSession(function (err, sess) {
        if (err)
        {

        } else {
            console.log("Established Client Session");
            session = sess;
        }
        callback(err);
    });
}
//function callStatusMethod (step, status, callback) {
//    
//    console.log("Call Method setStatus with ["+step+","+status+"]");
//    
//    var methodToCall = {
//        objectId: "ns=1;s=Product", // nodeId des Ordners oder Objekts
//        methodId: "ns=1;s=setStatus", // nodeId der Methode
//        inputArguments: [{dataType: opcua.DataType.String, value: step}, {dataType: opcua.DataType.String, value: status}]
//    };
//
//    session.call(methodToCall, function (err, results) {
//        var callSuccess = results.outputArguments[0].value[0];
//        console.log("Returned: " + callSuccess);
//        
//        if (!callSuccess)
//            err = {msg:"Not Allowed"}; // Durch normale OPC UA Error ersetzen
//        
//        callback(err);
//    });
//}


module.exports = client;