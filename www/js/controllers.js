angular.module('starter.controllers', [])

.controller('AppController', function($scope, $ionicPopup, Login) {
	$scope.showLoginPopup = function() {
		$scope.loginPopup = $ionicPopup.show({
			templateUrl: 'templates/login.html',
			title: 'Faça seu login.', 
			subTitle: 'Usuário fornecido pela The One Invest.',
			scope: $scope
		});
	}
	$scope.connect = function(user) {
		if(user) { //evita undefined error
			console.log(user.id);
			console.log(user.password);
			Login.setLogged(true);
			$scope.loginPopup.close();
		}		
	}
	if(!Login.isLogged()) $scope.showLoginPopup();
})

.controller('DashCtrl', function($scope) {
	
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicPopover) {
  $scope.chat = Chats.get($stateParams.chatId);
  $ionicPopover.fromTemplateUrl('templates/my-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.openPopover = function($event) {
	console.log("Abriu Popover.");
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  $scope.test = function() {
	  console.log("Clicou Enviar.");
  };
})

.controller('AccountCtrl', function($scope, $ionicPopup, Login) {
  $scope.settings = {
    enableFriends: true
  };
  $scope.logoff = function() {
	  $scope.logoffPopup.close();
	  console.log("Logged off.");
	  Login.setLogged(false); //na vdd precisa limpar a sessão e enviar a stanza de logoff
	  location.reload();
  }
  $scope.showLogoffPopup = function() {
		$scope.logoffPopup = $ionicPopup.confirm({
			title: 'Tem certeza?', 
			subTitle: 'Confirme seu logoff.'
		});
		$scope.logoffPopup.then(function(res) {
			if(res) {
				$scope.logoff();
			}
		});
	};
})

.controller('CaptureCtrl', function($scope, $cordovaCapture) {

  $scope.captureAudio = function() {
    var options = { limit: 1, duration: 10 };

    $cordovaCapture.captureAudio(options).then(function(audioData) {
      // Success! Audio data is here
    }, function(error) {
      // An error occurred. Show a message to the user
      switch (error) {
        case CaptureError.CAPTURE_NO_MEDIA_FILES:
          navigator.notification.alert('no media files', null);
          console.log('no media files');
          break;
        case CaptureError.CAPTURE_INTERNAL_ERR:
          navigator.notification.alert('internal err', null);
          console.log('internal err');
          break;
        case CaptureError.CAPTURE_INVALID_ARGUMENT:
          navigator.notification.alert('invalid arg', null);
          console.log('invalid arg');
          break;
        case CaptureError.CAPTURE_NOT_SUPPORTED:
          navigator.notification.alert('not supported', null);
          console.log('not supported');
          break;
      }
    });
  }
  ionic.Platform.ready(function() { $scope.captureAudio(); })
});
