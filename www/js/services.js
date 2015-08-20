angular.module('starter.services', [])

.factory('Chats', function($localstorage, $rootScope) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    jid: 0,
    name: 'Uesley Lima',
    lastText: 'You on your way?',
	lastType: 'text',
    face: 'img/uesley.jpg',
	time: '09:50',
	status: 'online',
	unread: 1,
	msgs: []
  }, {
    jid: 1,
    name: 'Fabiana Hofer',
    lastText: 'Hey, it\'s me',
	lastType: 'text',
    face: 'img/fabi.jpg',
	time: '07:12',
	status: 'online',
	unread: 0,
	msgs: []
  }, {
    jid: 2,
    name: 'Paulo Vitor Pereira',
    lastText: 'I should buy a boat',
	lastType: 'text',
    face: 'img/paulo.jpg',
	time: 'Ontem',
	status: 'away',
	unread: 3,
	msgs: []
  }, {
    jid: 3,
    name: 'Paulo Victor Maluf',
    lastText: 'Look at my mukluks!',
	lastType: 'text',
    face: 'img/maluf.jpg',
	time: 'Ontem',
	status: 'away',
	unread: 0,
	msgs: []
  }, {
    jid: 4,
    name: 'Rafael Grisanti',
    lastText: 'This is wicked good ice cream. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa.',
	lastType: 'text',
    face: 'img/grisanti.jpg',
	time: '28/07/15',
	status: 'offline',
	unread: 7,
	msgs: []
  }];
  
  var rooms = [];
  
  var chatsScope = null;
  var currentChat = null;

  return {
    all: function() {
      return chats;
    },
	setChatsScope: function(sent) {
      chatsScope = sent;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
	  $localstorage.setObject("chats", chats);
    },
	setCurrent: function(chat) {
	  currentChat = chat;
	},
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].jid == chatId) {
          return chats[i];
        }
      }
      return null;
    },
	getRoom: function(room_id) {
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].jid == room_id) {
          return rooms[i];
        }
      }
      return null;
    },
	isComposing: function(from) {
		for (var i=0;i<chats.length;i++) {
		  if (chats[i].jid == from) {
			  chats[i].status = 'online';
			  if(chats[i].msgs.length>1 && chats[i].msgs[chats[i].msgs.length-1].type=='composing') {
				  chats[i].msgs.pop();
			  }
			  $localstorage.setObject("chats", chats);
			  var msg = {type: 'composing', content: 'está escrevendo...'};
			  chats[i].msgs.push(msg);
			  chats[i].lastText = 'está escrevendo...';
			  chats[i].lastType = 'composing';
			  $rootScope.$apply();
			  $rootScope.$broadcast('newMsg', {data: 'something'});
			  //var elem = document.getElementById('scrollDiv');
			  //elem.scrollTop = elem.scrollHeight;
			  //document.getElementById('bottom').scrollIntoView();
			  break;
		  }
	  }
	},

	addParticipant: function(room_id, participant) {
	  for(var i = 0; i < chats.length; i++) {
		  if(chats[i].jid == room_id) {
			  chats[i].participants.unshift(participant);
			  break;
		  }
	  }
	},

	addMessage: function(chat, message, from) {
		for (var i=0;i<chats.length;i++) {
		  if (chats[i].jid == chat) {
			  //chats[i].status = 'online';
			  if(chats[i].msgs.length>=1 && chats[i].msgs[chats[i].msgs.length-1].type=='composing') {
				  chats[i].msgs.pop(); // removes 'composing' status
			  }
			  var now = new Date();
			  var day = (now.getDate()<10)?'0'+now.getDate():now.getDate(); //adds left zero
			  var month = ((now.getMonth()+1)<10)?'0'+(now.getMonth()+1):(now.getMonth()+1); //adds left zero
			  var year = now.getFullYear()%100;
			  var hours = (now.getHours()<10)?'0'+now.getHours():now.getHours();//adds left zero
			  var minutes = (now.getMinutes()<10)?'0'+now.getMinutes():now.getMinutes(); //adds left zero
			  var seconds = (now.getSeconds()<10)?'0'+now.getSeconds():now.getSeconds(); //adds left zero
			  var fullTime = {day: day, month: month, year: year, hours: hours, minutes: minutes, seconds: seconds};
			  var type = 'text'; // change this to a if that reads the content of the message looking for the type of file

			  var audio_re = /\[audio:(.*)\]/g;
			  var image_re = /\[image:(.*)\]/g;
			  
			  if (audio_re.test(message)) {//tests whether the message is audio, image or text..
			    console.log("audio regexp");
			    message = message.replace(audio_re, "$1");
			    type = "audio";
				chats[i].lastText = 'Áudio';  
			  } else if (image_re.test(message)) {
			  	console.log("image regexp");
			  	message = message.replace(image_re, "$1");
			  	type = "image";
			  	chats[i].lastText = 'Imagem';         
			  } else {
				if(chats[i].is_room && chat == from) {
					type = 'notification';
				}
			  	chats[i].lastText = message;
			  }
			  
			  var msg = {type: type, content: message, time: fullTime, from: from};
			  chats[i].msgs.push(msg);
			  chats[i].lastType = type;
			  chats[i].time = fullTime; //sets the time of last msg received for display in the chats tab
       
			  if(currentChat != chats[i].jid) {
				  chats[i].unread++;
			  }
			  
			  //puts chat in first place, this way the newest messages will alwys be on top
			  chats.unshift(chats.splice(i,1)[0]);
			  //do not use chats[i] after this!! !! !! !! !! !! !! !! !! !! !! !!
			  
			  $localstorage.setObject("chats", chats);
			  if(from!='me') {
				$rootScope.$apply();
			  }
			  $rootScope.$broadcast('newMsg', {data: 'something'});

			  break;
		  }
	  }
	},
	setStatus: function(jid,status) {
      for (var i=0;i<chats.length;i++) {
		  if (chats[i].jid == jid) {
			  chats[i].status = status;
			  $localstorage.setObject("chats", chats);
			  $rootScope.$apply();
			  break;
		  }
	  }	  
    },
	insert: function(contact) {
		var found = false;
		for (i=0;i<chats.length;i++) {
			if(chats[i].jid == contact.jid) {
				chats[i].name = contact.name;
				chats[i].face = contact.face;
				//chats[i].status = contact.status;
				//doesn't reset unread nor msgs...
				found = true;
				break;
			}
		}
		if (!found) {
			chats.unshift(contact);
		}
		$localstorage.setObject("chats", chats);
	},
	insertRoom: function(room) {
		var found = false;
		for (i=0;i<rooms.length;i++) { // maybe this is not necessary here since this won't be saved.... or will it?
			if(rooms[i].jid == room.jid) {
				rooms[i].name = room.name;
				rooms[i].face = room.face;
				//chats[i].status = contact.status;
				//doesn't reset unread nor msgs...
				found = true;
				break;
			}
		}
		if (!found) {
			rooms.unshift(room);
			console.log('Room ' + room.name + ' found...');
		}
	},
	reset: function() {
		//console.log("reset");//TODO remove this later
		chats.splice(0,chats.length);
		console.log("chats reset to empty");
		if($localstorage.get("chats")) {
			local = $localstorage.getObject("chats");
			length = local.length;
			for(i=0;i<length;i++) {
				chats.unshift(local.pop());
				//console.log("Added one..");
			}
			console.log("chats reset to locally stored version");
		}
		//$rootScope.$apply();
	}
  };
})

