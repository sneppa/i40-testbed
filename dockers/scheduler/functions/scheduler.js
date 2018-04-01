var async = require("async");
var ClientClass = require('./client');
var client = new ClientClass();
var opcua = require("node-opcua");

var machines = [];
var products = [];

var counter = 0;

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

        var foundServers = [];

        var discoveryClient = new ClientClass(config.discovery.url);
        discoveryClient.getServerList(function (err, servers) {
            counter++;
            console.log("Counter: "+counter + " (Servers: "+servers.length+")");

            async.forEachOf(servers, function (server, index, callback) { 
                var endpoint = server.discoveryUrls[0];

                //console.log(endpoint);
        
                if (scheduler.existsServer(endpoint)) // Server bereits in der Liste
                {
                    foundServers.push(endpoint);
                    callback(err);
                }
                else if (endpoint != config.discovery.url) // Neuer Server und nicht Discovery
                {
                    //var aCLient = new client;
                    var serverClient = new ClientClass(endpoint);
                    serverClient.createSession(function (err) {
                        if (err)
                        {
                            console.log("Can't conntect to "+serverClient.endpoint);
                            callback(err);
                        }
                        else
                        {
                            serverClient.getChildren("ns=1;s=Service", function (data, err) {
                                //console.log(data);
                                //console.log(err);
                                if (!err)
                                {
                                    //console.log("An Schedular übergeben (Machine)");
                                    scheduler.addMachine(serverClient, server, data, function () { 
                                        foundServers.push(endpoint);
                                        callback(); 
                                    });
                                }
                                else if (err == "BadNodeIdUnknown")
                                {
                                    serverClient.getChildren("ns=1;s=Product", function (data, err) {
                                        if (!err)
                                        {
                                            //console.log("An Schedular übergeben (Product)");
                                            scheduler.addProduct(serverClient, server, function () { 
                                                foundServers.push(endpoint);
                                                callback(); 
                                                // console.log("prod added"); 
                                            });
                                        }
                                        else
                                        {
                                            serverClient.stopSession();
                                            callback(err);
                                        }
                                    });
                                }
                                else
                                {
                                    serverClient.stopSession();
                                    callback(err);
                                }
                            });
        
        
                        }
                    });
                } 
                else
                {
                    callback(err);
                }
        
            }, function(err) {

                // console.log(foundServers);

                var newMachines = [];
                // Maschinen durchgehen, die noch verfügbar sind
                machines.forEach(function (item, index, array) {
                    // console.log(item.uri+ " (mach "+inArray(item.uri, foundServers)+" ) ");
                    if (inArray(item.uri, foundServers))
                        newMachines.push(item);
                });
                machines = newMachines;

                var newProducts = [];
                // Produkte durchgehen, die noch verfügbar sind
                products.forEach(function (item, index, array) {
                    // console.log(item.uri+ " (prod "+inArray(item.uri, foundServers)+" ) ");
                    if (inArray(item.uri, foundServers))
                        newProducts.push(item);
                });
                products = newProducts;

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
        var newProducts = [];
        
        async.forEachOf(products, function (product, index, callback) { 
            //console.log(product);

            if (product.new) // Produkt ist neu dazu gekommen, muss nicht gecrawled werden
            {
                product.new = false;
                newProducts.push(product);
                callback(); 
            }
            else if (product.status == "PRODUCED" && !config.ignoreProduced) // Produkt fertiggestellt, keine Änderungen mehr möglich
            {
                newProducts.push(product);
                callback();
            }
            else
            {
                var productClient = new ClientClass(product.uri);
                productClient.createSession(function (err) {
                    if (!err)
                    {
                        scheduler.addProduct(productClient, product.origin, function (product) {
                            product.new = false;
                            newProducts.push(product);
                            //products.splice(index,1); // Alter Eintrag löschen
                            callback(); 
                        });
                    }
                    else
                    {
                        newProducts.push(product);
                        callback(err);
                    }
                });
            }
        },
        function (err) {
            products = newProducts;
            callbackAsync(err);
        });
    },
    /**
     * Fügt ein neues Produkt hinzu (von getServers aufgerufen)
     */
    addProduct: function (client, server, finalCallback) {

        var product = {uri: server.discoveryUrls[0], origin: server, new: true};

        console.log("Add Product");

        var steps = [];

        async.series([
            function (callback) {
                client.getValue("ns=1;s=location", function (data, err) {
                    product.location = data.value.value;
                    callback(err);
                });
            },
            function (callback) {
                client.getValue("ns=1;s=status", function (data, err) {
                    product.status = data.value.value;
                    callback(err);
                });
            },
            function (callback) {
                client.getValue("ns=1;s=currentStep", function (data, err) {
                    //console.log(data);
                    product.currentStep = data.value.value;
                    callback(err);
                });
            },
            function (callback) {
                client.getChildren("ns=1;s=Step", function (data, err) {
                    //console.log(data);
                    //steps = data;
                    client.getSteps(data.references, function (err, data) {
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
            client.stopSession();
            finalCallback(product, err);
        });
    },
    /**
     * Fügt eine neue Maschine hinzu (von getServers aufgerufen)
     */
    addMachine: function (client, server, nodeData, finalCallback) {

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

        client.stopSession();
        finalCallback();
    },
    /**
     * Geht die Liste der bekannten Produkte durch und vergibt entsprechend den nächsten Server
     */
    scheduleProducts: function (callbackAsync) {
        //console.log(" - - - - - - - - ");
        //console.log(products);
        
        async.forEachOf(products, function (product, index, callback) { 
            //console.log(product);

            if (product.status == "FINISHED") // Nächsten Produktionsschritt setzen
            {
                console.log("Nächste Station setzen");
                var newStep = product.currentStep + 1;
                console.log(newStep+" < "+product.steps.length);
                var status = 'WAIT';    

                if (newStep == product.steps.length) // Keine weiterer Produktionsschritt -> PRODUCED
                {
                    status = 'PRODUCED';
                    newStep -= 1;
                }
                
                var productClient = new ClientClass(product.uri);
                productClient.createSession(function (err) {
                    productClient.setStatus(product.steps[newStep], status, function (err, result) {
                        console.log("Set "+product.uri+" to "+status+" ("+result+")");
                        productClient.stopSession();
                        callback();
                    });
                });

            }
            else if (product.status == "WAIT") // Station suchen
            {
                console.log("An nächste Station übergeben");

                var method =  product.steps[product.currentStep];

                var servers = scheduler.findServersWithMethod(method);
                scheduler.forwardToServer(servers, product, function (found) {
                    callback();
                });
            }
            else
            {
                callback();
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
        machines.forEach(function (server) {
            server.methods.forEach(function (method) {
                //console.log(method);
                if (method.name == methodName)
                {
                    server.method = method;
                    fittingServers.push(server);
                }
            });
        });
        return fittingServers;
    },
    /**
     * Leitet an den geeigneten Server weiter
     */
    forwardToServer: function (servers, product, callbackAsync) {

        var found = false;

        async.forEachOf(servers, function (machine, index, callback) {
            if (!found)
            {
                scheduler.getMachineStatus(machine, function (status) {
                    if (status == "WAIT")
                    {
                        //console.log("Connect with please "+machine.uri);
                        scheduler.commitProductToServer(machine, product, function () {
                            found = true;
                            callback();
                        });
                    }
                    else
                    {
                        console.log("Machine not available ("+machine.uri+")");
                        callback();
                    }
                })
            }
            else
                callback();
        },
        function () {
            console.log("found: "+found);
            callbackAsync(found);
        });

    },
    /**
     * Abfragen des Status eines Servers
     */
    getMachineStatus: function(server, callback) {
        var machineClient = new ClientClass(server.uri);
        machineClient.createSession(function (err) {
            machineClient.getValue("ns=1;s=Status", function (data, err) {
                callback(data.value.value);
                machineClient.stopSession();
            });
        });
    },
    /**
     * Abfragen des Status eines Servers
     */
    commitProductToServer: function(server, product, callback) {
        var productClient = new ClientClass(server.uri);
        productClient.commitProductToServer(server, product, function () {
            callback();
        });
    },
    /**
     * Gibt die aktuell bekannten Server aus
     */
    printServers: function () {
        console.log("- - - - - - - - - - - - - - - - - -");
        console.log("Known machines:");
        machines.forEach(function (machine) {
            var methods = "";
            machine.methods.forEach(function (method, index) { 
                if (index != 0)
                    methods += ", ";
                methods += method.name;
            })

            console.log("   - "+machine.uri+" ("+methods+")");
        })
        console.log("");
        console.log("Known products:");
        products.forEach(function (product) {
            console.log("   - "+product.uri+" ("+product.status+")");
        })
        console.log("");
        var client = new ClientClass();
        client.printSessionCounter();
        console.log("- - - - - - - - - - - - - - - - - -");
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

module.exports = scheduler;