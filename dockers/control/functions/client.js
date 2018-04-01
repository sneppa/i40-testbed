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

module.exports = client;