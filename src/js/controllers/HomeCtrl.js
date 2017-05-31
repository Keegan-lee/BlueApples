app.controller('HomeCtrl', function($scope, databaseService, $q) {


    var menuRef = "content/pages/home";

    $scope.content;
    $scope.menu = [];

    $scope.init = function() {
        $q.when(databaseService.getRef(menuRef)).then(function(response){
            $scope.content = response;

            $scope.menu = $scope.content.menu;

            $scope.randomPhoto = Math.floor((Math.random() * $scope.content.img1.length));
            if ($scope.randomPhoto == -1) $scope.randomPhoto = 0;
            $scope.$emit('pageLoaded');
        });
    };

});
