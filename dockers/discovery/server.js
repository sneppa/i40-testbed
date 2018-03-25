var opcua = require("node-opcua");
var async = require("async");
var OPCUADiscoveryServer = require("node-opcua-server-discovery").OPCUADiscoveryServer;
var OPCUAServer = opcua.OPCUAServer;
var OPCUAClient = opcua.OPCUAClient;
var os = require('os');

var discovery_server, discovery_server_endpointUrl;

discovery_server = new OPCUADiscoveryServer({port: 4840, buildInfo: { productName: 'DiscoveryServer' }});

discovery_server.serverInfo.applicationName = {text: "DiscoveryServer", locale: null};
discovery_server.serverInfo.applicationUri = 'urn:DiscoveryServer';
discovery_server.serverInfo.productUri = 'DiscoveryServer'; 

//console.log(os.networkInterfaces());

// Workaround to set the correct Hostname for the Endpoints for Docker
discovery_server.endpoints[0]._endpoints.forEach(function (item) {
//    console.log(item.endpointUrl);
    item.endpointUrl = item.endpointUrl.replace(os.hostname().toUpperCase(),"localhost");
//    console.log("to: "+item.endpointUrl);
});

discovery_server_endpointUrl = discovery_server._get_endpoints()[0].endpointUrl;
discovery_server.start(function () {
    console.log("Discovery Server is now listening ... ( press CTRL+C to stop)");
});

console.log(discovery_server_endpointUrl);