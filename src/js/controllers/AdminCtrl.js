'use strict';

app.controller('AdminCtrl', function($scope) {
    $scope.init = function() {
        $scope.$emit('pageLoaded');
    }
});
