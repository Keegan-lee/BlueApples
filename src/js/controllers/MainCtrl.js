'use strict';

app.controller('MainCtrl', function($scope, $state, $rootScope, $q, authService, storageService, databaseService, $location) {
    $scope.helloWorld = "Hello World";
    $scope.title = "Blue Apples";

    $scope.routes;

    var config = {
      apiKey: "AIzaSyCpd6hy3789XuQGrKicinAQiAKqmWl1u-o",
      authDomain: "blue-apples-d0123.firebaseapp.com",
      databaseURL: "https://blue-apples-d0123.firebaseio.com",
      projectId: "blue-apples-d0123",
      storageBucket: "blue-apples-d0123.appspot.com",
      messagingSenderId: "271027425149"
    };

    var fbApp;

    $scope.init = function() {
        $q.when((fbApp = firebase.initializeApp(config))).then(function(response) {

    		$q.all(authService.init(fbApp), databaseService.init(fbApp), storageService.init(fbApp)).then(function(response) {

    			// $window.onbeforeunload = function(evt) {
    			// 	authService.logout();
    			// };
    		});
    	});
        buildMenu();
    }

    function buildMenu() {
		var s = $state.get();
		$scope.routes = [];
		for (var i = 2; i < s.length; i++) {
			if ((s[i].data.main && !s[i].authenticate) || (s[i].data.main && s[i].authenticate && $rootScope.loggedIn)) {
				$scope.routes.push({
					name: s[i].data.title,
					route: s[i].name,
					url: s[i].url
				});
			}
		}
    };

    $scope.isActive = function(path) {
		if (path == $location.path()) {
			return true;
		}
		return false;
	};

    $scope.test = function() {
        return 1;
    }
});
