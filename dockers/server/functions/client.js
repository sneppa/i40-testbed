var opcua = require("node-opcua");
var options = {
    securityMode: "NONE",
    securityPolicy: "None"
};

var client = function Client(endpoint) {

    this.opcClient = new opcua.OPCUAClient(options);
    this.endpoint = endpoint;
    this.session = null;
    this.step = null;
    
    /**
     * Setzen der aktuellen Produktionsstufe
     * @param {String} currentStepName 
     */
    this.setStep = function (currentStepName) {
        this.step = currentStepName;
    }

    /**
     * Produkt muss warten
     * @param {function} callback 
     */
    this.wait = function (callback) {
        callStatusMethod(this.session, this.step, "WAIT", callback);
    }

    /**
     * Produkt wird verarbeitet
     * @param {function} callback 
     */
    this.produce = function (callback) {
        callStatusMethod(this.session, this.step, "PRODUCE", callback);
    }

    /**
     * Produkt wurde fertig verarbeitet
     * @param {function} callback 
     */
    this.finished = function (callback) {
        callStatusMethod(this.session, this.step, "FINISHED", callback);
    }

    /**
     * Session erstellen
     * @param {function} callback 
     */
    this.createSession = function (callback) {
        ConnectToServer(this.opcClient, this.endpoint, function (err) {
            if (err) {
                console.log('err: ' + err);
            } else {
                CreateSession(this.opcClient, function (session, err) {
                    if (err) {
                        console.log('err: ' + err);
                    } else {
                        this.session = session;
                        callback(err);
                    }
                }.bind(this));
            }
        }.bind(this));
    }

    /**
     * Beenden der Sitzung
     */
    this.stopSession = function () {
        this.session.close(function (err) {
            this.opcClient.disconnect(function (err) { }.bind(this));
        }.bind(this));
    }
};


function ConnectToServer(opcClient, endpointUrl, callback) {
    opcClient.connect(endpointUrl, function (err) {
        if (err) {
            console.log(" cannot connect to endpoint :", endpointUrl);
        } else {
            console.log("Client connected to "+endpointUrl);
        }
        callback(err);
    });
}
function CreateSession(opcClient, callback) {
    opcClient.createSession(function (err, sess) {
        if (err)
        {

        } else {
            console.log("Established Client Session");
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
        
        var callSuccess = false;
        if (!err)
            callSuccess = results.outputArguments[0].value[0];
        if (!callSuccess)
            err = {msg:"Not Allowed"};
        
        callback(err);
    });
}


module.exports = client;