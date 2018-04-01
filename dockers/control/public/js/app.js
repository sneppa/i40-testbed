//define a global application
var app = angular.module('App', ['ngRoute']);
var repositoryUrl = "";

//create an app router for url management and redirect
app.config(function ($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'tpl/dashboard.html',
        controller: 'dashboard',
    }).when('/server', {
        templateUrl: 'tpl/server/overview.html',
        controller: 'server',
    }).when('/server/add', {
        templateUrl: 'tpl/server/add.html',
        controller: 'serverAdd',
    }).when('/products', {
        templateUrl: 'tpl/products/overview.html',
        controller: 'products',
    }).when('/products/produce', {
        templateUrl: 'tpl/products/produce.html',
        controller: 'products',
    }).when('/products/add', {
        templateUrl: 'tpl/products/add.html',
        controller: 'products',
    }).when('/products/manage', {
        templateUrl: 'tpl/products/manage.html',
        controller: 'products',
    }).when('/network', {
        templateUrl: 'tpl/network/list.html',
        controller: 'network'
    }).when('/network/diagram', {
        templateUrl: 'tpl/network/diagram.html',
        controller: 'networkdiagram',
    }).when('/help', {
        templateUrl: 'tpl/help.html',
    }).when('/log', {
        templateUrl: 'tpl/log.html',
        controller: 'log',
    });
    $routeProvider.otherwise({redirectTo: '/dashboard'});
});

app.controller('nav', function ($scope) {
//    $scope.title = "Dashboard";
});

app.controller('dashboard', function ($scope) {
//    $scope.nav.title = "Dashboard";
});

app.controller('server', function ($scope, $http, $timeout) {
    $scope.servers = [];

    var timer = null;
    var reloader = function () {
        
        if (timer !== null)
        $timeout.cancel(timer);
//        $route.reload();
        $http.get('api/server').then(
                function (res) {
                    $scope.servers = res.data;
                },
                function (err) {
                    showError("Konnte Server nicht lesen!");
                    console.log(err);
                });
                
        timer = $timeout(reloader, 5000);
    }
    
    reloader();
    
    $scope.$on("$destroy", function() {
        if (timer) {
            $timeout.cancel(timer);
        }
    });
    
    $scope.deleteServer = function (idserver) {
        $http.delete('/api/server/' + idserver).then(
                function (res) {
                    $scope.servers.forEach(function (item, index, object) {
                        if (item._id == server._id)
                            object.splice(index, 1);
                    })
                    showSuccess("Server gelöscht!");
                },
                function () {
                    showStandardError();
                });
    };
    
    // Server starten
    $scope.startServer = function (server) {
        $http.post('/api/server/start/' + server._id, server).then(
                function (res) {
                    //console.log(res.data);
                    //server = res.data;
                    $scope.servers.forEach(function (item, index, object) {
                        if (item._id == server._id)
                        object[index] = res.data;
                    })
                    showSuccess("Server gestartet!");
                },
                function () {
                    showStandardError();
                });
    };
    
    // Server stoppen
    $scope.stopServer = function (server) {
        $http.post('/api/server/stop/' + server._id, server).then(
                function (res) {
                    $scope.servers.forEach(function (item, index, object) {
                        if (item._id == server._id)
                        object[index] = res.data;
                    })
                    showSuccess("Server gestoppt!");
                },
                function () {
                    showStandardError();
                });
    };
});

app.controller('serverAdd', function ($scope, $http, $location) {
//    $scope.nav.title = "Server";
    $scope.server = {paused: true};

    $scope.saveForm = function () {
        console.log($scope.server);

        $http.post('/api/server', $scope.server).then(
                function () {
                    showSuccess("Server \"" + $scope.server.name + "\" gespeichert!");
                    $location.path("/server");
                },
                function () {
                    showStandardError();
                });
    }
});

app.controller('products', function ($scope, $http) {
//    $scope.nav.title = "Produkte"; 
});

app.controller('network', function ($scope, $http, $timeout, $location) {
    $scope.servers = {servers: [], products: []};
    
    loadRepoUrl($http, $scope, function ($http, $scope) {
        $scope.repository = repositoryUrl;
    });
    
    $scope.control = 'http://'+$location.host()+":"+$location.port();

    var timer = null;
    var reloader = function () {
        
        if (timer !== null)
        $timeout.cancel(timer);
    
        $http.get('/api/network/server').then(
                function (res) {
//                    console.log(res);
                    $scope.servers = {servers: [], products: []};
                    
                    res.data.forEach(function (item) {
                        if (item.productUri.substr(0,8) == "PRODUCT_")
                            $scope.servers.products.push(item);
                        else
                            $scope.servers.servers.push(item);
                    })
                },
                function (err) {
                    showError("Konnte Server nicht lesen!");
                    console.log(err);
                });
                
        timer = $timeout(reloader, 5000);
    }
    
    reloader();
    
    $scope.$on("$destroy", function() {
        if (timer) {
            $timeout.cancel(timer);
        }
    });
});

