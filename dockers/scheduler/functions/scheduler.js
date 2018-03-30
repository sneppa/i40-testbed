var async = require("async");

var opcClient = null;

var machines = [];
var products = [];

var scheduler = {
    setOpcClient: function (client) {
        opcClient = client;
    },
    existsServer: function (uri) {
        machines.forEach(function (machine) {
            if (machine.uri == uri)
            return true;
        });
        products.forEach(function (product) {
            if (product.uri == uri)
            return true;
        });
        return false;
    },
    addProduct: function (server, session, nodeData, finalCallback) {

        var product = {uri: server.discoveryUrls[0], origin: server};

        console.log("Add Product");
        //nodeData.references.forEach(function (item) {
            //console.log(item.nodeId.text);
            //if (inArray(item.displayName.text, productRequiredFields))
            //{
            //    opcClient.getValue(item.nodeId, sess, function (data, err) {
            //        product.attributes.push({name: item.displayName.text, value: data.value.value});
            //    });
            //}
        //});

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
    printServers: function () {
        console.log(machines);
        console.log(products);
    }
};

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

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