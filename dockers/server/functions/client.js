var opcua = require("node-opcua");
var options = {
    securityMode: "NONE",
    securityPolicy: "None"
};
var opcClient = new opcua.OPCUAClient(options);

var client = {
    // setUrl: function (urlToProduct) {
    //     endpointUrl = urlToProduct;
    // },
    setStep: function (currentStepName) {
        step = currentStepName;
    },
//    setStatus: function (currentStatus) {
//        status = currentStatus;
//    },
    /**
     * Produkt muss warten
     */
    wait: function (session, callback) {
        callStatusMethod(session, step, "WAIT", callback);
    },
    /**
     * Produkt wird verarbeitet
     */
    produce: function (session, callback) {
        callStatusMethod(session, step, "PRODUCE", callback);
    },
    /**
     * Produkt wurde fertig verarbeitet
     */
    finished: function (session, callback) {
        callStatusMethod(session, step, "FINISHED", callback);
    },
    /**
     * Zum nächsten Produktionsschritt senden
     */
    next: function () {
//        callStatusMethod(step, "FINISHED", callback);
    },
    createSession: function (endpoint, callback) {
        ConnectToServer(endpoint, function (err) {
            if (err) {
                console.log('err: ' + err);
            } else {
                CreateSession(function (session, err) {
                    if (err) {
                        console.log('err: ' + err);
                    } else {
                        callback(session, err);
                    }
                });
            }
        });
    },
    stopSession: function (session) {
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
            //session = sess;
        }
        callback(sess, err);
    });
}
function callStatusMethod (session, step, status, callback) {
    
    console.log("Call Method setStatus with ["+step+","+status+"]");
    
    var methodToCall = {
        objectId: "ns=1;s=Product", // nodeId des Ordners oder Objekts
        methodId: "ns=1;s=setStatus", // nodeId der Methode
        inputArguments: [{dataType: opcua.DataType.String, value: step}, {dataType: opcua.DataType.String, value: status}]
    };

    session.call(methodToCall, function (err, results) {
        console.log("Called Method setSatus");
        console.log(err);
        console.log(results);
        // var callSuccess = results.outputArguments[0].value[0];
        // console.log("Returned: " + callSuccess);
        
        // if (!callSuccess)
        //     err = {msg:"Not Allowed"}; // Durch normale OPC UA Error ersetzen
        
        callback(err);
    });
}


module.exports = client;