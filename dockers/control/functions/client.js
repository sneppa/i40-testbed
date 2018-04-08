var opcua = require("node-opcua");
var config = require("../config");
var opcClient = new opcua.OPCUAClient();

var endpointUrl;
var session;

var client = {
    /**
     * Server suchen
     * @param {function} callback 
     */
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

    /**
     * Session erstellen
     * @param {function} callback 
     */
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

    /**
     * Beenden der Sitzung
     */
    stopSession: function () {
        session.close(function (err) {
            opcClient.disconnect(function (err) {});
        });
    }
};

/**
 * Verbindung zum Server herstellen
 * @param {opcUaClient} opcClient 
 * @param {EndpointUrl} endpointUrl 
 * @param {CallbackFunction} callback 
 */
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

/**
 * Erstellt einen Session mit dem Server
 * @param {opcUaClient} opcClient 
 * @param {CallbackFunction} callback 
 */
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