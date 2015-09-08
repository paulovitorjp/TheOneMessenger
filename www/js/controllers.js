angular.module('starter.controllers', [])

.controller('AppController', function($scope, $ionicPopup, $strophe, $localstorage, $state, $pushWoosh, Chats, Account, $ionicPlatform, $server) {
	
	var SERVER_NAME = $server.name();
	Account.reset();
	$scope.unauthorized = false;
	$scope.loginPopupIsOpened = false; //prevents opening two login popups when you receive two disconnected status
	$scope.badgeDash = 0;
	$scope.badgeChats = 0;
	$scope.savePass = Account.get('savePassword');
	$scope.localUser = $localstorage.get("jid");
	if($scope.localUser && $scope.localUser.indexOf('@')!=-1) {
		$scope.localUser = $scope.localUser.substring(0,$scope.localUser.indexOf("@"));
	} else {
		$scope.localUser = '';
	}
	var savedPass = $localstorage.get("password");
	if(savedPass && savedPass != '') {
		savedPass = Base64.decode($localstorage.get("password"));
	} else {
		savedPass = '';
	}
	$scope.user = {jid: $scope.localUser, password: savedPass, savePass: $scope.savePass};
	$ionicPlatform.ready(function() {
		//starts pushWoosh, check the user preferences first to check if notifications are enabled
		if(Account.get('enableNotifications')) {
			console.log("Initializing Push");
			$pushWoosh.init();
		} else {
			console.warn("Push notifications disabled by the user.");
		}
	});

	$scope.showLoginPopup = function() {
		if(!$scope.loginPopupIsOpened) { // only opens if it is not already opened
			$scope.loginPopupIsOpened = true; // sets login popup as opened
			$scope.loginPopup = $ionicPopup.show({
				templateUrl: 'templates/login.html',
				title: 'Entrar', 
				subTitle: 'Usuário fornecido pela The One Invest.\nhttp://www.theoneinvest.com.br',
				scope: $scope
			});			
		} else {
			console.warn("Login Popup is already opened.");
		}
	};
	$scope.connect = function(user) {
		if(user) { //evita undefined error
			if(user.jid.indexOf('@')==-1) {
				user.jid = user.jid + "@" + SERVER_NAME; //change to SERVER_NAME
			}			
			$strophe.connect('connect', {
                    jid: user.jid,
                    password: user.password
            });
			Account.set('savePassword',user.savePass);
			//console.log("USER.SAVEPASS = " + user.savePass);
			if(user.savePass) {
				$localstorage.set("password", Base64.encode(user.password));
			} else {
				$localstorage.set("password", '');
				user.password = '';
			}
			$scope.loginPopup.close();
			$scope.loginPopupIsOpened = false; // sets login popup as closed, enabling it to be opened again
		}		
	};
	
	$scope.$on('relogin',function(event, data) {
	  $scope.unauthorized = data.unauthorized;
	  $scope.showLoginPopup();
    });
	
	$scope.$on('newRoom',function(event, data) {//separates the rooms the user has access to to add them to the Groups tag
	  var chats = Chats.all();
	  var groups = [];
	  for (var i=0; i<chats.length; i++) {
		  var jid = chats[i].jid;
		  if(typeof jid == 'string' && jid.indexOf('@conference') != -1) {
			  groups.push(chats[i].jid);
		  }
	  }
	  if(data) { //if this was called because presence in a new room was received
		  if(groups.length > 0) {
			  if(groups.indexOf(data.roomId) == -1) {
				  groups.push(data.roomId);
			  }
		  } else {
			  groups.push(data.roomId);
		  }
	  }//otherwise this the newRoom broadcast was called because user enabled notifications
	  
	  console.log('Groups: ' + groups);
	  $pushWoosh.setTag('Groups', groups);
    });
	
	$scope.$on('incBadge',function(event, data) {
	  if(data.tab != $state.$current.name) {
		  if(data.tab == 'tab.chats') {
			  $scope.badgeChats++;
			  console.log("chats badge incremented");
		  } else if(data.tab == 'tab.dash') {
			  $scope.badgeDash++;
			  console.log("dash badge incremented");
		  }
	  }
 	  if(!$scope.$$phase) {
		  $scope.$digest();
	  } 
    });
	
	$scope.$on('decBadge',function(event, data) {
	  if(data.tab == 'tab.chats') {
		  if(data.qtt>$scope.badgeChats) {
			  $scope.badgeChats = 0;
		  } else {
			  $scope.badgeChats -= data.qtt;
		  }
		  //console.log("chats badge decremented");
	  } else if(data.tab == 'tab.dash') {
		  if(data.qtt>$scope.badgeDash) {
			  $scope.badgeDash = 0;
		  } else {
			  $scope.badgeDash -= data.qtt;
		  }
		  //console.log("dash badge decremented");
	  }
	  if(!$scope.$$phase) {
		  $scope.$digest();
	  }
    });
	
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
		  } else if(window.localStorage.getItem('strophe-bosh-session')) {
			  console.log('User session stored in local storage, trying to reconnect');
			  window.sessionStorage.setItem('strophe-bosh-session', window.localStorage.getItem('strophe-bosh-session'));
			  var session = JSON.parse(window.sessionStorage.getItem('strophe-bosh-session'));
			  $strophe.attach(jid+'/'+session.rid, session.sid, session.rid);
		  } else {
			  console.log("Couldn't find session stored, opening login popup.");
			  $scope.showLoginPopup();
		  }
	  } else {
		console.log("ERROR logged set to TRUE and JID not set.");
	  }
	}
})

