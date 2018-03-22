'use strict';
var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();
var endpointUrl = "opc.tcp://PIQUADRAT:30000";
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
    // call Method
    function (callback) {
        var methodToCall = {
            objectId: "ns=1;s=Product", // nodeId des Ordners oder Objekts
            methodId: "ns=1;s=setStatus", // nodeId der Methode
            inputArguments: [{dataType: opcua.DataType.String, value: "Zuschneiden"}, {dataType: opcua.DataType.String, value: "WAIT"}]
        };

        session.call(methodToCall, function (err, results) {
            console.log("Returned: " + results.outputArguments[0].value[0]);
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