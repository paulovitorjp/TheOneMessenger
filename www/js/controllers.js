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

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicPopover, 
	                                   $ionicScrollDelegate, $strophe, $cordovaFileTransfer, 
	                                   $timeout, $localstorage,$cordovaFileOpener2) {
  $scope.chat = Chats.get($stateParams.chatId);
  $scope.textMessage = '';
  Chats.setCurrent($stateParams.chatId);
  $scope.$on('newMsg',function(event, data) {
	  $ionicScrollDelegate.scrollBottom(false);
	  console.log("scroll");
  });
  if($scope.chat != null) {
	  $scope.chat.unread= 0;
  }
  $ionicPopover.fromTemplateUrl('templates/my-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.fullscreen = function(imageSrc){

  	var localimage = $localstorage.getObject(imageSrc);

    if ( JSON.stringify(localimage) == '{}') {
  	  
  	  var url = "http://paulovitorjp.com/uploads/" + imageSrc;
      var targetPath = cordova.file.dataDirectory + imageSrc;
      var options = {};
      var trustHosts = true;
      
      console.log("url:" + url + "\ntargetPath:" + targetPath);
      
      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function(result) {
          // Success 	
      	  $localstorage.setObject(imageSrc, targetPath);
      	  console.log("Download Success: " + targetPath + "\n" + result);
      	  $cordovaFileOpener2.open(targetPath,'image/jpeg')
      
        }, function(err) {
          // Error
      	  console.log("Download Failed!" + JSON.stringify(err));
      
        }, function (progress) {
          $timeout(function () {
          $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        })
      });   
      
    } else {
        console.log("localimage: " + localimage);
        $cordovaFileOpener2.open(localimage,'image/jpeg').then(function() {    	
          // file opened successfully
          console.log("File opened!");
        }, function(err) {
          // An error occurred. Show a message to the user
          console.log("Open failed." + JSON.stringify(err));
        });
      }
  };

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
  $scope.enter = function(ev) {
	  if(ev.which == 13) {//verifica se foi um enter
		  $scope.send();
	  }
  };
  $scope.send = function() {
	  if($scope.textMessage != '') { // só envia se realmente tem msg
		  console.log($scope.textMessage);
		  $strophe.send_message($scope.chat.jid, $scope.textMessage, 'me');
		  //Chats.addMessage($scope.chat.jid, $scope.textMessage, 'me'); essa chamada está no $strophe.send_message agora, pra ficar tudo numa coisa só.
		  $scope.textMessage = '';
	  }
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

.controller('ImageCtrl', function($scope, Upload, Chats, $strophe){
  $scope.uploadImage = function(type) {
    Upload.fileTo("http://paulovitorjp.com/image_upload_script.php", type).then(
      function(res) {
        success = JSON.stringify(res);
        // Success
		// $strophe.send_message($scope.chat.jid, "[image:" + res + "]", 'me');
        Chats.addMessage($scope.chat.jid, "[image:" + res + "]", 'me'); //being called from $strophe.send_message()
        console.log("[UploadCtrl] Success: " + success);
      }, function(err) {
        // Error
        console.log("[UploadCtrl] Error: " + err);
      });
  };
});