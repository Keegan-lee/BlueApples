'use strict';

app.controller('BlogCtrl', function($scope, $http, $state, storageService, databaseService, $q, $timeout, $stateParams, $location) {

	var META_REF = 'blog/meta';
	var BLOG_META_REF = 'blog/blogs/';
	var BLOG_REF = 'blog/blogs/';

	$scope.blogs;
	$scope.blogPosts;

	$scope.currentBlog;
	$scope.currentPost;

	$scope.postView;

	$scope.selectedSort = "Newest";
	$scope.selectSort = ['Newest', 'Oldest'];
	$scope.sortPattern = "-";
	$scope.searchText;

	$scope.showAlbumView;
	$scope.albumViewPhotoCount;

	$scope.itemsPerPage = 6;
	$scope.currentPage = 1;

	var gotoBlog = $stateParams.blog;
	var gotoPost = $stateParams.post;

	$scope.init = function() {
		$q.when(databaseService.getRef(META_REF)).then(function(response) {
			$scope.blogs = response;
			console.log($scope.blogs);
			$scope.$emit('pageLoaded');

			if (gotoBlog != "" && gotoBlog != null) {
				$scope.selectBlog(gotoBlog);
				gotoBlog = null;
			}
		})
	};

	$scope.selectBlog = function(blog) {

		console.log("----- selectBlog -----");
		console.log(blog);

		$scope.currentPost = null;
		$scope.editPostView = false;
		$scope.postView = false;

		$q.when(databaseService.getRef(blogMetaRef(blog))).then(function(response) {

			console.log(response);
			$scope.blogPosts = response;

			// $state.transitionTo('blog', { 'blog': blog }, { 'notify': false });
			$scope.currentBlog = blog;

			if (gotoPost != "" && gotoPost != null) {
				$scope.selectPost(gotoPost);
				gotoPost = null;
			}

			// res.once('value', function(snap) {
			// 	$timeout(function() {
			// 		$state.transitionTo('blog', {"blog": blog}, {notify: false});
			// 		$scope.currentBlog = blog;
			//
			// 		if ($scope.blogs[$scope.currentBlog].defaultPhoto) {
			// 			$q.when(blogService.getStorageRef("blogs/" + $scope.currentBlog + "/default.png")).then(function(response) {
			// 				response.getDownloadURL().then(function(url) {
			// 					$timeout(function() {
			// 						$scope.blogs[$scope.currentBlog].defaultPhotoURL = url;
			// 					});
			// 				});
			// 			});
			// 		} else {
			// 			$q.when(blogService.getStorageRef('blogs/default.png')).then(function(response) {
			// 				response.getDownloadURL().then(function(url) {
			// 					$timeout(function() {
			// 						$scope.blogs[$scope.currentBlog].defaultPhotoURL = url;
			// 					})
			// 				})
			// 			});
			// 		}
			//
			//
			// 		if ($scope.currentBlog < $scope.blogs.length && $scope.currentBlog > -1) {
			// 			$scope.blogs[$scope.currentBlog].posts = snap.val();
			// 			$scope.masterArr = $scope.blogs[$scope.currentBlog].posts;
			// 			$scope.selectChange();
			// 			$scope.changePage();
			// 		}
			//
			// 		if (gotoPost != "" && gotoPost != null) {
			// 			$scope.selectPost(gotoPost);
			// 			gotoPost = null;
			// 		}
			// 	});
			// });
		})
	};

	$scope.selectPost = function(post) {
		console.log('----- selectPost() -----');
		console.log(post);

		$q.when(databaseService.getRef(BLOG_REF + $scope.currentBlog + '/posts/' + post)).then(function(response) { // Gets the current Posts sections and isAlbum values
			console.log('----- selectedPost');
			console.log(response);

			$state.transitionTo('blog', { 'blog': $scope.currentBlog, 'post': post }, { notify: false });
			$scope.currentPost = post;

			$scope.post = response;

			$scope.postView = true;

			// response.once('value', function(snap) { // Reads the values from the object
			// 	$timeout(function() {
			// 		$state.transitionTo('blog', {"blog": $scope.currentBlog, "post" : post}, {notify: false});
			// 		if (snap.val().isAlbum) { // If the post has an album, get the album
			// 			var tempAlbum = snap.val().album;
			// 			$scope.blogs[$scope.currentBlog].posts[post].album = []; // Initialize album for post
			//
			// 			var albumCall = [];
			// 			for (photo in tempAlbum) {
			// 				albumCall.push(blogService.getStorageRef("blogs/" + $scope.currentBlog + "/" + post + "/album/" + tempAlbum[photo].name)); // Create each call to the storageService and store it in an array for total execution
			// 			}
			//
			// 			$q.all(albumCall).then(function(response) { // Execute all queries in the album array, receive back the refs for the photos
			// 				var photoCall = [];
			// 				for (r in response) { // For each ref in the array ...
			// 					photoCall.push(response[r].getDownloadURL()); // Create a call to receive each of the urls
			// 				}
			//
			// 				$q.all(photoCall).then(function(response) { // Get each of the URL's for each of the photos and set them to the posts album
			// 					$scope.blogs[$scope.currentBlog].posts[post].album = response;
			// 				});
			// 			});
			// 		}
			//
			// 		$scope.blogs[$scope.currentBlog].posts[post].sections = snap.val().sections;
			// 		$scope.currentPost = post;
			//
			// 		for (section in $scope.blogs[$scope.currentBlog].posts[post].sections) {
			// 			getUrlsForImgs($scope.blogs[$scope.currentBlog].posts[post].sections[section].photoURLs, section);
			// 		}
			//
			// 		$scope.blogs[$scope.currentBlog].posts[post].isAlbum = snap.val().isAlbum;
			//
			// 		$scope.postView = true;
			// 	});
			// });
		});
	};

	$scope.selectChange = function() {
		$scope.blogs[$scope.currentBlog].posts.reverse();
		$scope.masterArr = $scope.blogs[$scope.currentBlog].posts;
		$scope.currentPage = 1;
	};

	$scope.textSearch = function() {
		if ($scope.searchText == "") {
			$scope.masterArr = $scope.blogs[$scope.currentBlog].posts;
		} else {
			$scope.masterArr = [];
			var searchTextLower = $scope.searchText.toLowerCase();
			var searchTextUpper = $scope.searchText.toUpperCase();
			for (post in $scope.blogs[$scope.currentBlog].posts) {
				if ($scope.blogs[$scope.currentBlog].posts[post].title.indexOf($scope.searchText) != -1 ||
					$scope.blogs[$scope.currentBlog].posts[post].title.indexOf(searchTextUpper) != -1 ||
					$scope.blogs[$scope.currentBlog].posts[post].title.indexOf(searchTextLower) != -1 ||
					$scope.blogs[$scope.currentBlog].posts[post].title.toLowerCase().indexOf(searchTextLower) != -1 ||
					$scope.blogs[$scope.currentBlog].posts[post].date.indexOf($scope.searchText) != -1 ||
					$scope.blogs[$scope.currentBlog].posts[post].tags.indexOf($scope.searchText) != -1 ||
					$scope.blogs[$scope.currentBlog].posts[post].tags.indexOf(searchTextLower) != -1 ||
					$scope.blogs[$scope.currentBlog].posts[post].tags.indexOf(searchTextUpper) != -1) {
					$scope.masterArr.push($scope.blogs[$scope.currentBlog].posts[post]);
				}
			}
		}
		$scope.currentPage = 1;
	};

	$scope.back = function() {
		$scope.postView = false;
		$state.transitionTo('blog', {'blog' : $scope.currentBlog}, {notify: false});
	}

  	$scope.shareFB = function() {
  		var share = {
	      	'provider': 'facebook',
	      	'attrs': {
	        	'socialshareUrl': $location.absUrl()
	      	}
	    };

  		blogService.share(share);
  	};

  	$scope.shareTwitter = function() {
  		var share = {
  			'provider': 'twitter',
  			'attrs' : {
  				'socialShareUrl': $location.absUrl()
  			}
  		}

  		blogService.share(share);
  	};

  	$scope.shareLinkedIn = function() {
  		var share = {
  			'provider': 'linkedin',
  			'attrs': {
  				'socialShareUrl': $location.absUrl()
  			}
  		}

  		blogService.share(share)
  	};

  	$scope.changePage = function() {

		var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        var postsLength = $scope.blogs[$scope.currentBlog].posts.length;

		$scope.masterArr = $scope.blogs[$scope.currentBlog].posts.slice(begin, end);
  	};

	var blogMetaRef = function(blog) {
		return BLOG_META_REF + blog + "/meta"
	};
});
