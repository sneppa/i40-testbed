var opcua = require("node-opcua");
var config = require("../config");
var opcClient = new opcua.OPCUAClient();

var endpointUrl;
var session;

var client = {
    getServerList: function (callback) {
        ConnectToServer(config.discovery.url, function (opcClient, err) {
            if (err) {
                console.log('err: ' + err);
            } else {
                opcClient.findServers(function (err, servers) {
//                    console.log(servers);
                    opcClient.disconnect(function (err) {});
                    callback(err, servers);
                });
            }
        });
    },
    createSession: function (endpointUrl, callback) {
        ConnectToServer(endpointUrl, function (opcClient, err) {
            if (err) {
                console.log('err 1: ' + err);
            } else {
                CreateSession(opcClient, function (sess, err) {
                    if (err) {
                        console.log('err 2: ' + err);
                    } else {
                        callback(sess, err);
                    }
                });
            }
        });
    },
    getChildren: function (id, sess, callback) {
        sess.browse(id, function (err, result) {
            if (err === null && result.statusCode.name == "BadNodeIdUnknown")
            {
                result = null;
                err = "BadNodeIdUnknown";
            }
            callback(result, err);
        });
    },
    getValue: function (id, sess, callback) {
        //var id = "ns=1;s=Teile"; // String ID
        // id = ns=1;i=1001; // Integer ID
        sess.read({nodeId: id, attributeId: opcua.AttributeIds.Value}, 0, function (err, res) {
            callback(res, err);
        });
    },
    stopSession: function (sess) {
        sess.close(function (err) {
            opcClient.disconnect(function (err) {});
        });
    }
};


function ConnectToServer(endpointUrl, callback) {
    var opcClient = new opcua.OPCUAClient();
    opcClient.connect(endpointUrl, function (err) {
        if (err) {
            console.log(" cannot connect to endpoint :", endpointUrl);
        } else {
            console.log("Client connected to " + endpointUrl);
        }
        callback(opcClient, err);
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

module.exports = client;