var opcua = require("node-opcua");
var opcClient = new opcua.OPCUAClient();

var endpointUrl;
var step;
var status;
var session;

var client = {
    setUrl: function (urlToProduct) {
        endpointUrl = urlToProduct;
    },
    setStep: function (currentStepName) {
        step = currentStepName;
    },
//    setStatus: function (currentStatus) {
//        status = currentStatus;
//    },
    /**
     * Produkt muss warten
     */
    wait: function (callback) {
        callStatusMethod(step, "WAIT", callback);
    },
    /**
     * Produkt wird verarbeitet
     */
    produce: function (callback) {
        callStatusMethod(step, "PRODUCE", callback);
    },
    /**
     * Produkt wurde fertig verarbeitet
     */
    finished: function (callback) {
        callStatusMethod(step, "FINISHED", callback);
    },
    /**
     * Zum nächsten Produktionsschritt senden
     */
    next: function () {
//        callStatusMethod(step, "FINISHED", callback);
    },
    createSession: function (callback) {
        ConnectToServer(function (err) {
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


function ConnectToServer(callback) {
    opcClient.connect(endpointUrl, function (err) {
        if (err) {
            console.log(" cannot connect to endpoint :", endpointUrl);
        } else {
            console.log("Client connected to "+endpointUrl);
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
function callStatusMethod (step, status, callback) {
    
    console.log("Call Method setStatus with ["+step+","+status+"]");
    
    var methodToCall = {
        objectId: "ns=1;s=Product", // nodeId des Ordners oder Objekts
        methodId: "ns=1;s=setStatus", // nodeId der Methode
        inputArguments: [{dataType: opcua.DataType.String, value: step}, {dataType: opcua.DataType.String, value: status}]
    };

    session.call(methodToCall, function (err, results) {
        var callSuccess = results.outputArguments[0].value[0];
        console.log("Returned: " + callSuccess);
        
        if (!callSuccess)
            err = {msg:"Not Allowed"}; // Durch normale OPC UA Error ersetzen
        
        callback(err);
    });
}


module.exports = client;