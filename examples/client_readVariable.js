'use strict';
var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();
var endpointUrl = "opc.tcp://localhost:30000";
var makeBrowsePath = opcua.makeBrowsePath;
var session;
var nodeId;

async.series([
    function (callback) {
        client.connect(endpointUrl, function (err) {
            if (err) {
                console.log(" cannot connect to endpoint :", endpointUrl);
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },
    function (callback) {
        client.createSession(function (err, sess) {
            if (!err) {
                session = sess;
            }
            callback(err);
        });
    },
    // Get Value
    function (callback) {
        var id = "ns=1;s=Teile"; // String ID
        // id = ns=1;i=1001; // Integer ID
        session.read({nodeId: id, attributeId: opcua.AttributeIds.Value}, 0, function (err, dataValue) {
            if (!err) {
                console.log("Wert: " + dataValue.value.value);
//                console.log(" Value = ", dataValue);
            }
            callback(err);
        });
    },
    function (callback) {
        session.close(function (err) {
            if (err) {
                console.log("session closed failed ?");
            }
            callback();
        });
    }
],
        function (err) {
            if (err) {
                console.log(" failure ", err);
            } else {
                console.log("done!");
            }
            client.disconnect(function () {});
        });