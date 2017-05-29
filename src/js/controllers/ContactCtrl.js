'use strict';

app.controller('ContactCtrl', function($scope, $q, databaseService) {

    const contentRef = "/content/pages/contact";

    $scope.content;

    $scope.init = function() {
        $q.when(databaseService.getRef(contentRef).then(function(response) {
            $scope.content = response;
        }));
    };
});
