// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'ionicLazyLoad'])

.run(function($ionicPlatform, $pushWoosh) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
	
	//moved the init push to the AppController
	
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
	controller: 'AppController'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    //.state('tab.chat-detail', {
	.state('tab.chats.detail', {
      url: '/:chatId',
      views: {
        'tab-chats@tab': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/chats');

})

.directive('ionSearch', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			getData: '&source',
			model: '=?',
			search: '=?filter'
		},
		link: function(scope, element, attrs) {
			attrs.minLength = attrs.minLength || 0;
			scope.placeholder = attrs.placeholder || '';
			scope.search = {value: ''};

			if (attrs.class)
				element.addClass(attrs.class);

			if (attrs.source) {
				scope.$watch('search.value', function (newValue, oldValue) {
					if (newValue.length > attrs.minLength) {
						scope.getData({str: newValue}).then(function (results) {
							scope.model = results;
						});
					} else {
						scope.model = [];
					}
				});
			}

			scope.clearSearch = function() {
				scope.search.value = '';
			};
		},
		template: '<div class="item-input-wrapper">' +
					'<i class="icon ion-android-search"></i>' +
					'<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
					'<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
				  '</div>'
	};
});
