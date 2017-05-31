"use strict";

app.controller('ShopCtrl', function($scope, shopService) {

	$scope.products;

	$scope.init = function() {
		shopService.getProducts().then(function(response) {
			$scope.products = response.data;
			$scope.$emit('pageLoaded');
		});
	};
});
