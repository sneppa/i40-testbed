var opcua = require("node-opcua");
var async = require("async");
var options = { connectionStrategy: {maxRetry: 2, initialDelay: 100, maxDelay: 200}};

// var endpointUrl;
// var session;

var sessionsOpened = 0;
var sessionsClosed = 0;

var client = function Client(endpoint) {

    this.endpoint = endpoint;
    this.session = null;
    this.opcClient = new opcua.OPCUAClient();
    // constructor(endpoint) {
    //     this.endpoint = endpoint;
    //     this.session = "asd";
    // }

    this.getServerList = function(callback)  {

        // console.log("Endpoint: asddas asd "+this.endpoint);
        // console.log("Endpoint: asddas asd "+endpoint);
        // console.log(this.opcClient);

        ConnectToServer(this.opcClient, endpoint, function (err) {

            if (err) {
                console.log('err: ' + err);
            } else {
                // console.log(this.opcClient);
                // console.log(opcClient);
                this.opcClient.findServers(function (err, servers) {
//                    console.log(servers);
                        this.opcClient.disconnect(function (err) { 
                        // console.log("Disconnected from Discover Server"); 
                    }.bind(this));
                    callback(err, servers);
                }.bind(this));
            }
        }.bind(this));
    }

    this.createSession = function(callback) {
        ConnectToServer(this.opcClient, this.endpoint, function (err) {
            if (err) {
                console.log('err 1: ' + err);
                callback(null, err);
            } else {
                CreateSession(this.opcClient, function (sess, err) {
                    if (err) {
                        console.log('err 2: ' + err);
                    } else {
                        this.session = sess;
                        callback(err);
                    }
                }.bind(this));
            }
        }.bind(this));
    }

    this.getChildren = function(id, callback) {
        this.session.browse(id, function (err, result) {
            if (err === null && result.statusCode.name == "BadNodeIdUnknown")
            {
                result = null;
                err = "BadNodeIdUnknown";
            }
            callback(result, err);
        }.bind(this));
    }
    
    this.getValue = function(id, callback) {
        //var id = "ns=1;s=Teile"; // String ID
        // id = ns=1;i=1001; // Integer ID
        this.session.read({nodeId: id, attributeId: opcua.AttributeIds.Value}, 0, function (err, res) {
            callback(res, err);
        }.bind(this));
    }
    
    this.setStatus = function(step, status, location, callback) {
    
        console.log("Call Method setStatus with ["+step+","+status+"]");
        
        var methodToCall = {
            objectId: "ns=1;s=Product", // nodeId des Ordners oder Objekts
            methodId: "ns=1;s=setStatus", // nodeId der Methode
            inputArguments: [{dataType: opcua.DataType.String, value: step}, 
                             {dataType: opcua.DataType.String, value: status}, 
                             {dataType: opcua.DataType.String, value: location}]
        };
    
        this.session.call(methodToCall, function (err, results) {
            // console.log("Called Method setSatus");
            // console.log(err);
            // console.log(results);
            var callSuccess = results.outputArguments[0].value[0];
            console.log("Returned: " + callSuccess);
            
            if (!callSuccess)
                err = {msg:"Not Allowed"}; // Durch normale OPC UA Error ersetzen
            
            callback(err);
        }.bind(this));
    }

    this.commitProductToServer = function(server, product, callback) {
        this.createSession(function (err) {
            console.log('Call Method '+server.method.name);
            //console.log(server.method.origin.nodeId.toString());
            var methodToCall = {
                objectId: "ns=1;s=Service", // nodeId des Ordners oder Objekts
                methodId: server.method.origin.nodeId.toString(), // nodeId der Methode
                inputArguments: [{dataType: opcua.DataType.String, value: product.uri}]
            };
    
            this.session.call(methodToCall, function (err, results) {
                console.log('Called Method '+server.method.name+' (Result: '+(!err ? 'good' : 'bad')+')');
                this.stopSession();
                callback();
            }.bind(this));
        }.bind(this));
    }

    /**
     * Ruft die Produktionsstufen aus dem Addressraum ab (aufgerufen von getServers)
     * 
     * @param {NodeData} data 
     * @param {callback} callbackFinal 
     */
    this.getSteps = function(data, callbackFinal)
    {
        var result = [];
    
        async.forEachOf(data, (value, key, callback) => {
            //console.log(value);
            var name = value.displayName.text;
            //console.log("name: "+name);
    
            if (name.substr(0,5) == "step-")
            {
                this.getValue(value.nodeId, function (data, err) {
                    result[name.substr(5)] = data.value.value;
                    //console.log(name+":"+data.value.value);
                    callback(err);
                }.bind(this));
    
            }
            else
                callback();
        }, err => {
            if (err) console.error(err.message);
            // configs is now a map of JSON data
            callbackFinal(err, result);
        });
    }

    this.stopSession = function() {
            console.log("Close Client Session ("+this.session.endpoint.endpointUrl+")");
            sessionsClosed++;
            this.session.close(function (err) {
            this.opcClient.disconnect(function (err) { }.bind(this));
        }.bind(this));
    }

    this.printSessionCounter = function () {
        console.log("Sessions opened: "+sessionsOpened);
        console.log("Sessions closed: "+sessionsClosed);
    }
};


function ConnectToServer(opcClient, endpointUrl, callback) {
    opcClient.connect(endpointUrl, function (err) {
        if (err) {
            console.log(" cannot connect to endpoint :", endpointUrl);
        } else {
            //console.log(("Client connected to " + endpointUrl).red);
        }
        callback(err);
    });
}
function CreateSession(opcClient, callback) {
    opcClient.createSession(function (err, sess) {
        if (!err)
        {
            console.log("Established Client Session ("+sess.endpoint.endpointUrl+")");
            sessionsOpened++;
        }
        callback(sess, err);
    });
}

module.exports = client;