app.controller('networkdiagram', function ($scope, $http, $timeout, $location) {
    
    var timer = null;
    var reloader = function () {
        
        if (timer !== null)
        $timeout.cancel(timer);
    
        $http.get('/api/network/server').then(
                function (res) {
//                    console.log(res);
                    $scope.servers = {servers: [], products: []};
                    
                    var rawNodes = [{id: 'repo', label: 'Repository', group: 0, font: {face: 'Roboto'}}, 
                                    {id: 'control', label: 'Control'+":"+$location.port(), group: 2, font: {face: 'Roboto'}}];
                    var rawEdges = [{from: 'repo', to: 'DiscoveryServer'}, {from: 'repo', to: 'control'}];
                    
                    res.data.forEach(function (item) {
                        var port = getPortFromURL(item.discoveryUrls[0][0]);
                        var node = {id: item.productUri, label: item.applicationName.text+':'+port, shape: 'box', font: {face: 'Roboto'}};
                        
                        
                        if (item.productUri.substr(0,8) == "PRODUCT_")
                        {
                            rawEdges.push({from: item.productUri, to: 'repo'});
                            node.group = 0;
                        }
                        else if (item.productUri != 'DiscoveryServer')
                        {
                            rawEdges.push({from: item.productUri, to: 'DiscoveryServer', length: 200});
                            node.group = 1;
                        }
                        else if (item.productUri == 'DiscoveryServer')
                        {
                            node.group = 3;
//                            node.color = '#FFFFFF';
//                            node.shape = 'icon';
//                            node.icon = {
//                              face: 'Pe-icon-7-stroke',
//                              code: "\e617",
//                              size: 50,
//                              color: '#f0a30a',
//                              style: 'normal',
//                              weight: 'normal',
//                              variant: 'normal'
//                            };
                        }
                        
                        rawNodes.push(node);
                    })

                    // create a network
                    var container = document.getElementById('mynetwork');
                    var data = {
                        nodes: new vis.DataSet(rawNodes),
                        edges: new vis.DataSet(rawEdges)
                    };
                    var rand = 0.6120323969355027; //Math.random();
//                    console.log(rand);
                    
                    var options = {layout:{randomSeed:rand}};
                    var network = new vis.Network(container, data, options);
                },
                function (err) {
                    showError("Konnte Server nicht lesen!");
                    console.log(err);
                });
                
//        timer = $timeout(reloader, 5000);
    }
    
    reloader();
    
    $scope.$on("$destroy", function() {
        if (timer) {
            $timeout.cancel(timer);
        }
    });
});

// ------------------------------- Products

// Produkt Übersicht
app.controller('ProductOverview', function ($scope, $http, $timeout, $route) {

    $scope.products = [];

    var timer = null;
    var reloader = function () {
        
        if (timer !== null)
        $timeout.cancel(timer);
//        $route.reload();
        $http.get(repositoryUrl + '/product').then(
                function (res) {
                    $scope.products = res.data;
                },
                function (err) {
                    showError("Konnte Produkte nicht in Repository lesen!");
                    console.log(err);
                });
                
        timer = $timeout(reloader, 3000);
    }
    
    $scope.$on("$destroy", function() {
        if (timer) {
            $timeout.cancel(timer);
        }
    });

    // Gespeicherten Typen aus DB holen
    loadRepoUrl($http, $scope, function ($http, $scope) {
//        showInfo("Lade Produkte von " + repositoryUrl + '/product');
        reloader();
    });

    // Löschen Funktion
    $scope.deleteProduct = function (id) {

        loadRepoUrl($http, $scope, function ($http, $scope) {
//            showInfo("Delete: " + repositoryUrl + '/product/' + id);

            $http.delete(repositoryUrl + '/product/' + id).then(
                    function (res) {
                        $scope.products.forEach(function (item, index, object) {
                            if (item._id == id)
                                object.splice(index, 1);
                        })
                        showSuccess("Produkt gelöscht!");
                    },
                    function () {
                        showStandardError();
                    });
        });

    };

    // Reset Funktion
    $scope.resetProduct = function (product) {

        loadRepoUrl($http, $scope, function ($http, $scope) {
            product.status = "INIT";
            product.location = null;
            product.currentStep = 0;
            
            $http.post(repositoryUrl + '/product/' + product._id, product).then(
            function (res) {
                showWarning("Produkt zurückgesetzt!");
            },
            function () {
                showStandardError();
            });
        });

    };

    // Reset Funktion
    $scope.startProduct = function (product) {

        loadRepoUrl($http, $scope, function ($http, $scope) {
            product.status = "WAIT";
            //product.currentStep = 1;
            
            $http.post(repositoryUrl + '/product/' + product._id, product).then(
            function (res) {
                showSuccess("Produktion gestartet!");
            },
            function () {
                showStandardError();
            });
        });

    };
});

