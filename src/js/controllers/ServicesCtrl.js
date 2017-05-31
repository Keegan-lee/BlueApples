app.controller('ServicesCtrl', function($scope, $q, databaseService) {

    $scope.oneAtATime = true;
    $scope.services = [];

    const SERVICES_REF = 'content/pages/services';

    $scope.init = function() {
        $q.when(databaseService.getRef(SERVICES_REF)).then(function(response) {
            $scope.services = response;
            $scope.$emit('pageLoaded');
        });

        $scope.status = {
            isCustomHeaderOpen: false,
            isFirstOpen: true,
            isFirstDisabled: false
        };
    };
});
