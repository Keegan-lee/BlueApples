app.controller('HomeCtrl', function($scope, databaseService, $q) {


    var menuRef = "content/pages/home";

    $scope.content;
    $scope.menu = [];

    $scope.init = function() {
        $q.when(databaseService.getRef(menuRef)).then(function(response){
            $scope.content = response;

            $scope.menu = $scope.content.menu;

            $scope.randomPhoto = Math.round((Math.random() * $scope.content.img1.length - 1));
        });
    };

});
