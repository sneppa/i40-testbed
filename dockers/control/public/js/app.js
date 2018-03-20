//define a global application
var app = angular.module('App', ['ngRoute']);

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

app.controller('products', function ($scope) {
//    $scope.nav.title = "Produkte";

});

app.controller('network', function ($scope) {
//    $scope.nav.title = "Netzwerk";

});

// ------------------------------- Products

app.controller('ProductManage', function ($scope, $http) {

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
                function () { console.log("Gespeichert"); showSuccess("Produkttyp \""+$scope.productart.name+"\" gespeichert!"); }, 
                function () { console.log("Fehler"); showStandardError(); });
    }

});





// ------------------------------- Notifications

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