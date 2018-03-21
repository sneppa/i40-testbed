var opcua = require("node-opcua");
var async = require("async");
var OPCUADiscoveryServer = require("node-opcua-server-discovery").OPCUADiscoveryServer;
var OPCUAServer = opcua.OPCUAServer;
var OPCUAClient = opcua.OPCUAClient;

var discovery_server, discovery_server_endpointUrl;

discovery_server = new OPCUADiscoveryServer({port: 4840});
discovery_server_endpointUrl = discovery_server._get_endpoints()[0].endpointUrl;
discovery_server.start(function () {
    console.log("Discovery Server is now listening ... ( press CTRL+C to stop)");
});

console.log(discovery_server_endpointUrl);