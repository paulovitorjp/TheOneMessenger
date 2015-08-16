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
			  chatsScope.$apply();
			  $rootScope.$broadcast('newMsg', {data: 'something'});
			  //var elem = document.getElementById('scrollDiv');
			  //elem.scrollTop = elem.scrollHeight;
			  //document.getElementById('bottom').scrollIntoView();
			  break;
		  }
	  }
	},
	addMessage: function(chat, message, from) {
		for (var i=0;i<chats.length;i++) {
		  if (chats[i].jid == chat) {
			  //chats[i].status = 'online';
			  if(chats[i].msgs.length>=1 && chats[i].msgs[chats[i].msgs.length-1].type=='composing') {
				  chats[i].msgs.pop();
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
			  var msg = {type: type, content: message, time: fullTime, from: from};
			  chats[i].msgs.push(msg);
			  chats[i].lastText = message;
			  chats[i].lastType = type;
			  chats[i].time = fullTime;//sets the time of last msg received for display in the chats tab
			  if(currentChat != chats[i].jid) {
				  chats[i].unread++;
			  }
			  $localstorage.setObject("chats", chats);
			  if(from!='me') {
				chatsScope.$apply();
			  }
			  $rootScope.$broadcast('newMsg', {data: 'something'});
			  //var elem = document.getElementById('scrollDiv');
			  //elem.scrollTop = elem.scrollHeight;
			  //$("#scrollDiv").scrollTop = $("#scrollDiv").scrollHeight;
			  break;
		  }
	  }
	},
	setStatus: function(jid,status) {
      for (var i=0;i<chats.length;i++) {
		  if (chats[i].jid == jid) {
			  chats[i].status = status;
			  $localstorage.setObject("chats", chats);
			  chatsScope.$apply();
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
				chats[i].status = contact.status;
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
		chatsScope.$apply();
	}
  };
})

.service('$strophe', function($localstorage, Chats) {
	
	var self = this;
	
	var BOSH_SERVICE = 'http://paulovitorjp.com:7070/http-bind/';

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
	}
	
	this.connect = function (ev, data) {
		var conn = new Strophe.Connection(BOSH_SERVICE,{'keepalive': true});

		conn.connect(data.jid, data.password, function (status) {
			if (status === Strophe.Status.CONNECTED) {
				connection = conn;
				console.log("CONNECTED!");
				self.setLogged(true,data.jid);
				self.connected();
				Chats.reset();
				//$(document).trigger('connected');
			} else if (status === Strophe.Status.DISCONNECTED) {
				connection = conn;
				console.log("DISCONNECTED!");
				self.setLogged(false);
				//$(document).trigger('disconnected');
			}
		});
	};
	
	this.reconnect = function (jid) {
		var conn = new Strophe.Connection(BOSH_SERVICE,{'keepalive': true});
		  
		  //first tries to restore a previous connection
		try {
		conn.restore(jid, function (status) {
			if (status === Strophe.Status.CONNECTED) {
				connection = conn;
				console.log("CONNECTED");
				self.setLogged(true,jid);
				self.connected();
				//self.presence();
				Chats.reset();
				//$(document).trigger('connected');
			} else if (status === Strophe.Status.DISCONNECTED) {
				connection = conn;
				console.log("DISCONNECTED!");
				self.setLogged(false);
				//$(document).trigger('disconnected');
			} else if (status === Strophe.Status.ATTACHED){
				connection = conn;
				console.log("RECONNECTED");
				self.setLogged(true,jid);
				self.connected();
				Chats.reset();
				//self.presence();
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
            var name = $(this).attr('name') || jid;

            // transform jid into an id
            //var jid_id = Gab.jid_to_id(jid);
			
			var contact = {
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
	};
	
	this.on_roster_changed = function() {
		//
		console.log("on_roster_changed...");
		return true;
	};
	
	this.on_message = function(message) {
		//
		console.log("on_message arrived...");
		console.log(message);
		/**
		var full_jid = $(message).attr('from');
        var jid = Strophe.getBareJidFromJid(full_jid);
        var jid_id = Gab.jid_to_id(jid);

        if ($('#chat-' + jid_id).length === 0) {
            $('#chat-area').tabs('add', '#chat-' + jid_id, jid);
            $('#chat-' + jid_id).append(
                "<div class='chat-messages'></div>" +
                "<input type='text' class='chat-input'>");
        }
        
        $('#chat-' + jid_id).data('jid', full_jid);

        $('#chat-area').tabs('select', '#chat-' + jid_id);
        $('#chat-' + jid_id + ' input').focus();
		**/
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

            /**var span = $("<span></span>");
            body.each(function () {
                if (document.importNode) {
                    $(document.importNode(this, true)).appendTo(span);
                } else {
                    // IE workaround
                    span.append(this.xml);
                }
            });

            body = span;**/
        }

        if (body) {
            // remove notifications since user is now active
            //$('#chat-' + jid_id + ' .chat-event').remove();

            // add the new message
        /**    $('#chat-' + jid_id + ' .chat-messages').append(
                "<div class='chat-message'>" +
                "&lt;<span class='chat-name'>" +
                Strophe.getNodeFromJid(jid) +
                "</span>&gt;<span class='chat-text'>" +
                "</span></div>");

            $('#chat-' + jid_id + ' .chat-message:last .chat-text')
                .append(body);

            Gab.scroll_chat(jid_id);**/
			Chats.addMessage(jid,body,jid);//(qual chat, conteudo, tipo, remetente)
        }		
		
		return true;
	};
	
	this.on_presence = function(presence) {
		
		console.log("on_presence arrived...");
		
		var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
		var status = "offline";
        //var jid_id = Gab.jid_to_id(from);

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
			var jid = from.substring(0,from.indexOf('/'));
			console.log(jid + " is " + status);
			Chats.setStatus(jid,status);
        }

        // reset addressing for user since their presence changed
        //var jid_id = Gab.jid_to_id(from);
        //$('#chat-' + jid_id).data('jid', Strophe.getBareJidFromJid(from));

        return true;
	};
  }
)

.factory('Upload', function($q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer) {

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
          quality: 100
        }

        $cordovaCamera.getPicture(options).then(

          function(fileURL) {

            var uploadOptions = new FileUploadOptions();
            uploadOptions.fileKey = "upfile";
            uploadOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            uploadOptions.mimeType = "image/jpeg";
            uploadOptions.chunkedMode = false;

            $cordovaFileTransfer.upload(serverURL, fileURL, uploadOptions).then(
              function(result) {
                deferred.resolve(result);
              }, function(err) {
                deferred.reject(err);
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