.service('$strophe', function($localstorage, Chats) {
	
	var self = this;
	
	var SERVER_NAME = 'localhost';
	
	var BOSH_SERVICE = 'http://' + SERVER_NAME + ':7070/http-bind/';

	var connection = null;
	
	var scope = null;
	
	var pending_subscriber = null;
	  
	var user = {
	  jid: '',
	  password: '',
	  logged: false
	};
  
	this.isLogged = function() {
	  //var isLogged = getCookie("logged");
	  var log = $localstorage.get("logged");
	  if(log=="true") user.logged = true;
	  else user.logged = false;
	  return user.logged;
	};
	
	this.setLogged = function(bool, jid) {
	  user.logged = bool;
	  //setCookie("logged",bool,10);//10 dias expira
	  $localstorage.set("logged",bool);
	  if(bool) {
		user.jid = jid;
		$localstorage.set("jid",user.jid);
	  }
	  else $localstorage.set("jid","");
	};
	
	this.connected = function () {
		//console.log("connected called");
		var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
		connection.sendIQ(iq,self.on_roster);
		connection.addHandler(self.on_roster_changed,"jabber:iq:roster", "iq", "set");
		connection.addHandler(self.on_message,null, "message", "chat");
		connection.addHandler(self.on_group_message,null, "message", "groupchat");
	}
	
	this.connect = function (ev, data) {
		var conn = new Strophe.Connection(BOSH_SERVICE,{'keepalive': true});
		conn.connect(data.jid, data.password, function (status) {
		  switch (status) {
			case Strophe.Status.ERROR:
			  console.log('[Connection] Error');
			  break;
			case Strophe.Status.CONNECTING:
			  console.log('[Connection] Connecting');
			  break;
			case Strophe.Status.CONNFAIL:
			  console.log('[Connection] Failed to connect');
			  connectFailed();
			  break;
			case Strophe.Status.AUTHENTICATING:
			  console.log('[Connection] Authenticating');
			  break;
			case Strophe.Status.AUTHFAIL:
			  console.log('[Connection] Unauthorized');
			  break;
			case Strophe.Status.CONNECTED:
			  console.log("[Connection] CONNECTED");
			  connection = conn;
			  self.setLogged(true,data.jid);
			  self.connected();
			  Chats.reset();
			  break;
			case Strophe.Status.DISCONNECTED:
			  connection = conn;
			  self.setLogged(false);
			  console.log('[Connection] DISCONNECTED');
			  break;
			case Strophe.Status.DISCONNECTING:
			  console.log('[Connection] Disconnecting');
			  break;
			case Strophe.Status.ATTACHED:
			  console.log('[Connection] RECONNECTED');
			  connection = conn;
			  self.setLogged(true,jid);
			  self.connected();
			  Chats.reset();
			  break;
		  }
		});
	};
	
	this.reconnect = function (jid) {
		var conn = new Strophe.Connection(BOSH_SERVICE,{'keepalive': true});
		  
		  //first tries to restore a previous connection
		try {
			conn.restore(jid, function (status) {
				switch (status) {
					case Strophe.Status.ERROR:
					  console.log('[Connection] Error');
					  break;
					case Strophe.Status.CONNECTING:
					  console.log('[Connection] Connecting');
					  break;
					case Strophe.Status.CONNFAIL:
					  console.log('[Connection] Failed to connect');
					  connectFailed();
					  break;
					case Strophe.Status.AUTHENTICATING:
					  console.log('[Connection] Authenticating');
					  break;
					case Strophe.Status.AUTHFAIL:
					  console.log('[Connection] Unauthorized');
					  break;
					case Strophe.Status.CONNECTED:
					  console.log("[Connection] CONNECTED");
					  connection = conn;
					  self.setLogged(true,jid);
					  self.connected();
					  Chats.reset();
					  break;
					case Strophe.Status.DISCONNECTED:
					  console.log('[Connection] DISCONNECTED');
					  connection = conn;
					  self.setLogged(false);
					  break;
					case Strophe.Status.DISCONNECTING:
					  console.log('[Connection] Disconnecting');
					  break;
					case Strophe.Status.ATTACHED:
					  console.log('[Connection] RECONNECTED');
					  connection = conn;
					  self.setLogged(true,jid);
					  self.connected();
					  Chats.reset();
					  break;
				}
			});
		} catch(e) {//TODO here the login popup should open again
			console.log("COULD NOT RESTORE CONNECTION.");
			self.setLogged(false);
		}
	};
	
	this.on_roster = function(iq) {
		//
		console.log("on_roster ...");
		console.log(iq);
		//Chats.reset();
		$(iq).find('item').each(function () {
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid.substring(0,jid.indexOf('@'));
			var contact = {
				is_room: false,
				jid: jid,
				name: name,
				face: 'img/uesley.jpg',
				status: 'offline',
				unread: 0,
				lastText: '',
				lastType: 'composing',
				time: '',
				msgs: []
			}
            Chats.insert(contact);
        });

        // set up presence handler and send initial presence
		self.presence();
		return true;
	};
	
	this.presence = function() {
		connection.addHandler(self.on_presence, null, "presence");
        connection.send($pres());
		//query all rooms
		var iq = $iq({type: 'get', to: 'conference.'+SERVER_NAME}).c('query', {xmlns: 'http://jabber.org/protocol/disco#items'});
		connection.sendIQ(iq,self.on_room_list);
		//Register to all rooms...
		//connection.send($pres({to: "teste@conference.localhost/" + user.jid.substring(0,user.jid.indexOf('@'))}).c('x', {xmlns: "http://jabber.org/protocol/muc"}));
	};
	
	this.on_room_list = function(iq) {
		console.log("On room list...");
		console.log(iq);
		
		$(iq).find('item').each(function () {
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid.substring(0,jid.indexOf('@'));
			var room = {
				is_room: true,
				jid: jid,
				name: name,
				face: 'img/room.png',
				status: 'online',
				unread: 0,
				lastText: '',
				lastType: 'composing',
				time: '',
				msgs: [],
				participants: []
			}
			//inserts room in a temporary rooms list
            Chats.insertRoom(room);
			//sends presence to try to enter room, the response will be receive by on_presence
			console.log('Sending presence to room ' + jid);
			connection.send($pres({to: room.jid + '/' + user.jid.substring(0,user.jid.indexOf('@'))}).c('x', {xmlns: "http://jabber.org/protocol/muc"}));
        });		
		
		return true;
	}
	
	this.on_roster_changed = function(iq) {
		//
		console.log("on_roster_changed...");
		console.log(iq);
		return true;
	};
	
	this.send_message = function(jid, body, from) {
		var message = '';
		if(jid.indexOf('@conference')!=-1) {
			message = $msg({to: jid, type: 'groupchat'}).c('body').t(body);
		}
		else {
			message = $msg({to: jid, type: 'chat'}).c('body').t(body).up()
                .c('active', {xmlns: "http://jabber.org/protocol/chatstates"});
		}
		if(message != '') {
			connection.send(message);
			Chats.addMessage(jid, body, from);
		}
		return true;
	};
	
	this.send_composing = function(jid) {
		var notify = $msg({to: jid, "type": "chat"}).c('composing', {xmlns: "http://jabber.org/protocol/chatstates"});
        connection.send(notify);
		return true;
	};
	
	this.on_message = function(message) {
		//
		console.log("on_message arrived...");
		console.log(message);

		var full_jid = $(message).attr('from');
		var jid = full_jid.substring(0,full_jid.indexOf('/'));
        var composing = $(message).find('composing');
        if (composing.length > 0) {
			console.log(jid + " is composing...");
            Chats.isComposing(jid);
        }
		
        var body = $(message).find("html > body");

        if (body.length === 0) {
            body = $(message).find('body');
            if (body.length > 0) {
                body = body.text()
            } else {
                body = null;
            }
        } else {
            body = body.contents();
        }

        if (body) {
			Chats.addMessage(jid,body,jid);//(qual chat, conteudo, remetente)
        }		
		
		return true;
	};
	
	this.on_group_message = function(message) {
		//
		console.log("on_group_message arrived...");
		console.log(message);
		var room_id = '';
		var user_id = '';

		var full_jid = $(message).attr('from'); //gets full jid e.g. master@conferece.paulovitorjp.com/admin
		var barra = full_jid.indexOf('/'); //gets slash position
		if(barra!=-1) { //if there's a slash, gets room id and user id
			room_id = full_jid.substring(0,barra);
			if(full_jid.length > barra+1) {//checks whether there is something after the slash
				user_id = full_jid.substring(barra+1, full_jid.length);
			}
		} else { // if there isn't a slash gets only room id (it's a room notification)
			room_id = full_jid;
			user_id = '';
		}
		
		var body = $(message).children('body').text();

        if (body) {
			Chats.addMessage(room_id,body,user_id);//(qual chat, conteudo, remetente)
        }		
		
		return true;
	};
	
	this.on_presence = function(presence) {
		
		console.log("on_presence arrived...");
		console.log(presence);
		
		var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
		var status = "offline";
		var room_id  = '';
		var jid = '';
        //var jid_id = Gab.jid_to_id(from);
		
		if(from.indexOf('@conference') != -1) { //if presence from user in a room
			room_id = from.substring(0,from.indexOf('/'));
			jid = from.substring(from.indexOf('/')+1, from.length);
			if (ptype !== 'error') { // if it is not error you have access to the room
				var room = Chats.getRoom(room_id); // recovers room from temporary array
				var presence_x = $(presence).find('item');
				var room_user = null;
				if(presence_x.length > 0) {
					presence_x = presence_x[0];
					var affiliation = $(presence_x).attr('affiliation');
					var role = $(presence_x).attr('role');
					room_user = {jid: jid, affiliation: affiliation, role: role};
				} else {
					room_user = {jid: jid, affiliation: '', role: ''};
				}
				console.log(JSON.stringify(room_user));
				Chats.insert(room);
				Chats.addParticipant(room_id, room_user);
			}
		} else { //if presence from user
			if (ptype === 'subscribe') {
				// populate pending_subscriber, the approve-jid span, and
				// open the dialog
				pending_subscriber = from;
				//$('#approve-jid').text(Strophe.getBareJidFromJid(from));
				//$('#approve_dialog').dialog('open');
				//TODO Add an entry to the approval vector
			} else if (ptype !== 'error') {
				if (ptype === 'unavailable') {
					status = "offline";
				} else {
					var show = $(presence).find("show").text();
					if (show === "" || show === "chat") {
						status = "online";
					} else {
						status = "away";
					}
				}
				jid = from.substring(0,from.indexOf('/'));
				console.log(jid + " is " + status);
				Chats.setStatus(jid,status);
			}
			
		}

        return true;
	};
})

