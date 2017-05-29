'use strict';

app.controller('AboutCtrl', function($scope, $q, databaseService) {

    const ABOUT_REF = "/content/pages/about";

    $scope.content;
    $scope.sidePhotos = [];
    $scope.title;

    $scope.init = function() {
        $q.when(databaseService.getRef(ABOUT_REF)).then(function(response) {
            console.log(response);
            $scope.content = response.content;
            $scope.title = response.title;
            $scope.sidePhotos = response.sidePhotos;
        })
    };
});
