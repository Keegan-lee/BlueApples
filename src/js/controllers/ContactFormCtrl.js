'use strict';

app.controller('ContactFormCtrl', function($scope, $http, $httpParamSerializer, $timeout) {
    $scope.result = '';
    $scope.resultMessage;
    $scope.submitClicked = false;
    $scope.submitted = false; //used so that form errors are shown only after the form has been submitt
    const TIMEOUT = 2000;

	$scope.submit = function(e) {
		$scope.submitClicked = true;

        $scope.form.recipient = "keegan.lee.francis@gmail.com";

        $scope.formData = {
            name: $scope.form.name.$viewValue,
            recipient: "keegan.lee.francis@gmail.com",
            subject: $scope.form.subject.$viewValue,
            email: $scope.form.email.$viewValue,
            message: $scope.form.message.$viewValue
        }

        if ($scope.form.$valid) {
            $http({
                method  : 'POST',
                url     : 'http://localhost:80/send',
                params  : $scope.formData,  //param method from jQuery
                dataType: 'json',
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  //set the headers so angular passing info as form data (not request payload)
            }).then(function(response) {
                if (response.data.success) { //success comes from the return json object
                    $scope.resultMessage = response.data.message;
                    $scope.result='valid';

                    $timeout(function() {
                        resetForm();
                    }, TIMEOUT)
                } else {
                    $scope.resultMessage = response.message;
                    $scope.result='invalid';
                }
            });
        } else {
            $scope.submitButtonDisabled = false;
            $scope.resultMessage = 'Failed <img src="http://www.chaosm.net/blog/wp-includes/images/smilies/icon_sad.gif" alt=":(" class="wp-smiley">  Please fill out all the fields.';
            $scope.result='invalid';
        }
        e.preventDefault();
	};

    var resetForm = function() {
        $scope.name = null;
        $scope.email = null;
        $scope.subject = null;
        $scope.message = null;
        $scope.result = null;
        $scope.resultMessage = null;
        $scope.submitClicked = false;
        $scope.result = null;
        $scope.form.$setPristine();
    }
});