.factory('Upload', function($q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $localstorage, $timeout, $ionicLoading) {
  
    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    return {
      fileTo: function(serverURL, type) {
      var deferred = $q.defer();

      if (ionic.Platform.isWebView()) {
        var source;
        switch (type) {
          case 0:
            source = Camera.PictureSourceType.CAMERA;
            break;
          case 1:
            source = Camera.PictureSourceType.PHOTOLIBRARY;
            break;
        }

        var options =   {
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: source,
          allowEdit: false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          quality: 100,
        }

        $cordovaCamera.getPicture(options).then(

          function(fileURL) {
          	var uploadOptions = new FileUploadOptions();
            uploadOptions.fileKey = "upfile";
            uploadOptions.fileName = makeid() + fileURL.substr(fileURL.lastIndexOf('/') + 1).replace('%','');
            uploadOptions.mimeType = "image/jpeg";
            uploadOptions.chunkedMode = false;

            uploadOptions.fileName = uploadOptions.fileName.split(".");
            uploadOptions.fileName = uploadOptions.fileName[0]+".jpg";

            $cordovaFileTransfer.upload(serverURL, fileURL, uploadOptions).then(
              function(result) {
              	$ionicLoading.hide();
                deferred.resolve(uploadOptions.fileName);
              }, function(err) {
              	$ionicLoading.show({
                     content: 'Falha no envio da imagem.',
                     animation: 'fade-in',
                     showBackdrop: true,
                     maxWidth: 200,
                     showDelay: 1000
                });
                deferred.reject(err);
                $ionicLoading.show();
              }, function (progress) {
              	   $ionicLoading.show({
                     content: 'Enviando...',
                     animation: 'fade-in',
                     showBackdrop: true,
                     maxWidth: 200,
                     showDelay: 1000
                   });
                   $timeout(function () {
                     downloadProgress = (progress.loaded / progress.total) * 100;
                   })
                 });
          }, function(err){
            deferred.reject(err);
          });
      }
      else {
        deferred.reject('Uploading not supported in browser');
      }
      return deferred.promise;
        }
    }
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
	remove: function(key) {
		$window.localStorage.removeItem(key);
	}
  }
}]);