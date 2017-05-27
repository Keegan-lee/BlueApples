app.controller('HomeCtrl', function($scope, databaseService, $q) {


    var menuRef = "content/pages/home";

    $scope.content;
    $scope.menu = [];

    $scope.init = function() {
        $q.when(databaseService.getRef(menuRef)).then(function(response){
            $scope.content = response;

            $scope.menu = $scope.content.menu;

            console.log($scope.content.img1.length);

            $scope.randomPhoto = Math.floor((Math.random() * $scope.content.img1.length - 1));
            $scope.randomPhotoA = Math.floor((Math.random() * $scope.content.img1.length));
            console.log($scope.randomPhoto);
            console.log($scope.randomPhotoA);

        });
    };

});