.controller('DashCtrl', function($scope, Dashboard, Chats, $strophe, $state, $rootScope) {
	$scope.cards = Dashboard.all();
	$scope.$on('updateDashboard',function(event, data) {
		if(!$scope.$$phase) {
		  $scope.$digest();
	    }
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
	$scope.open = function(link) {
		console.log(link);
		window.open(link, '_blank');
	}
	$scope.$on('$ionicView.enter', function(e) {
		//console.log("STATE: " + $state.$current.name);
		$rootScope.$broadcast('decBadge', {tab: 'tab.dash', qtt: 9999});//clears all dashboard notifications
	});
})

.controller('ChatsCtrl', function($scope, Chats, $strophe, $ionicPopup, $ionicScrollDelegate, $state, $rootScope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //  $ionicScrollDelegate.scrollBottom(false);
  //});
  $scope.monitor = $strophe.isMonitor(); //controls who can send broadcasts
  $scope.chats = Chats.all();
  $scope.user = {jid: '', name: ''} // user to be added
  $scope.broadcast = {title: '', message: '', link: '', time: ''}; //broadcast to be sent
  $scope.openInfo = function(chat) {
	  $scope.chat = chat;
	  console.log('Info popup opened.');
	  $scope.infoPopup = $ionicPopup.show({
		  templateUrl: 'templates/info.html',
		  title: 'Sobre ' + chat.name,
		  subTitle: 'Informações e opções relacionadas ao usuário.',
		  scope: $scope,
		  buttons: [{
			  text: 'Fechar',
			  type: 'button-positive',
			  onTap: function(e) {
				  console.log('Info popup closed.');
			  }
		  }]
	  });
  };
  $scope.deleteHistory = function(chatId) {
    Chats.deleteHistory(chatId);
	console.log("History deleted.");
	$scope.infoPopup.close();
  };
  $scope.removeUser = function(chat) {
    Chats.remove(chat);
	$strophe.remove_user(chat.jid);
	$scope.infoPopup.close();
  };
  $scope.$on('updateChats',function(event, data) {
	  $scope.logged = $strophe.isLogged(); //$scope.logged is created below at beforeEnter
	  $scope.monitor = $strophe.isMonitor();
	  if(!$scope.$$phase) {
		  $scope.$digest();
	  }
  });
  $scope.$on('disconnected',function(event, data) {
	  $scope.logged = $strophe.isLogged();
	  if(!$scope.$$phase) {
		  $scope.$digest();
	  }
  });
  $scope.showAddPopup = function() {
	$scope.addPopup = $ionicPopup.show({
		templateUrl: 'templates/add.html',
		title: 'Adicionar Usuário', 
		subTitle: 'O usuário precisará aceitar sua solicitação para que você possa enviar mensagens.',
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
  $scope.showBroadcastPopup = function() {
	$scope.broadcastPopup = $ionicPopup.show({
		templateUrl: 'templates/broadcast.html',
		title: 'Enviar Broadcast', 
		subTitle: 'Essa mensagem será enviada a todos usuários logados.',
		scope: $scope,
		buttons: [
		  { text: 'Cancelar',
			onTap: function(e) {
				$scope.broadcast.title = '';
				$scope.broadcast.message = '';
				$scope.broadcast.link = '';
			}
		  },
		  {
			text: 'Enviar',
			type: 'button-positive',
			onTap: function(e) {
			  if ($scope.broadcast.title == '' || $scope.broadcast.message == '') {
				//don't allow the user to close unless he enters user jid
				e.preventDefault();
			  } else {
				return $scope.sendBroadcast($scope.broadcast);
			  }
			}
		  }
		]
	});
  };
  $scope.hideBroadcastPopup = function() {
	$scope.broadcastPopup.close();
  };
  $scope.sendBroadcast = function(broadcast) {
	  if(broadcast) {
		  console.log("Broadcast\ntitle: " + broadcast.title + "\nmessage: " + broadcast.message + "\nlink: " + broadcast.link);
		  $scope.broadcastPopup.close();
		  $strophe.send_broadcast(broadcast);
		  $scope.broadcast = {title: '', message: '', link: '', time: ''};
		  return true;
	  }
	  return false;
  };
  $scope.$on('$ionicView.beforeEnter', function(e) {
    $ionicScrollDelegate.scrollTop(false);
	$scope.logged = $strophe.isLogged();
	$scope.monitor = $strophe.isMonitor();
	//console.log("STATE: " + $state.$current.name);
	//console.log("vireContentLoaded SCROLL!");
	//Chats.save(); //saves the chats array because the unread messages are now 0...
  });
  $scope.$on('$ionicView.enter', function(e) {
	  $rootScope.$broadcast('decBadge', {tab: 'tab.chats', qtt: 9999});//clears all chat notifications
  });
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicPopover, $getPlatform, $ionicPopup,
	                                   $ionicScrollDelegate, $strophe, $cordovaFileTransfer, $rootScope, $server, $cordovaFile,
	                                   $timeout, $localstorage,$cordovaFileOpener2, $ionicLoading, Upload, $state) {
  var SERVER_NAME = $server.name();
  $scope.chat = Chats.get($stateParams.chatId);
  $scope.textMessage = '';
  $scope.composing = false;
  $scope.isMobile = $getPlatform.isMobile();
  $scope.$on('newMsg',function(event, data) {
	  console.log(data.from);
	  if(data.from != 'me') {
		 if(!$scope.$$phase) {
		   $scope.$digest();
		 }
	  }
	  $ionicScrollDelegate.scrollBottom(false);
	  //console.log("scroll");
  });
  $ionicPopover.fromTemplateUrl('templates/my-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
	console.log("Abriu Popover.");
    console.log('isMobile ' + $scope.isMobile);
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
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
		  //Chats.addMessage($scope.chat.jid, $scope.textMessage, 'me'); // essa chamada está no $strophe.send_message agora, pra ficar tudo numa coisa só.
		  $scope.textMessage = '';
	  }
  };

  $scope.getmimetype = function(extension) {
    switch(extension){
      case 'jpg':
        mimetype = 'image/jpeg';
        break;
      case 'png':
        mimetype = 'image/png';
        break;
      case 'gif':
        mimetype = 'image/gif';
        break;
      case 'bmp':
        mimetype = 'image/bmp';
        break;
      case 'tif':
        mimetype = 'image/tiff';
        break;
      case '.xls':
        mimetype = 'application/excel';
      default: 
        mimetype = 'application/octet-stream';
    }
    return mimetype; 
  }
  
  $scope.showfullimagePopup = function(imageurl) {
  
    $scope.fullimage = { url: imageurl };

    $scope.fullimagePopup = $ionicPopup.show({
      cssClass: 'imgpopup',
      templateUrl: 'templates/fullimage-popover.html',
      scope: $scope,
      buttons: [{
        text: 'Fechar',
        type: 'button-positive',
        onTap: function(e) {
          $scope.fullimagePopup.close();
        }
      }]
    });
  };

  $scope.fullscreen = function(imageSrc){

  	var localimage = $localstorage.get(imageSrc);
	  console.log("localimage: " + localimage);

    var extension = imageSrc.split(".");
        extension = extension[1];

    var mimetype = $scope.getmimetype(extension);
    var isMobile = $getPlatform.isMobile();

    var url = "http://" + SERVER_NAME + "/uploads/" + imageSrc;
 
    console.log('Extension: ' + extension + ' Mimetype: ' + mimetype + ' Is Mobile? ' + isMobile);
    
    if(isMobile){
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 1000
      });

      if (!localimage) {
  	    console.log("entrei na área..");
  	    
        var targetPath = cordova.file.externalDataDirectory + imageSrc;  
        var options = {};
        var trustHosts = true;
            
        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
          .then(function(result) {
            // Success 	
      	    $localstorage.set(imageSrc, targetPath);
      	    console.log("Download Success: " + targetPath + "\n" + result);
            $ionicLoading.hide();
      	    $cordovaFileOpener2.open(targetPath,mimetype)
        }, function(err) {
            // Error
        	  console.log("Download Failed!" + JSON.stringify(err));
        }, function (progress) {
             $timeout(function () {
               downloadProgress = (progress.loaded / progress.total) * 100;
             })
        });   
      
      } else {
          console.log("localimage: " + localimage);
          $ionicLoading.hide();
          $cordovaFileOpener2.open(localimage,mimetype).then(function() {    	
            // file opened successfully
            console.log("File opened!");
          }, function(err) {
            // An error occurred. Show a message to the user
            console.log("Open failed." + JSON.stringify(err));
          });
        }
    } else {
        console.log('show popup');
        $scope.showfullimagePopup(url);
      }
  };

  $scope.thumbnail = function(thumb){

    var thumbnail = 'resized_' + thumb; 
    var localthumb = $localstorage.get(thumbnail);
    var url = "http://" + SERVER_NAME + "/uploads/" + thumbnail;
    var isMobile = $getPlatform.isMobile();

    if (isMobile){
      var targetPath = cordova.file.externalDataDirectory + thumbnail;
      var options = {};
      var trustHosts = true;
	    // console.log("localthumb: " + localthumb);

      if (!localthumb) {
        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
          .then(function(result) {
            // Success 	
            $ionicLoading.hide(); 
            $localstorage.set(thumbnail, targetPath);
          }, function(err) {
			         console.log(JSON.stringify(err));
               // Error
               // $ionicLoading.show({
               //     content: 'Falha ao baixar a imagem.',
               //     animation: 'fade-in',
               //     showBackdrop: false,
               //     maxWidth: 200,
               //     showDelay: 1000
               //   });
             }, function (progress) {
                  $ionicLoading.show({
                    content: 'Loading..',
                    animation: 'fade-in',
                    showBackdrop: false,
                    maxWidth: 200,
                    showDelay: 1000
                  });
                  $timeout(function () {
                    $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                  })
                });
      return url;
      } 
      return localthumb;
    } return url;
  };
  
  $scope.uploadImage = function(type) {
	$scope.closePopover();
    if(type == 0 || type == 1) {
      Upload.fileTo("http://" + SERVER_NAME + "/upload_script.php", type).then(
        function(res) {
          success = JSON.stringify(res);
          // Success
		      $strophe.send_message($scope.chat.jid, "[image:" + res + "]", 'me');
          console.log("[UploadCtrl] Success: " + success);
        }, function(err) {
             // Error
             console.log("[UploadCtrl] Error: " + err);
           });
    } else if (type == 2) {
        console.log('fire! $scope.openFileDialog()');
        ionic.trigger('click', { target: document.getElementById('file') });

        angular.element(document.getElementById('file')).on('change',function(event) {
          var file = event.target.files[0];
          var url = "http://" + SERVER_NAME + "/upload_script.php";
          var xhr = new XMLHttpRequest();
          var fd = new FormData(); 

          xhr.open("POST", url, true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
              // Every thing ok, file uploaded
              console.log("[UploadCtrl] Success: " + xhr.responseText );
              console.log('[sthophe.send]');
              $strophe.send_message($scope.chat.jid, "[image:" + xhr.responseText + "]", 'me');
              
            }
          };
          fd.append("upfile", file);
          xhr.send(fd);
          file.gambi();
        })
      }
	  };
	
  $scope.$on('$ionicView.beforeEnter', function(e) {
    $ionicScrollDelegate.scrollBottom(false);
	//console.log("vireContentLoaded SCROLL!");
	//Chats.save(); //saves the chats array because the unread messages are now 0...
  });

  $scope.$on('$ionicView.enter', function(e) {
    //$ionicScrollDelegate.scrollBottom(true);
	if($scope.chat != null) {
		$rootScope.$broadcast('decBadge', {tab: 'tab.chats', qtt: $scope.chat.unread});
		$scope.chat.unread= 0;
    }
	Chats.save(); //saves the chats array because the unread messages are now 0...
	//console.log("STATE: " + $state.$current.name);
  });

})

.controller('AccountCtrl', function($scope, $ionicPopup, $strophe, $localstorage, $state, $pushWoosh, Account, $getPlatform, $rootScope) {
  
  $scope.isMobile = $getPlatform.isMobile();
  $scope.settings = Account.all();
  $scope.logoff = function() {
	  $scope.logoffPopup.close();
	  $strophe.disconnect();
	  $pushWoosh.unregister(); //unregister device so it won't receive further notifications
	  console.log("Logged off.");
	  $strophe.setLogged(false); //a stanza de logoff já foi enviada no $strophe.disconnect
	  //$localstorage.remove("chats");//tem que manter o historico se o cara fizer logoff
	  //location.reload();
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
  $scope.setFriends = function(settings) {
	  Account.set('enableFriends',settings.enableFriends);
	  $scope.settings = Account.all();
  }
  $scope.setNotifications = function(settings) {
	  Account.set('enableNotifications',settings.enableNotifications);
	  $scope.settings = Account.all();
	  if(settings.enableNotifications) {
		  $pushWoosh.init();
		  $rootScope.$broadcast('newRoom', null);
		  $pushWoosh.setTag('JID', $localstorage.get('jid'));
	  } else {
		  $pushWoosh.unregister();
	  }
  }
  $scope.$on('$ionicView.enter', function(e) {
	//console.log("STATE: " + $state.$current.name);
  });
	
})