// Produkt produzieren lassen / erstellen
app.controller('ProductProduce', function ($scope, $http, $location) {

    var product = {"name": "", "type": "", "type_id": "", "var": [], "step": [], "currentStep": 0, "log": [], "status": "INIT", "location": null};

    $scope.product = product;
    $scope.types = [];

    // Gespeicherten Typen aus DB holen
    $http.get('/api/producttype').then(function (res) {
        $scope.types = res.data;
    }, function () {
        showError("Konnte Produkttypen nicht laden");
    });

    $scope.variables = [];
    $scope.variables[0] = {"name": "", "type": "", "value": ""};

    $scope.VarToggler = {opacity: 0.5};

    $scope.loadType = function (type) {
        $scope.variables = type.var;
        $scope.VarToggler.opacity = 1;
        product.type_id = type._id;
        product.var = type.var;
        product.step = type.step;
    };

    $scope.saveForm = function () {
        console.log(product);

        $http.post(repositoryUrl + '/product', product).then(
                function () {
                    showSuccess("Produkt \"" + product.name + "\" gespeichert!");
                    $location.path("/products");
                },
                function () {
                    showError("Konnte Produkt nicht in Repository speichern!");
                });
    }

});

// Produkttyp Verwaltung
app.controller('ProductManage', function ($scope, $http) {

    $scope.types = [];

    // Gespeicherten Typen aus DB holen
    $http.get('/api/producttype').then(
            function (res) {
                $scope.types = res.data;
            },
            function () {
                showStandardError();
            });

    // Löschen Funktion
    $scope.deleteType = function (id) {

        console.log("Delete: " + '/api/producttype/' + id);

        $http.delete('/api/producttype/' + id).then(
                function (res) {
                    $scope.types.forEach(function (item, index, object) {
                        if (item._id == id)
                            object.splice(index, 1);
                    })
                    showSuccess("Produkttyp gelöscht!");
                },
                function () {
                    showStandardError();
                });

    };

});

app.controller('ProductAdd', function ($scope, $http, $location) {

    var productart = {};
    productart.name = "";
    productart.step = [];
    productart.var = [];
    $scope.productart = productart;

    var unitFields = 0;
    $scope.productart.step = [];
    $scope.productart.step[0] = {"index": 0, "name": ""};

    $scope.addUnit = function () {
        unitFields++;
        $scope.productart.step[unitFields] = {"index": unitFields, "name": ""};
    }

    var varFields = 0;
    $scope.productart.var = [];
    $scope.productart.var[0] = {"index": 0, "name": "", "type": "String"};

    $scope.addVar = function () {
        varFields++;
        $scope.productart.var[varFields] = {"index": varFields, "name": "", "type": "String"};
    }

    $scope.saveForm = function () {
        console.log($scope.productart);

        $http.post('/api/producttype', $scope.productart).then(
                function () {
                    showSuccess("Produkttyp \"" + $scope.productart.name + "\" gespeichert!");
                    $location.path("/products/manage");
                },
                function () {
                    showStandardError();
                });
    }

});

app.controller('log', function ($scope, $http, $timeout) {
    $scope.logs = [];
    
    var timer = null;
    var reloader = function () {
        
        if (timer !== null)
        $timeout.cancel(timer);
    
        $http.get('/api/log').then(
                function (res) {
                    $scope.logs = res.data;
                },
                function (err) {
                    showError("Konnte Logs nicht laden!");
                    console.log(err);
                });
                
        timer = $timeout(reloader, 5000);
    }
    
    reloader();
    
    $scope.$on("$destroy", function() {
        if (timer) {
            $timeout.cancel(timer);
        }
    });
});
// ------------------------------- Notifications

function showInfo(text)
{
    showNotification("info", "info", text);
}
function showSuccess(text)
{
    showNotification("check", "success", text);
}
function showError(text)
{
    showNotification("close-circle", "danger", text);
}
function showWarning(text)
{
    showNotification("attention", "warning", text);
}
function showStandardError()
{
    showNotification("close-circle", "danger", "Fehler aufgetreten!");
}

function showNotification(icon, type, text) {
    $.notify({
        icon: "pe-7s-" + icon,
        message: text

    }, {
        type: type,
        timer: 4000,
        placement: {
            from: "bottom",
            align: "right"
        }
    });
}

function logger(text)
{
    console.log(text);
}

function loadRepoUrl($http, $scope, callback)
{
    if (repositoryUrl == "")
        $http.get('/api/repository').then(function (res) {
            repositoryUrl = res.data;
            logger("Loaded repo URL: " + repositoryUrl);
            callback($http, $scope);
        }, function () {
            showError("Repository URL konnte nicht geladen werden");
        });
    else
        callback($http, $scope);
}

function getPortFromURL(url) {
    console.log(url);
    var regex = /^(http|https|opc.tcp):\/\/[^:\/]+(?::(\d+))?/;
    var match = url.match(regex);
    if (match === null) {
        return null;
    } else {
        return match[2] ? match[2] : {http: "80", https: "443"}[match[1]];
    }
}