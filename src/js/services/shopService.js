'use strict';

app.service('shopService', ['$http', '$q', function($http, $q) {

	var products = $http.get('data/products.json').then(function(response) {
		return response;
	});

	this.getProducts = function() {
		return products;
	}

	this.getProduct = function(id) {
		var q = $q.defer();

		products.then(function(items) {
			angular.forEach(items, function(item) {
				if (item.id == id) {
					q.resolve(item);
					return;
				}
			})
		});

		return q.promise;
	}
}]);
