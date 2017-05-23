'use strict';

app.controller('ProductsCtrl', function ($scope, $stateParams, product) {
	$scope.product = product;
});
