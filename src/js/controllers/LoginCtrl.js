'use strict';

app.controller('LoginCtrl', function($scope, authService, $state, $q) {

    $scope.errorMessage;

    $scope.init = function() {
        $scope.$emit('pageLoaded');

    };

    $scope.loginWithEmailAndPassword = function(f) {
        if ($scope.form.$valid) {
            $q.when(authService.loginWithEmailAndPassword($scope.form.email.$viewValue, $scope.form.password.$viewValue)).then(function(response) {
                if (response) $state.go('admin');
            }).catch(function(error) {
                $scope.errorMessage = error.message;
            });
        }

    }

    $scope.logout = function() {
		authService.logout();
	};

});
