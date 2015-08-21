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
			user.jid = user.jid + "@localhost"; //change to paulovitorjp.com
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

.controller('DashCtrl', function($scope, Dashboard, Chats, $strophe) {
	$scope.cards = Dashboard.all();
	$scope.$on('updateDashboard',function(event, data) {
		$scope.$digest();
	});	
	$scope.remove = function(card) {
		Dashboard.remove(card);
	};
	$scope.accept = function(card) {
		//strophe accept subscribe
		$strophe.accept_subscribe(card.jid);
		//delete card
		Dashboard.remove(card);
		console.log('You accepted ' + card.jid + '\'s invitation');
	}
	$scope.cancel = function(card) {
		//strophe accept subscribe
		$strophe.deny_subscribe(card.jid);
		//delete card
		Dashboard.remove(card);
		console.log('You denied ' + card.jid + '\'s invitation');
	}
})

.controller('ChatsCtrl', function($scope, Chats, $strophe, $ionicPopup, $ionicScrollDelegate) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //  $ionicScrollDelegate.scrollBottom(false);
  //});
  Chats.setCurrent(null);
  $scope.chats = Chats.all();
  $scope.user = {jid: '', name: ''} // user to be added
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
  $scope.$on('updateChats',function(event, data) {
	  $scope.logged = $strophe.isLogged();
	  $scope.$digest();
  });
  $scope.$on('disconnected',function(event, data) {
	  $scope.logged = $strophe.isLogged();
  });
  $scope.showAddPopup = function() {
	$scope.addPopup = $ionicPopup.show({
		templateUrl: 'templates/add.html',
		title: 'Adicione um usuário.', 
		subTitle: 'O usuário só receberá as mensagens enviadas após a aprovação da solicitação.',
		scope: $scope,
		buttons: [
		  { text: 'Cancelar',
			onTap: function(e) {
				$scope.user.jid = '';
				$scope.user.name = '';
			}
		  },
		  {
			text: 'Adicionar',
			type: 'button-positive',
			onTap: function(e) {
			  if ($scope.user.jid == '') {
				//don't allow the user to close unless he enters user jid
				e.preventDefault();
			  } else {
				if ($scope.user.name == '') { // if blank name: gets the first part before @ (in case there is one, otherwise uses the jid)
					if($scope.user.jid.indexOf('@') == -1) {
						$scope.user.name = $scope.user.jid;
					} else {
						$scope.user.name = $scope.user.jid.substring(0,$scope.user.jid.indexOf('@'));
					}
				}
				return $scope.addUser($scope.user);
			  }
			}
		  }
		]
	});
  };
  $scope.hideAddPopup = function() {
	$scope.addPopup.close();
  };
  $scope.addUser = function(user) {
	  if(user) {
		  console.log(user.jid + ' ' + user.name);
		  $scope.addPopup.close();
		  $strophe.add_user(user);
		  user.jid = '';
		  user.name = '';
		  return true;
	  }
	  return false;
  };
  $scope.$on('$ionicView.enter', function(e) {
    $scope.logged = $strophe.isLogged();
	$ionicScrollDelegate.scrollTop(false);
  });
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicPopover, $ionicScrollDelegate, $strophe) {
  $scope.chat = Chats.get($stateParams.chatId);
  $scope.textMessage = '';
  $scope.composing = false;
  Chats.setCurrent($stateParams.chatId);
  $scope.$on('newMsg',function(event, data) {
	  console.log(data.from);
	  if(data.from != 'me') {
		 $scope.$digest();
	  }
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
		  $scope.composing = false;
		  $scope.send();
	  } else if ((ev.which == 8 || ev.which == 46) && $scope.textMessage == '') {//if (backspace or del) and text empty
		  //TODO send NOT composing, if possible
			console.log("Send not composing...");
	  } else if (!$scope.chat.is_room){ //does not send composing to rooms...
		  if(!$scope.composing) {
			  $scope.composing = true;
			  $strophe.send_composing($scope.chat.jid);
		  }
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
  $scope.$on('$ionicView.enter', function(e) {
    $ionicScrollDelegate.scrollBottom(false);
	Chats.save(); //saves the chats array because the unread messages are now 0...
  });
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
	  $strophe.disconnect();
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
    Upload.fileTo("http://paulovitorjp.com:8000", type).then(
      function(res) {
        success = JSON.stringify(res);
        // Success
		$strophe.send_message($scope.chat.jid, "[image:" + res + "]", 'me');
        //Chats.addMessage($scope.chat.jid, "[image:" + res + "]", 'me'); //being called from $strophe.send_message()
        console.log("[UploadCtrl] Success: " + success);
      }, function(err) {
        // Error
        console.log("[UploadCtrl] Error: " + err);
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
