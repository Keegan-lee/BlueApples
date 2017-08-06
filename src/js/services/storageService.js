'use strict';

app.service('storageService', ['$q', function($q) {
	var storage;

	this.init = function(fb) {
		storage = fb.storage();
	};

	this.getStorage = function() {
		return storage;
	};

	this.getRef = function(ref) {
		var defer = $q.defer();
		$q.when(storage.getRef(ref)).then(function(response) {
			defer.resolve(response);
		});
		return defer.promise;
	};

	this.putRef = function(ref, obj) {
		var defer = $q.defer();
		$q.when(storage.getRef(ref).put(obj)).then(function(response) {
			defer.resolve(response);
		})
		return defer.promise;
	};

	this.deleteRef = function(ref) {
		var defer = $q.defer();
		$q.when(storage.getRef(ref).delete()).then(function(response) {
			defer.resolve(response);
		});
		return defer.promise;
	};
}]);
