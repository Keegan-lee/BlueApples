'use strict';

app.controller('RestaurantCtrl', function($scope, $http, databaseService, $q) {

    $scope.menuSrc;

    var MENU_REF = '/globals/menu';

    $scope.init = function() {
        $q.when(databaseService.getRef(MENU_REF)).then(function(response) {
            $scope.menuSrc = response;
            $scope.$emit('pageLoaded');
        });
    }
});
