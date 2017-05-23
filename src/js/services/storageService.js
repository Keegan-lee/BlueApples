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
		if (ref == null)
			return storage.ref();
		return storage.ref(ref);
	};
}]);
