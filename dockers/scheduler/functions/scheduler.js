var async = require("async");
var opcClient = require('./client');

var machines = [];
var products = [];

var scheduler = {
    /**
     * Prüft ob ein Server mit der URN bereits bekannt ist.
     */
    existsServer: function (uri) {
        //console.log("Check if exists: "+uri);
        var found = false;
        machines.forEach(function (machine) {
            //console.log("check "+machine.uri+" == "+uri);
            if (machine.uri == uri)
                found = true;
        });
        products.forEach(function (product) {
            //console.log("check "+product.uri+" == "+uri);
            if (product.uri == uri)
                found =  true;
        });
        return found;
    },
    /**
     * Ruft alle Server vom Discovery Server ab und fügt sie zu Produkt oder Maschine hinzu
     */
    getServers: function (init, callbackAsync) {
        opcClient.getServerList(function (err, servers) { 
        
            async.forEachOf(servers, function (server, index, callback) { 
                var endpoint = server.discoveryUrls[0];
        
                if (endpoint != config.discovery.url && !scheduler.existsServer(endpoint))
                {
                    opcClient.createSession(endpoint, function (sess, err) {
                        if (err)
                        {
                            console.log("Can't conntect to "+endpoint);
                            callback(err);
                        }
                        else
                        {
                            opcClient.getChildren("ns=1;s=Service", sess, function (data, err) {
                                //console.log(data);
                                //console.log(err);
                                if (!err)
                                {
                                    console.log("An Schedular übergeben (Machine)");
                                    scheduler.addMachine(server, sess, data, function () { callback(); });
                                }
                                else if (err == "BadNodeIdUnknown")
                                {
                                    opcClient.getChildren("ns=1;s=Product", sess, function (data, err) {
                                        if (!err)
                                        {
                                            console.log("An Schedular übergeben (Product)");
                                            scheduler.addProduct(server, sess, function () { callback(); });
                                        }
                                        else
                                            callback(err);
                                    });
                                }
                                else
                                    callback(err);
                            });
        
        
                        }
                    });
                } 
                else
                    callback();
        
            }, function(err) {
                callbackAsync(err);
            });
        
        });
    },
    /**
     * Geht die Liste der bekannten Produkte durch und aktualisiert die Attribute
     */
    updateProducts: function (callbackAsync) {
        //console.log(" - - - - - - - - ");
        //console.log(products);
        
        async.forEachOf(products, function (product, index, callback) { 
            //console.log(product);

            if (product.status == "PRODUCED") // Produkt fertiggestellt, keine Änderungen mehr möglich
                callback();
            else
            {
                opcClient.createSession(product.uri, function (sess, err) {
                    if (!err)
                    {
                        scheduler.addProduct(product.origin, sess, function () {
                            products.splice(index,1); // Alter Eintrag löschen
                            callback(); 
                        });
                    }
                    else
                        callback(err);
                });
            }
        },
        function (err) {
            callbackAsync(err);
        });
    },
    /**
     * Fügt ein neues Produkt hinzu (von getServers aufgerufen)
     */
    addProduct: function (server, session, finalCallback) {

        var product = {uri: server.discoveryUrls[0], origin: server};

        console.log("Add Product");

        var steps = [];

        async.series([
            function (callback) {
                opcClient.getValue("ns=1;s=location", session, function (data, err) {
                    product.location = data.value.value;
                    callback(err);
                });
            },
            function (callback) {
                opcClient.getValue("ns=1;s=status", session, function (data, err) {
                    product.status = data.value.value;
                    callback(err);
                });
            },
            function (callback) {
                opcClient.getValue("ns=1;s=currentStep", session, function (data, err) {
                    //console.log(data);
                    product.currentStep = data.value.value;
                    callback(err);
                });
            },
            function (callback) {
                opcClient.getChildren("ns=1;s=Step", session, function (data, err) {
                    //console.log(data);
                    //steps = data;
                    getSteps(session, data.references, function (err, data) {
                        product.steps = data;
                        callback(err);
                    });
                });
            }
        ],
        function (err) {
            if (err) {
                console.log(" failure ", err);
            } else {
                console.log("done!");

                products.push(product);
            }
            opcClient.stopSession(session);
            finalCallback(err);
        });
    },
    /**
     * Fügt eine neue Maschine hinzu (von getServers aufgerufen)
     */
    addMachine: function (server, session, nodeData, finalCallback) {

        var machine = {uri: server.discoveryUrls[0], origin: server, methods: []};

        console.log("Add Machine");
        //console.log(nodeData);

        var methods = [];
        nodeData.references.forEach(function(node) {
            if (node.nodeClass.key == "Method")
                methods.push({name: node.displayName.text, origin: node});
        });

        machine.methods = methods;

        machines.push(machine);

        opcClient.stopSession(session);
        finalCallback();
    },
    /**
     * Geht die Liste der bekannten Produkte durch und vergibt entsprechend den nächsten Server
     */
    updateProducts: function (callbackAsync) {
        //console.log(" - - - - - - - - ");
        //console.log(products);
        
        async.forEachOf(products, function (product, index, callback) { 
            console.log(product);

            if (product.status == "FINISHED") // Nächsten Produktionsschritt setzen
            {
                console.log("Nächste Station setzen");

            }

            if (product.status == "WAIT") // Station suchen
            {
                console.log("An nächste Station übergeben");

                var method =  product.steps[product.currentStep];

                var servers = scheduler.findServersWithMethod(method);

                console.log("method: "+method);
                console.log(servers);
            }
        },
        function (err) {
            callbackAsync(err);
        });
    },
    /**
     * Findet die passenden Server für eine Methode
     */
    findServersWithMethod: function(methodName) {
        var fittingServers = [];
        servers.forEach(function (server) {
            server.methods.forEach(function (method) {
                if (method.name = methodName)
                fittingServers.push(server);
            });
        });
        return fittingServers;
    },
    /**
     * Gibt die aktuell bekannten Server aus
     */
    printServers: function () {
        console.log(machines);
        console.log(products);
    }
};

/**
 * Übeprüft ob needle in haystack ist
 */
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

/**
 * Ruft die Produktionsstufen aus dem Addressraum ab (aufgerufen von getServers)
 * 
 * @param {OpcUaSession} sess 
 * @param {NodeData} data 
 * @param {callback} callbackFinal 
 */
function getSteps(sess, data, callbackFinal)
{
    var result = [];

    async.forEachOf(data, (value, key, callback) => {
        //console.log(value);
        var name = value.displayName.text;
        //console.log("name: "+name);

        if (name.substr(0,5) == "step-")
        {
            opcClient.getValue(value.nodeId, sess, function (data, err) {
                result[name.substr(5)] = data.value.value;
                //console.log(name+":"+data.value.value);
                callback(err);
            });

        }
        else
            callback();
    }, err => {
        if (err) console.error(err.message);
        // configs is now a map of JSON data
        callbackFinal(err, result);
    });
}

module.exports = scheduler;