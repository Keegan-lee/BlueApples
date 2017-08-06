'use strict';

app.controller('BlogEditorCtrl', function($scope, storageService, $q, Upload, $timeout) {

	$scope.blogs;	// An array of blogs

	$scope.currentBlog; // Keeps track of the currently selected blog - int
	$scope.currentBlogDefaultPhoto;

	$scope.masterCheck;
	$scope.masterPhotoCheck;

	$scope.postView;

	$scope.fireMeta; // DB object to be modified to update blogMeta/
	$scope.fireBlog; // DB object to be modified to update blogs/<blog name>/

	// Post View
	$scope.currentPost; // Keeps track of the currently selected post - int
	$scope.photoRoot;

	// Upload variables
	$scope.photos;
	$scope.uploadResult;

	// Tag Variables
	$scope.newTag;
	$scope.tagSuccessMessage;
	$scope.tagErrorMessage;
	$scope.selectedTags;

	$scope.blogSaved;
	$scope.postSaved;

	$scope.menuCollapse;

	var newBlog = {
		"title" : "newBlog",
		"defaultPhoto" : false
	};

	var defaultPost = {
		isAlbum: false,
		sections : [{
			"type": 'A',
			"text": "Default Section"
		}]
	};

	// @option
	$scope.options = {
		showIDs: false
	}

	$scope.init = function() {
		$scope.blogs = [];
		$scope.currentBlog = -1;
		$scope.currentPost = -1;

		$scope.postView = false;

		$scope.selectedTags = [];

		$scope.newTag = null;
		$scope.tagSuccessMessage = null;
		$scope.tagErrorMessage = null;
		$scope.selectedTags = null;

		$scope.blogSaved = true;
		$scope.postSaved = true;

		$scope.menuCollapse = false;

		$q.when(blogService.getMasterMeta()).then(function(response) {
			response.on("value", function(snap) { // This function runs anytime that the application detects a change in the blogMeta reference in the database
				$timeout(function() {
					$scope.blogs = []; // Empty the Array and refill it with the values retreived from snap

					var meta = snap.val();


					angular.forEach(meta, function (val, id) {
						$scope.blogs.push({
							"title": val.title,
							"defaultPhoto" : val.defaultPhoto,
							id: id
						});
					});

					if ($scope.currentBlog != -1) {
						if ($scope.blogs[$scope.currentBlog]) {
							if ($scope.blogs[$scope.currentBlog].defaultPhoto) {
								$scope.getDefaultBlogPhoto();
							}
						}
					}
				});
			});
		});
	};

	/*
	 *	Function	:	newBlog
	 *	Purpose		: 	Creates a new firebase database reference and inserts a default blog into the database.
	 *
	 *  Notes		:	The new ID of the blog is $scope.blogs.length
	 */
	$scope.newBlog = function() {

		var blogID;

		if ($scope.blogs.length == 0) {
			blogID = 0;
		} else {
			var blogID = $scope.blogs[$scope.blogs.length - 1].id + 1;
		}

		var defaultPostMeta = {
			"id" : 0,
			"date" : new Date(),
			"tags" : ["New"],
			"img" : "",
			"title": "Default Post"
		};

		var batchCall = [];

		batchCall.push(blogService.setDatabaseRef('blogMeta/' + blogID, newBlog));
		batchCall.push(blogService.setDatabaseRef('blogs/' + blogID + '/postMeta/0', defaultPostMeta));
		batchCall.push(blogService.setDatabaseRef('blogs/' + blogID + '/posts/0', defaultPost));

		$q.all(batchCall).then(function(resolve) {
			$scope.blogSaved = false;
		}, function (reject) {

		});
	};

	/*
	 *	Function	:	selectBlog
	 *	Purpose		: 	Retrieves the blogs posts metadata from the firebase database
	 *
	 *	Input		:	blog - The index of the selected blog
	 */
	$scope.selectBlog = function(blog) {
		$scope.currentPost = null;
		$scope.postView = false;

		$scope.currentBlog = blog;

		var batchCall = [];

		batchCall.push(blogService.getPostMeta($scope.blogs[$scope.currentBlog].id));

		if ($scope.blogs[$scope.currentBlog].defaultPhoto) {
			batchCall.push(blogService.getStorageRef('blogs/' + $scope.blogs[$scope.currentBlog].id + '/default.png'));
		} else {
			$scope.currentBlogDefaultPhoto = null;
		}

		$q.all(batchCall).then(function(resolve) {

			if (resolve[0]) {
				resolve[0].on('value', function(snap) {
					$timeout(function() {
						if ($scope.blogs[$scope.currentBlog]) {
							$scope.blogs[$scope.currentBlog].posts = snap.val();
							if ($scope.currentPost != -1 && $scope.currentPost != null) {
								$scope.selectPost($scope.currentPost);
							}
						}
					});
				});
			}

			if (resolve[1]) {
				resolve[1].getDownloadURL().then(function(url) {
					$timeout(function() {
						$scope.currentBlogDefaultPhoto = url;
					});
				});
			}
		}, function(reject) {

		});
	};

	/*
	 *	Function	:	deleteBlog
	 *	Purpose		: 	Deletes the entire blog
	 *						- Deletes the record from the database ref blogMeta/
	 *						- Deletes the record from the database ref blogs/
	 *						- Deletes any records from storage
	 */
	$scope.deleteBlog = function() {

		if ($scope.currentBlog == -1 || $scope.postView) return; // Stop the delete functionality when the delete button is disabled

		var batchCall = [];

		batchCall.push(blogService.deleteDatabaseRef('blogMeta/' + $scope.blogs[$scope.currentBlog].id));
		batchCall.push(blogService.deleteDatabaseRef('blogs/' + $scope.blogs[$scope.currentBlog].id));

		if ($scope.blogs[$scope.currentBlog].defaultPhoto) {
			batchCall.push(blogService.deleteStorageRef('blogs/' + $scope.blogs[$scope.currentBlog].id + "/default.png"));
		}

		var batchPostDelete = [];

		for (post in $scope.blogs[$scope.currentBlog].posts) {
			batchPostDelete.push($scope.deletePostPhotos($scope.blogs[$scope.currentBlog].posts[post].id));
		}


		$q.all(batchPostDelete).then(function(response) {
			$q.all(batchCall).then(function(resolve) {
				if (debug.on && (debug.levels.indexOf(0) != -1 || debug.levels.indexOf(18) != -1)) {
					console.log("----- Database : Delete Successful -----");
				}

				$scope.currentBlog = -1;
				$scope.currentPost = -1;
				$scope.postView = false;
				$scope.currentBlogDefaultPhoto = null;
				$scope.blogSaved = false;

			}, function (reject) {

			});
		});
	};

	$scope.saveBlog = function() {


		if ($scope.currentBlog == -1) return;


		var batchCall = [];

		var update = {
			"title" : $scope.blogs[$scope.currentBlog].title,
			"defaultPhoto" : $scope.blogs[$scope.currentBlog].defaultPhoto
		};

		var updatedPostMeta = {};

		batchCall.push(blogService.updateDatabaseRef('blogMeta/' + $scope.blogs[$scope.currentBlog].id, update));

		for (post in $scope.blogs[$scope.currentBlog].posts) {
			updatedPostMeta = {
				"title" : $scope.blogs[$scope.currentBlog].posts[post].title,
				"date" : $scope.blogs[$scope.currentBlog].posts[post].date == null ? new Date() : $scope.blogs[$scope.currentBlog].posts[post].date,
				"tags" : $scope.blogs[$scope.currentBlog].posts[post].tags,
				"img" : $scope.blogs[$scope.currentBlog].posts[post].img == null ? "" : $scope.blogs[$scope.currentBlog].posts[post].img,
				"id" : $scope.blogs[$scope.currentBlog].posts[post].id,
				"published" : $scope.blogs[$scope.currentBlog].posts[post].published
			};

			batchCall.push(blogService.updateDatabaseRef('blogs/' + $scope.currentBlog + '/postMeta/' + $scope.blogs[$scope.currentBlog].posts[post].id, updatedPostMeta));
		}

		$q.all(batchCall).then(function(resolve) {
			if (debug.on && (debug.levels.indexOf(0) != -1 || debug.levels.indexOf(18) != -1)) {
				console.log("----- Blog & Post Meta Saved -----");
			}
			$scope.getDefaultBlogPhoto();
			$scope.selectBlog($scope.currentBlog);
			$scope.blogSaved = true;
		}, function (reject) {

		});
	};

	$scope.getDefaultBlogPhoto = function() {

		if ($scope.blogs[$scope.currentBlog].defaultPhoto) {
			$q.when(blogService.getStorageRef('blogs/' + $scope.blogs[$scope.currentBlog].id + "/default.png")).then(function(resolve) {
				resolve.getDownloadURL().then(function(url) {
					$timeout(function() {
						$scope.currentBlogDefaultPhoto = url;
					});
				})
			});
		}
	};

	$scope.uploadDefaultBlogPhoto = function(photo) {

		var fileType = photo.name.substring(photo.name.lastIndexOf("."), photo.name.length);

		if (fileType != '.png') {
			alert("System Only Takes .png Files");
			return;
		}

		var next = function(snapshot) {return};
		var error = function(error) {console.log("Error Uploading : " + error)};
		var complete = function() {

			$scope.blogs[$scope.currentBlog].defaultPhoto = true;
			$scope.saveBlog();
		}

		var uploadTask = blogService.putStorageRef('blogs/' + $scope.blogs[$scope.currentBlog].id + '/default.png', photo);

		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, next, error, complete);
	};

	$scope.newPost = function() {

		if ($scope.currentBlog == -1) return;

		if (!Array.isArray($scope.blogs[$scope.currentBlog].posts)) {
			$scope.blogs[$scope.currentBlog].posts = [];
		}

		var postID = $scope.blogs[$scope.currentBlog].posts.length == 0 ? 0 : $scope.blogs[$scope.currentBlog].posts[$scope.blogs[$scope.currentBlog].posts.length - 1].id + 1;

		var newPostMeta = {
			"id" : postID,
			"date" : new Date(),
			"tags" : ["New"],
			"img" : "",
			"title": "Default Post",
			"published" : false
		};

		var batchCall = [];

		batchCall.push(blogService.setDatabaseRef('blogs/' + $scope.currentBlog + '/postMeta/' + postID, newPostMeta));
		batchCall.push(blogService.setDatabaseRef('blogs/' + $scope.currentBlog + '/posts/' + postID, defaultPost));

		$q.all(batchCall).then(function(resolve) {
			$scope.postSaved = false;
		}, function (reject) {

		});
	};

	$scope.selectPost = function(post) {

		$scope.newTag = null;
		$scope.tagSuccessMessage = null;
		$scope.tagErrorMessage = null;
		$scope.selectedTags = [];

		var batchCall = [];

		batchCall.push(blogService.getDatabaseRef('blogs/' + $scope.currentBlog + '/posts/' + post));


		if ($scope.blogs[$scope.currentBlog].posts[post].img && $scope.blogs[$scope.currentBlog].posts[post].img != "") {
			batchCall.push(blogService.getStorageRef('blogs/' + $scope.currentBlog + '/' + post + '/' + $scope.blogs[$scope.currentBlog].posts[post].img));
		}

		$q.all(batchCall).then(function(resolve) {
			resolve[0].on('value', function(snap) {

				if ($scope.currentBlog == -1) {return}

				$timeout(function() {
					if (snap.val() != null) {

						$scope.currentPost = post;

						$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].isAlbum = snap.val().isAlbum;
						$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections = snap.val().sections;
						$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album = snap.val().album;

						$scope.postView = true;

						angular.forEach($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections, function (value, key) {
							$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections[key].id = key;
						});
					}
				});
			});
		});
	};

	$scope.deletePost = function(post) {

		if ($scope.currentBlog == -1) return;

		var batchCall = [];

		if (post == null) {
			if ($scope.currentPost != null) {
				// @TODO - Delete post when post is selected
			}
		} else {
			batchCall.push(blogService.deleteDatabaseRef('blogs/' + $scope.currentBlog + '/postMeta/' + post));
			batchCall.push(blogService.deleteDatabaseRef('blogs/' + $scope.currentBlog + '/posts/' + post));
		}

		$scope.deletePostPhotos(post).then(function(response) {
			$q.all(batchCall).then(function(resolve) {

				$scope.postSaved = false;
			}, function (reject) {

			});
		});
	};

	$scope.savePost = function() {
		if (!$scope.postView || $scope.currentPost == -1) return;

		var updatedPostMeta = {
			"title" : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].title,
			"date" : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].date == null ? new Date() : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].date,
			"tags" : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].tags,
			"img" : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].img,
			"id" : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].id,
			"published" : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].published
		};

		var updatedSection = {
			"isAlbum" : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].isAlbum,
			"sections": $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections,
			"album": $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album == null ? [] : $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album
		};

		var batchCall = [];

		if (updatedPostMeta.title && updatedPostMeta.date && updatedPostMeta.tags && updatedPostMeta && updatedPostMeta.id) {
			batchCall.push(blogService.updateDatabaseRef('blogs/' + $scope.currentBlog + '/postMeta/' + $scope.currentPost, updatedPostMeta));
		}

		if (updatedSection.isAlbum != null && updatedSection.sections != null) {
			batchCall.push(blogService.updateDatabaseRef('blogs/' + $scope.currentBlog + '/posts/' + $scope.currentPost, updatedSection));
		}

		return $q.all(batchCall).then(function(resolve) {
			$scope.postSaved = true;
		}, function (reject) {

		});
	};

	$scope.deletePostPhoto = function(post) {

		$q.when(blogService.deleteStorageRef('blogs/' + $scope.currentBlog + '/' + post + '/' + $scope.blogs[$scope.currentBlog].posts[post].img.name)).then(function (resolve) {

		}, function (reject) {

		});
	};

	$scope.uploadPostPhoto = function(photo) {

		if ($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].img != "") {
			$scope.deletePostPhoto($scope.currentPost);
		}

		var storageRef = 'blogs/' + $scope.currentBlog + '/' + $scope.currentPost + '/' + photo.name;

		var next = function(snapshot) {return}
		var error = function (error) {}
		var complete = function() {

			$q.when(blogService.getStorageRef(storageRef)).then(function(resolve) {
				resolve.getDownloadURL().then(function(url) {
					var databaseIMG = {
						"url" : url,
						"name": photo.name
					};
					$q.when(blogService.setDatabaseRef('blogs/' + $scope.currentBlog + '/postMeta/' + $scope.currentPost + '/img', databaseIMG)).then(function(resolve) {

					});
				});
			}, function (reject) {

			});
		};

		var uploadTask = blogService.putStorageRef(storageRef, photo);

		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, next, error, complete);
	};

	$scope.disablePostView = function() {
		$scope.postView = false;
		$scope.currentPost = -1;
	};

	$scope.isActive = function(state) {
		if ($scope.currentBlog != -1) {
			if ($scope.blogs[$scope.currentBlog]) {
				if (state.title == $scope.blogs[$scope.currentBlog].title) {
					return true;
				}
			}
		}
		return false;
	};

	$scope.addTag = function() {

		if ($scope.newTag == '' || $scope.newTag == null || $scope.newTag == undefined) {return}

		if ($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].tags == null) {
			$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].tags = [];
		}

		$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].tags.push($scope.newTag);

		$scope.savePost().then(function(response) {
			$scope.tagErrorMessage = null;
			$scope.tagSuccessMessage = "Tag Added";
			$scope.newTag = null;
		});
	};

	$scope.deleteTags = function(index) {

		for (tag in $scope.selectedTags) {
			delete $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].tags[$scope.selectedTags[tag]];
		}

		$scope.savePost().then(function(response) {
			$scope.tagErrorMessage = null;
			$scope.tagSuccessMessage = "Tag Deleted";
			$scope.newTag = null;
			$scope.selectedTags = [];
		});
	};

	$scope.selectTag = function(index) {
		$scope.selectedTags.push(index);
	};

	$scope.newSection = function(type) {

		$scope.newSectionPopup = false;

		if (!Array.isArray($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections)) {
			$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections = [];
		}

		var sectionID;

		if ($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections.length == 0) {
			sectionID = 0;
		} else {
			sectionID = $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections[$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections.length - 1].id + 1;
		}

		$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections.push({
			type: type,
			text: "",
			id: sectionID
		});

		var update = [];

		for (section in $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections) { // Must be here to get rid of emtpy cells in the array
			if ($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections[section]) {
				update.push($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections[section]);
			}
		}

		$q.when(blogService.updateDatabaseRef('blogs/' + $scope.currentBlog + '/posts/' + $scope.currentPost + '/sections/', update)).then(function(resolve) {
			$scope.postSaved = false;
		}, function (reject) {

		});
	};

	$scope.deleteSection = function(section) {

		$scope.deleteSectionPhotos($scope.currentPost, section).then(function(response) {
			$q.when(blogService.deleteDatabaseRef('blogs/' + $scope.currentBlog + '/posts/' + $scope.currentPost + "/sections/" + section)).then(function(resolve) {

			}, function (reject) {

			});
		});
	};

	$scope.uploadSectionImage = function(file, section, index) {

		var ref = 'blogs/' + $scope.currentBlog + '/' + $scope.currentPost + '/' + section + '/' + file[0].name;

		var next = function(snapshot) {return};
		var error = function(error) {console.log("Error Uploading : " + error)};
		var complete = function() {
			$q.when(storageService.getRef(ref)).then(function(response) {
				response.getDownloadURL().then(function(url) {
					if (!$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections[section].photos) {
						$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections[section].photos = [];
					}
					$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].sections[section].photos.push({
						"name" : file[0].name,
						"url": url,
						"rotate":0
					});
					$scope.savePost();
				});
			});
		};

		var uploadTask = blogService.putStorageRef(ref, file[0]);

		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, next, error, complete);
	};


	$scope.deletePostPhotos = function(post) {

		var batchDelete = [];

		for (section in $scope.blogs[$scope.currentBlog].posts[post].sections) {
			batchDelete.push($scope.deleteSectionPhotos(post, $scope.blogs[$scope.currentBlog].posts[post].sections[section].id));
		}

		return $q.all(batchDelete);
	};

	$scope.deleteSectionPhotos = function(post, section) {

		var batchDelete = [];

		var p = post == null ? $scope.currentPost : post;

		if ($scope.blogs[$scope.currentBlog].posts[p].sections[section].photos) {
			var storageRef;

			for (photo in $scope.blogs[$scope.currentBlog].posts[p].sections[section].photos) {
				storageRef = "blogs/" + $scope.currentBlog + "/" + p + "/" + section + "/" + $scope.blogs[$scope.currentBlog].posts[p].sections[section].photos[photo].name;
				batchDelete.push(blogService.deleteStorageRef(storageRef));
			}
		}

		return $q.all(batchDelete);
	};

	$scope.blogChanged = function() {

		$scope.blogSaved = false;
	};

	$scope.postChanged = function() {

		$scope.postSaved = false;
	}

	/*
	 *	Function	:	uploadPhotos()
	 *	Purpose		:	Uploads photos into the album reference in the storage and database
	 *
	 *  TODO		:	@TODO 	- Enforce the following rules
	 *						  	- Only JPGs, PNGs
	 *						  	- Only 10 Photos allowed in the database
	 */
	$scope.uploadPhotos = function(photos) {

		var storageRef = "blogs/" + $scope.currentBlog + "/" + $scope.currentPost + "/album/";
		var databaseRef = "blogs/" + $scope.currentBlog + "/posts/" + $scope.currentPost + "/album/";

		var uploadTasks = [];
		var albumMeta = [];


		for (photo in $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album) {
			albumMeta.push($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album[photo].name);
		};

		var next = function(snapshot) {return}
		var error = function(error) {console.log("Error Uploading : " + error)};
		var complete = function() {

			$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].isAlbum = true;
		}

		for (photo in photos) {
			uploadTasks.push(storageService.getRef(storageRef + photos[photo].name).put(photos[photo]));
			uploadTasks[photo].on(firebase.storage.TaskEvent.STATE_CHANGED, next, error, complete);

			albumMeta.push({
				"name":photos[photo].name
			});
		}

		$q.when(blogService.setDatabaseRef(databaseRef, albumMeta)).then(function(response) {

		});
	};

	$scope.deletePhotos = function() {

		var storageRef = "blogs/" + $scope.currentBlog + "/" + $scope.currentPost + "/album/";
		var databaseRef = "blogs/" + $scope.currentBlog + "/posts/" + $scope.currentPost + "/album/";

		var batchDelete = [];
		var updatedAlbum = [];

		for (photo in $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album) {
			if ($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album[photo].checked) {
				batchDelete.push(blogService.deleteStorageRef(storageRef + $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album[photo].name));
			} else {
				updatedAlbum.push($scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album[photo]);
			}
		}

		$q.all(batchDelete).then(function(response) {
			blogService.setDatabaseRef(databaseRef, updatedAlbum).then(function() {

			});
		});
	};

	$scope.rotateRight = function(photo) {

		if (photo.rotate == null) {
			photo.rotate = 1;
		} else {
			photo.rotate = (photo.rotate + 1) % 4;
		}
		$scope.postChanged();
	};

	$scope.checkAllPhotos = function() {
		for (photo in $scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album) {
			$scope.blogs[$scope.currentBlog].posts[$scope.currentPost].album[photo].checked = $scope.masterPhotoCheck;
		}
	};

	$scope.publishAll = function() {
		if ($scope.currentBlog == -1) return;
		for (post in $scope.blogs[$scope.currentBlog].posts) {
			$scope.blogs[$scope.currentBlog].posts[post].published = $scope.masterCheck;
		}
		$scope.blogSaved = false;
	};

	$scope.toggleMenuCollapse = function() {
		$scope.menuCollapse = !$scope.menuCollapse;
	}
});
