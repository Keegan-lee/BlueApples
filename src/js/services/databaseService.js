'use strict';

app.service('databaseService', ['$q', function($q) {

	var db;

	this.init = function(fb) {
		db = fb.database();
	};

	this.getDB = function() {
		return db;
	};

	this.getRef = function(ref) {
		var defer = $q.defer();
		$q.when(db.ref(ref)).then(function(response) {
			response.once('value', function(snap) {
				defer.resolve(snap.val());
			});
		});
		return defer.promise;
	};

	this.setRef = function(ref, data) {
		var defer = $q.defer();
		$q.when(db.ref(ref).set(data)).then(function(response) {
			defer.resolve(response);
		});
		return defer.promise;
	};

	this.updateRef = function(ref, data) {
		var defer = $q.defer();
		$q.when(db.ref(ref).update(data)).then(function(response) {
			defer.resolve(response);
		});
		return defer.promise;
	};

	this.removeRef = function(ref) {
		var defer = $q.defer();
		$q.when(db.ref(ref).remove()).then(function(response) {
			defer.resolve(response);
		});
		return defer.promise;
	};
}]);
