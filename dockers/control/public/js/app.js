//define a global application
var app = angular.module('App', ['ngRoute']);
var repositoryUrl = "";

//create an app router for url management and redirect
app.config(function ($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: 'tpl/dashboard.html',
        controller: 'dashboard',
    }).when('/server', {
        templateUrl: 'tpl/server.html',
        controller: 'server',
    }).when('/products', {
        templateUrl: 'tpl/products.html',
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
        templateUrl: 'tpl/network.html',
        controller: 'network',
    }).when('/help', {
        templateUrl: 'tpl/help.html',
    });
    $routeProvider.otherwise({redirectTo: '/dashboard'});
});
   
app.controller('nav', function ($scope) {
//    $scope.title = "Dashboard";
});

app.controller('dashboard', function ($scope) {
//    $scope.nav.title = "Dashboard";
});

app.controller('server', function ($scope) {
//    $scope.nav.title = "Server";

});

app.controller('products', function ($scope, $http) {
//    $scope.nav.title = "Produkte"; 
});

app.controller('network', function ($scope) {
//    $scope.nav.title = "Netzwerk";
});

// ------------------------------- Products

// Produkt Übersicht
app.controller('ProductOverview', function ($scope, $http) {
    
    $scope.products = [];


    // Gespeicherten Typen aus DB holen
    loadRepoUrl($http, $scope, function ($http, $scope) {
        showInfo("Lade Produkte von "+repositoryUrl+'/product');
        $http.get(repositoryUrl+'/product').then(
                function (res) {
                    $scope.products = res.data;
                }, 
                function (err) { showError("Konnte Produkte nicht in Repository lesen!"); console.log(err); });
    });      
});

// Produkt produzieren lassen
app.controller('ProductProduce', function ($scope, $http) {
    
    var product = {"name": "", "type": "", "type_id": "", "var": [], "step": [], "log": [], "status": 0, "location": null};
    
    $scope.product = product;
    $scope.types = [];

    // Gespeicherten Typen aus DB holen
    $http.get('/api/producttype').then(function (res) {$scope.types = res.data;}, function () { showError("Konnte Produkttypen nicht laden"); });

    $scope.variables = [];
    $scope.variables[0] = {"name":"","type":"","value":""};
    
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

        $http.post(repositoryUrl+'/product', product).then(
                function () { showSuccess("Produkt \""+product.name+"\" gespeichert!"); }, 
                function () { showError("Konnte Produkt nicht in Repository speichern!"); });
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
                function () { showStandardError(); });
                
    // Löschen Funktion
    $scope.deleteType = function (id) { 
        
        console.log("Delete: "+'/api/producttype/'+id);
        
        $http.delete('/api/producttype/'+id).then(
                function (res) {
                    $scope.types.forEach(function (item, index, object) {
                        if (item._id == id)
                            object.splice(index, 1);
                    })
                    showSuccess("Produkttyp gelöscht!");
                }, 
                function () { showStandardError(); });
    
    };

});

app.controller('ProductAdd', function ($scope, $http) {

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
                function () { showSuccess("Produkttyp \""+$scope.productart.name+"\" gespeichert!"); }, 
                function () { showStandardError(); });
    }

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
function showStandardError()
{
    showNotification("close-circle", "danger", "Fehler aufgetreten!");
}

function showNotification(icon, type, text){
	$.notify({
		icon: "pe-7s-"+icon,
		message: text

	},{
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
        $http.get('/api/repository').then(function (res) {repositoryUrl = res.data; logger("Loaded repo URL: "+repositoryUrl); callback($http, $scope);}, function () { showError("Repository URL konnte nicht geladen werden"); });
    else
        callback($http, $scope);
}