describe('App', function() {

	beforeEach(function() {
		module('app');
		module('ui.router');
        module('ui.bootstrap');
	});

	var mainScope, rootScope;
	describe('MainController', function() {

		beforeEach(inject(function($controller, _$rootScope_){
	       mainScope = _$rootScope_.$new();
	       mainController = $controller('MainCtrl', { $scope: mainScope });
	    }));

		it ('Tests to see if the main controller exists', function() {
			expect(mainController).to.exist;
		});

		it ('Scope should be defined', function() {
			expect(mainScope).to.exist;
		})

		it ('Tests the test function', function() {
			expect(mainScope.test()).to.equal(1);
		})
	});
})
