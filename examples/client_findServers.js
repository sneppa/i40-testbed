'use strict';
var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();
var endpointUrl = "opc.tcp://localhost:4840";

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
        client.findServers(function (err, servers) {
            console.log(servers);
            callback(err);
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