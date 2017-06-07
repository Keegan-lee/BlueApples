"use strict";

var app = angular.module('app', ['ui.router', 'ui.bootstrap'])

    .config(function($stateProvider, $urlRouterProvider, $qProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl',
                data: {
                    title: 'Home',
                    authenticate: false,
                    main: true
                }
            })
            .state('about', {
                url: '/about',
                templateUrl: 'templates/about.html',
                controller: 'AboutCtrl',
                data: {
                    title: 'About',
                    authenticate: true,
                    main: true
                }
            })
            .state('services', {
                url: '/services',
                templateUrl: 'templates/services.html',
                controller: 'ServicesCtrl',
                data: {
                    title: 'Services',
                    authenticate: false,
                    main: true
                }
            })
            .state('shop', {
                url: '/shop',
                templateUrl: 'templates/shop/shop.html',
                controller: 'ShopCtrl',
                data: {
                    title: 'Shop',
                    authenticate: false,
                    main: true
                },
                resolve: function($q, Product) {
                    var def = $q.defer();
                    Product.query().then(function(data) {
                        def.resolve(data);
                    });
                    return def.promise;
                }
            })
            .state('productDetails', {
                url: '/products/{productId}',
                templateUrl: 'templates/shop/productDetails.html',
                controller: 'ProductsCtrl',
                data: {
                    title: '{productId}',
                    authenticate: false,
                    main: false
                },
                resolve: {
                  	product: function ($q, $stateParams, Product) {
                    	var def = $q.defer();
                    		Product.get($stateParams.productId).then(function (data) {
                      		def.resolve(data);
                    	});
                    	return def.promise;
                  	}
                }
            })
            .state('VeganRestaurant', {
                url: '/veganRestaurant',
                templateUrl: 'templates/veganRestaurant.html',
                controller: 'RestaurantCtrl',
                data: {
                    title: 'Vegan Restaurant',
                    authenticate: false,
                    main: true
                }
            })
            .state('contact', {
                url: '/contact',
                templateUrl: 'templates/contact.html',
                controller: 'ContactCtrl',
                data: {
                    title: 'Contact',
                    authenticate: false,
                    main: true
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl',
                data: {
                    title: 'Login',
                    authenticate: false,
                    main: false
                }
            })
            .state('admin', {
                url: '/admin',
                templateUrl: 'templates/admin/admin.html',
                controller: 'AdminCtrl',
                data: {
                    title: 'Admin',
                    authenticate: true,
                    main: false
                }
            })
            // .state('blog', {
            //     url: '/blog/:blog/:post',
            //     templateUrl: 'templates/blog.html',
            //     controller: 'BlogCtrl',
            //     data: {
            //         title: 'Blog',
            //         authenticate: false,
            //         main: true
            //     },
            //     params: {
            //         blog: null,
            //         post: null
            //     }
            // })
            .state('admin.blogEditor', {
                url: '/blogEditor',
                tempalteUrl: 'templates/admin/blogEditor.html',
                controller: 'BlogEditorCtrl',
                data: {
                    title: 'Blog Editor',
                    authenticate: true,
                    main: false
                }
            });
    })

    .run(function($rootScope, $state, $transitions) {

        $transitions.onStart({}, function($transitions$) {
            console.log($transitions$);
            $rootScope.pageLoading = true;
        })
    });
