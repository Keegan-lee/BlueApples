app.controller('HomeCtrl', function($scope, databaseService, $q) {


    var menuReference = "content/home/menu";
    $scope.menu = [];

    $scope.init = function() {
        $q.when(databaseService.getRef(menuReference)).then(function(response){
            $scope.menu = response;
        });
    };

});
