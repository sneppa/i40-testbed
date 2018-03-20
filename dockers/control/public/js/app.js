//define a global application
var app = angular.module('App', ['ngRoute']);

//create an app router for url management and redirect
app.config(function($routeProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'tpl/dashboard.html',
		controller: 'dashboard',
	}).when('/server', {
		templateUrl: 'tpl/server.html',
		controller: 'server',
	}).when('/products', {
		templateUrl: 'tpl/products.html',
		controller: 'products',
	}).when('/network', {
		templateUrl: 'tpl/network.html',
		controller: 'network',
	}).when('/help', {
		templateUrl: 'tpl/help.html',
	});
	$routeProvider.otherwise({redirectTo: '/dashboard'});
});

app.controller('nav', function($scope) {
//    $scope.title = "Dashboard";
});

app.controller('dashboard', function($scope) {
//    $scope.nav.title = "Dashboard";
});

app.controller('server', function($scope) {
//    $scope.nav.title = "Server";
    
});

app.controller('products', function($scope) {
//    $scope.nav.title = "Produkte";
    
});

app.controller('network', function($scope) {
//    $scope.nav.title = "Netzwerk";
    
});