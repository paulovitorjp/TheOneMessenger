angular.module('starter.services', [])

.factory('Chats', function($localstorage) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    jid: 0,
    name: 'Uesley Lima',
    lastText: 'You on your way?',
    face: 'img/uesley.jpg',
	time: '09:50',
	status: 'online',
	unread: 1,
	msgs: []
  }, {
    jid: 1,
    name: 'Fabiana Hofer',
    lastText: 'Hey, it\'s me',
    face: 'img/fabi.jpg',
	time: '07:12',
	status: 'online',
	unread: 0,
	msgs: []
  }, {
    jid: 2,
    name: 'Paulo Vitor Pereira',
    lastText: 'I should buy a boat',
    face: 'img/paulo.jpg',
	time: 'Ontem',
	status: 'away',
	unread: 3,
	msgs: []
  }, {
    jid: 3,
    name: 'Paulo Victor Maluf',
    lastText: 'Look at my mukluks!',
    face: 'img/maluf.jpg',
	time: 'Ontem',
	status: 'away',
	unread: 0,
	msgs: []
  }, {
    jid: 4,
    name: 'Rafael Grisanti',
    lastText: 'This is wicked good ice cream. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa.',
    face: 'img/grisanti.jpg',
	time: '28/07/15',
	status: 'offline',
	unread: 7,
	msgs: []
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].jid == chatId) {
          return chats[i];
        }
      }
      return null;
    },
	insert: function(contact) {
		var found = false;
		for (i=0;i<chats.length;i++) {
			if(chats[i].jid == contact.jid) {
				chats[i] = contact;
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
		chats = [];
		console.log("chats reset to empty");
		if($localstorage.get("chats")) {
			chats = $localstorage.getObject("chats");
			console.log("chats reset to locally stored version");
		}
	}
  };
})

.service('$strophe', function($localstorage, Chats) {
	
	var self = this;
	
	var BOSH_SERVICE = 'http://paulovitorjp.com:7070/http-bind/';

	var connection = null;
	  
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
				console.log("CONNECTED!");
				self.setLogged(true,data.jid);
				self.connected();
				Chats.reset();
				//$(document).trigger('connected');
			} else if (status === Strophe.Status.DISCONNECTED) {
				console.log("DISCONNECTED!");
				self.setLogged(false);
				//$(document).trigger('disconnected');
			}
		});
		connection = conn;
	};
	
	this.reconnect = function (jid) {
		var conn = new Strophe.Connection(BOSH_SERVICE,{'keepalive': true});
		  
		  //first tries to restore a previous connection
		try {
		conn.restore(jid, function (status) {
			if (status === Strophe.Status.CONNECTED) {
				console.log("CONNECTED");
				self.setLogged(true,jid);
				self.connected();
				Chats.reset();
				//$(document).trigger('connected');
			} else if (status === Strophe.Status.DISCONNECTED) {
				console.log("DISCONNECTED!");
				self.setLogged(false);
				//$(document).trigger('disconnected');
			} else if (status === Strophe.Status.ATTACHED){
				console.log("RECONNECTED");
				self.setLogged(true,jid);
				Chats.reset();
				self.connected();
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
				msgs: []
			}
            Chats.insert(contact);
        });

        // set up presence handler and send initial presence
        //connection.addHandler(Gab.on_presence, null, "presence");
        //connection.send($pres());
	};
	
	this.on_roster_changed = function() {
		//
		console.log("on_roster_changed...");
	};
	
	this.on_message = function() {
		//
		console.log("on_message arrived...");
	};
	
	this.on_presence = function(presence) {
		/**
		console.log("on_presence arrived...");
		var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
        var jid_id = Gab.jid_to_id(from);

        if (ptype === 'subscribe') {
            // populate pending_subscriber, the approve-jid span, and
            // open the dialog
            Gab.pending_subscriber = from;
            $('#approve-jid').text(Strophe.getBareJidFromJid(from));
            $('#approve_dialog').dialog('open');
        } else if (ptype !== 'error') {
            var contact = $('#roster-area li#' + jid_id + ' .roster-contact')
                .removeClass("online")
                .removeClass("away")
                .removeClass("offline");
            if (ptype === 'unavailable') {
                contact.addClass("offline");
            } else {
                var show = $(presence).find("show").text();
                if (show === "" || show === "chat") {
                    contact.addClass("online");
                } else {
                    contact.addClass("away");
                }
            }

            var li = contact.parent();
            li.remove();
            Gab.insert_contact(li);
        }

        // reset addressing for user since their presence changed
        var jid_id = Gab.jid_to_id(from);
        $('#chat-' + jid_id).data('jid', Strophe.getBareJidFromJid(from));

        return true;**/
	};
  }
)

.factory('FileService', function() {
  console.log("[FileService]");
  var images;
  var IMAGE_STORAGE_KEY = 'images';
 
  function getImages() {
  	console.log("[FileService] getImages");
    var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
    if (img) {
      images = JSON.parse(img);
    } else {
      images = [];
    }
    return images;
  };
 
  function addImage(img) {
  	console.log("[FileService] addImage");
    images.push(img);
    window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
  };

  return {
    storeImage: addImage,
    images: getImages
  }
})

.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile, $cordovaFileTransfer) {
 
  function makeid() {
  	console.log("[ImageService] makeid");
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
 
  function optionsForType(type) {
  	console.log("[ImageService] optionsForType");
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }
 
  function uploadMedia(name, filepath){
    console.log("[uploadmedia]");
    var url = "http://paulovitorjp.com:8000";
    var options = {
          fileKey: 'upfile',
          fileName: name,
          chunkedMode: true,
          mimeType: 'image/jpeg'
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

  function saveMedia(type) {
  	console.log("[ImageService] saveMedia");
    return $q(function(resolve, reject) {
      var options = optionsForType(type);
 
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        var newName = makeid() + name;
        console.log("[saveMedia]\nname: " + name + "\nnamePath: " + namePath + "\nnewName: " + newName + "\nDataDirectory: " + cordova.file.dataDirectory );
        uploadMedia(newName, namePath + newName);
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            FileService.storeImage(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia
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