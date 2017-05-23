app.service('authService', ['$q', '$rootScope', function($q, $rootScope) {

	var googleProvider;
	var currentUser;

	var fbApp;

	this.init = function(fb) {
		fbApp = fb;

	 	googleProviderInit();
	 	fbApp.auth().onAuthStateChanged(function(user) {
  			if (user) { // User is signed in
  				$rootScope.loggedIn = true;
  				currentUser = user;
  				$rootScope.$apply();
  			} else { // User is is signed out
  				$rootScope.loggedIn = false;
  				currentUser = null;
  				$rootScope.$apply();
  			}
  		});
	}

	this.loginWithGoogle = function() {
		fbApp.auth().signInWithPopup(googleProvider).then(function(result) {
            
		});
	};

	this.loginWithEmailAndPassword = function(email, password) {
		if (fbApp.auth().currentUser) {
			fbApp.auth().signOut();
		} else {
			return fbApp.auth().signInWithEmailAndPassword(email, password);
		}
	}

	this.getUser = function() {
		return currentUser;
	};

	this.getAuthStatus = function() {
		return loggedIn;
	};

	this.logout = function() {
		fbApp.auth().signOut();
	}

	function googleProviderInit() {
		googleProvider = new firebase.auth.GoogleAuthProvider();
	};

}]);
