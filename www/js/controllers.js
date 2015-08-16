angular.module('starter.controllers', [])

.controller('AppController', function($scope, $ionicPopup, $strophe, $localstorage) {
	$scope.showLoginPopup = function() {
		$scope.loginPopup = $ionicPopup.show({
			templateUrl: 'templates/login.html',
			title: 'Faça seu login.', 
			subTitle: 'Usuário fornecido pela The One Invest.',
			scope: $scope
		});
	};
	$scope.connect = function(user) {
		if(user) { //evita undefined error
			user.jid = user.jid + "@paulovitorjp.com"; //change to paulovitorjp.com
			$strophe.connect('connect', {
                    jid: user.jid,
                    password: user.password
                });
			$scope.loginPopup.close();
		}		
	};
	if(!$strophe.isLogged()) {
		console.log("User not logged, opening login popup.");
		$scope.showLoginPopup();
	}
	else {
	  var jid = $localstorage.get("jid");
	  if(jid && (jid!="")) {
		  if (window.sessionStorage.getItem('strophe-bosh-session')) {
			  console.log("User session stored, trying to reconnect.");
			  $strophe.reconnect(jid);
		  } else {
			  console.log("Couldn't find session stored, opening login popup.");
			  $scope.showLoginPopup();
		  }
	  } else {
		console.log("ERROR logged set to TRUE and JID not set.");
	  }
	}
})

.controller('DashCtrl', function($scope) {	
})

.controller('ChatsCtrl', function($scope, Chats, $strophe) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  Chats.setCurrent(null);
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
  Chats.setChatsScope($scope);
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicPopover, $location, $anchorScroll, $ionicScrollDelegate) {
  $scope.chat = Chats.get($stateParams.chatId);
  Chats.setCurrent($stateParams.chatId);
  $scope.chats = Chats.all();
  $scope.$on('newMsg',function(event, data) {
	  $ionicScrollDelegate.scrollBottom(false);
	  console.log("scroll");
  });
  /**
  $scope.$watch($scope.newMSG, function(newValue,oldValue) {
	  $ionicScrollDelegate.scrollBottom(false);
	  console.log("scroll");
  });**/
  if($scope.chat != null) {
	  $scope.chat.unread= 0;
  }
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
	Chats.setCurrent(null);
  });
  $scope.test = function() {
	  console.log("Clicou Enviar.");
  };
})

.controller('AccountCtrl', function($scope, $ionicPopup, $strophe, $localstorage) {
  $scope.settings = {
    enableFriends: true
  };
  $scope.logoff = function() {
	  $scope.logoffPopup.close();
	  console.log("Logged off.");
	  $strophe.setLogged(false); //TODO na vdd precisa limpar a sessão e enviar a stanza de logoff
	  $localstorage.remove("chats");//tem que manter o historico se o cara fizer logoff
	  location.reload();
  }
  $scope.showLogoffPopup = function() {
		$scope.logoffPopup = $ionicPopup.confirm({
			title: 'Tem certeza?', 
			subTitle: 'Ao sair você não receberá notificações de novas mensagens.'
		});
		$scope.logoffPopup.then(function(res) {
			if(res) {
				$scope.logoff();
			}
		});
	};
})

.controller('ImageCtrl', function($scope, Upload){
  $scope.uploadImage = function(type) {
    Upload.fileTo("http://paulovitorjp.com:8000", type).then(
      function(res) {
        // Success
        console.log("[UploadCtrl] Success");
      }, function(err) {
        // Error
        console.log("[UploadCtrl] Error");
      });
  };
})

.controller('AudioCtrl', function($scope, $cordovaCapture, $cordovaFileTransfer) {

  $scope.tracks = [
        {
            url: 'http://paulovitorjp.com:8000/audio_005.wav',
            artist: 'Mensagem de audio',
            title: 'Paulo Victor Maluf',
            art: 'img/maluf.jpg'
        },
    ],

  $scope.uploadAudio = function(filepath, name, mime){
    console.log("uploadAudio");

    var url = "http://paulovitorjp.com:8000";
    var options = {
          fileKey: 'upfile',
          fileName: name,
          chunkedMode: true,
          mimeType: mime
    };
    console.log(options + " " + filepath);

    if (filepath){
      $cordovaFileTransfer.upload(url, filepath, options).then(function(result) {
        console.log("SUCCESS: " + result.response);
        }, function(err) {
             console.log("ERROR: " + err);
        });
    }
  };

  $scope.captureAudio = function() {
    var options = { limit: 1, duration: 10 };

    $cordovaCapture.captureAudio(options).then(function(mediaFiles) {
      console.log("Success! Audio data is here");
      var i, path, name, mime, len;
      for (i = 0, len = mediaFiles.length; i < len; i += 1) {
          path = mediaFiles[i].fullPath;
          name = mediaFiles[i].name;
          mime = mediaFiles[i].type;
          console.log("Loop: " + i + " Path: " + path + " Name: " + name + " Mime: " + mime);
          $scope.uploadAudio(path, name, mime);
      }
    },
    function(err){
      switch (err) {
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
  };
});
