'use strict';

app.controller('MainCtrl', function($scope, $state, $rootScope, $q, authService, storageService, databaseService, $location) {

    $scope.title = "Blue Apples";

    var SOCIAL_MEDIA_REF = "/globals/socialMedia/";

    $scope.routes;

    $rootScope.navbarOpen = true;

    $rootScope.textRegex = /^[A-z\'\- ]+$/;
    $rootScope.emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    $rootScope.required = true;

    $rootScope.pageLoading = true;

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
                angular.element(document).ready(function() {
            		window.loadingScreen.finish();
            	});

                $q.when(databaseService.getRef(SOCIAL_MEDIA_REF)).then(function(response) {
                    $rootScope.socialMedia = response;
                });
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

    $rootScope.isActive = function(path) {
		if (path == $location.path()) {
			return true;
		}
		return false;
	};

    $scope.test = function() {
        return 1;
    }

    $scope.$on('pageLoaded', function(event) {
        $rootScope.pageLoading = false;
    });

    $rootScope.toggleNav = function() {
        $rootScope.navbarOpen = !$rootScope.navbarOpen;
    }
});
