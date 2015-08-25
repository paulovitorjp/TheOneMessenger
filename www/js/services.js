angular.module('starter.services', [])

.factory('Chats', function($localstorage, $rootScope, $state, $stateParams) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    jid: 0,
    name: 'Uesley Lima',
	subscription: 'both',
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
	subscription: 'both',
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
	subscription: 'both',
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
	subscription: 'both',
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
	subscription: 'both',
    lastText: 'This is wicked good ice cream. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa.',
	lastType: 'text',
    face: 'img/grisanti.jpg',
	time: '28/07/15',
	status: 'offline',
	unread: 7,
	msgs: []
  }];
  
  var rooms = [];
  
  //var subscriptions = [];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
	  $localstorage.setObject("chats", chats);
	  $rootScope.$broadcast('updateChats', {data: 'something'});
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
			  $rootScope.$broadcast('updateChats', {data: 'something'});
			  $rootScope.$broadcast('newMsg', {from: from});
			  //var elem = document.getElementById('scrollDiv');
			  //elem.scrollTop = elem.scrollHeight;
			  //document.getElementById('bottom').scrollIntoView();
			  break;
		  }
	  }
	},

	addParticipant: function(room_id, participant) {
	  var found = false;
	  for(var i = 0; i < chats.length; i++) {
		  if(chats[i].jid == room_id) {
			  for(var j = 0; j < chats[i].participants.length; j++) {
				  if(chats[i].participants[j].jid == participant.jid) {
					  chats[i].participants[j].affiliation = participant.affiliation;
					  chats[i].participants[j].role = participant.role;
					  $localstorage.setObject("chats", chats);
					  found = true;
					  break;
				  }
			  }
			  if(!found) {
				chats[i].participants.unshift(participant);
				$localstorage.setObject("chats", chats);
			  }
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
       
			  if($stateParams.chatId != chats[i].jid || $state.$current.name != 'tab.chat-detail') {
				      console.log("adding unread counter");
					  chats[i].unread++;
					  $rootScope.$broadcast('incBadge', {tab: 'tab.chats'});
			  }
			  
			  //puts chat in first place, this way the newest messages will alwys be on top
			  chats.unshift(chats.splice(i,1)[0]);
			  //do not use chats[i] after this!! !! !! !! !! !! !! !! !! !! !! !!
			  
			  $localstorage.setObject("chats", chats);
			  $rootScope.$broadcast('updateChats', {data: 'something'});
			  $rootScope.$broadcast('newMsg', {from: msg.from });

			  break;
		  }
	  }
	},
	setStatus: function(jid,status) {
      for (var i=0;i<chats.length;i++) {
		  if (chats[i].jid == jid) {
			  chats[i].status = status;
			  $localstorage.setObject("chats", chats);
			  $rootScope.$broadcast('updateChats', {data: 'something'});
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
				chats[i].subscription = contact.subscription;
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
		$rootScope.$broadcast('updateChats', {data: 'something'});
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
		if($localstorage.getObject("chats")) {
			local = $localstorage.getObject("chats");
			length = local.length;
			for(i=0;i<length;i++) {
				chats.unshift(local.pop());
				//this way the pointer the controllers have to chats will be kept
			}
			console.log("chats reset to locally stored version");
		}
		/*subscriptions is not accessed by controllers so there's no need to keep the pointer
		if($localstorage.get("subscriptions")) {
			subscriptions = $localstorage.getObject("subscriptions");
		}*/
		
		//$rootScope.$apply();
	},
	save: function() {
		$localstorage.setObject("chats", chats);
	}/*,
	addSubscription: function(user) {
		var found = false;
		for(var i = 0; i < subscriptions.length; i++) {
			if(subscriptions[i].jid == user.jid) {
				subscriptions.name = user.name;
				found = true;
				$localstorage.setObject("subscriptions", subscriptions);
				break;
			}
		}
		if(!found) {
			subscriptions.unshift(user);
			$localstorage.setObject("subscriptions", subscriptions);
		}
	},
	getSubscription: function(jid) {
		for(var i = 0; i < subscriptions.length; i++) {
			if(subscriptions[i].jid == jid) {
				return subscriptions[i];
			}
		}
		return null;
	},
	delSubscription: function(jid) {
		for(var i = 0; i < subscriptions.length; i++) {
			if(subscriptions[i].jid == jid) {
				subscriptions.splice(i,1);
				$localstorage.setObject("subscriptions", subscriptions);
				break;
			}
		}
	}*/
  };
})

.factory('Dashboard', function($localstorage, $rootScope, $state) {
  // Might use a resource here that returns a JSON array
  var iterator = 3;

  // Some fake testing data
  var cards = [{
	  id: 2,
	  type: 'subscribe',
	  title: 'Solicitação de Amizade',
	  jid: 'miguel@paulovitorjp.com',
	  name: 'Miguel',
	  time: {day: '15', month: '01', year: '15', hours: '12', minutes: '01', seconds: '30'}
    }, {
      id: 1,
	  type: 'broadcast',
	  title: 'Comentário de Abertura',
	  text: 'O comentário de abertura iniciará em 5 minutos.',
	  name: 'uesley',
	  link: 'http://www.google.com',
	  time: {day: '14', month: '01', year: '15', hours: '09', minutes: '45', seconds: '30'}
    }, {
	  id: 0,
	  type: 'broadcast',
	  title: 'Comentário de Fechamento',
	  text: 'O comentário de fechamento iniciará em 5 minutos.',
	  name: 'uesley',
	  link: 'http://www.google.com',
	  time: {day: '13', month: '01', year: '15', hours: '16', minutes: '45', seconds: '30'}
    }];
  
  return {
    all: function() {
      return cards;
    },
    remove: function(card) {
      cards.splice(cards.indexOf(card), 1);
	  $localstorage.setObject("cards", cards);
    },
    get: function(cardId) {
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].id == cardId) {
          return cards[i];
        }
      }
      return null;
    },
	addCard: function(type, from, data) {
      var card = '';
	  
	  var now = new Date();
	  var day = (now.getDate()<10)?'0'+now.getDate():now.getDate(); //adds left zero
	  var month = ((now.getMonth()+1)<10)?'0'+(now.getMonth()+1):(now.getMonth()+1); //adds left zero
	  var year = now.getFullYear()%100;
	  var hours = (now.getHours()<10)?'0'+now.getHours():now.getHours();//adds left zero
	  var minutes = (now.getMinutes()<10)?'0'+now.getMinutes():now.getMinutes(); //adds left zero
	  var seconds = (now.getSeconds()<10)?'0'+now.getSeconds():now.getSeconds(); //adds left zero
	  var fullTime = {day: day, month: month, year: year, hours: hours, minutes: minutes, seconds: seconds};
	  
	  if(type == 'subscribe') {
		  var name = from.substring(0,from.indexOf('@'));
		  iterator++;
		  card = {
			  id: iterator,
			  type: 'subscribe',
			  title: 'Solicitação de Amizade',
			  jid: from,
			  name: name,
			  time: fullTime
		  }
	  } else if(type == 'broadcast') {
		  console.log("recebendo BROADCAST...");
		  iterator++;
		  card = {
		    id: iterator,
		    type: 'broadcast',
		    title: data.title,
		    text: data.message,
			name: from,
		    link: data.link,
		    time: data.time || fullTime
		  }
	  }
	  if(card != '') {
		console.log(JSON.stringify(card));
		cards.unshift(card);
		$localstorage.setObject("cards", cards);
	    $rootScope.$broadcast('updateDashboard', {data: 'something'});
		if($state.$current.name != 'tab.dash') {
			$rootScope.$broadcast('incBadge', {tab: 'tab.dash'});
		}
	  }
    }
  };
})

.service('$strophe', function($localstorage, Chats, Dashboard, $rootScope) {
	
	var self = this;
	
	var SERVER_NAME = 'paulovitorjp.com';
	
	var BOSH_SERVICE = 'http://' + SERVER_NAME + ':7070/http-bind/';

	var connection = null;
	
	var scope = null;
	
	var pending_subscriber = null;
	  
	var user = {
	  jid: '',
	  password: '',
	  logged: false,
	  isMonitor: false
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
	
	this.isMonitor = function() {
	  return user.isMonitor;
	};
	
	this.connected = function () {
		//console.log("connected called");
		var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
		connection.sendIQ(iq,self.on_roster);
		connection.addHandler(self.on_roster_changed,"jabber:iq:roster", "iq", "set");
		connection.addHandler(self.on_message,null, "message", "chat");
		connection.addHandler(self.on_group_message,null, "message", "groupchat");
		connection.addHandler(self.on_broadcast,null, "message", null);
	}
	
	this.disconnect = function () {
		//console.log("connected called");
		connection.disconnect();
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
			  //connectFailed();
			  break;
			case Strophe.Status.AUTHENTICATING:
			  console.log('[Connection] Authenticating');
			  break;
			case Strophe.Status.AUTHFAIL:
			  $rootScope.$broadcast('relogin', {unauthorized: true});
			  console.log('[Connection] Unauthorized');
			  //broadcast
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
			  $rootScope.$broadcast('disconnected', {data: 'something'});
			  $rootScope.$broadcast('relogin', {unauthorized: false});
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
					  //connectFailed();
					  break;
					case Strophe.Status.AUTHENTICATING:
					  console.log('[Connection] Authenticating');
					  break;
					case Strophe.Status.AUTHFAIL:
					  $rootScope.$broadcast('relogin', {unauthorized: true});
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
					  $rootScope.$broadcast('disconnected', {data: 'something'});
					  $rootScope.$broadcast('relogin', {unauthorized: false});
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
	
	this.attach = function(jid, sid, rid) {
		var conn = new Strophe.Connection(BOSH_SERVICE,{'keepalive': true});
		  //first tries to restore a previous connection
		try {
			conn.attach(jid, sid, rid, function(status) {
				switch (status) {
					case Strophe.Status.ERROR:
					  console.log('[Connection] Error');
					  break;
					case Strophe.Status.CONNECTING:
					  console.log('[Connection] Connecting');
					  break;
					case Strophe.Status.CONNFAIL:
					  console.log('[Connection] Failed to connect');
					  //connectFailed();
					  break;
					case Strophe.Status.AUTHENTICATING:
					  console.log('[Connection] Authenticating');
					  break;
					case Strophe.Status.AUTHFAIL:
					  $rootScope.$broadcast('relogin', {unauthorized: true});
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
					  $rootScope.$broadcast('disconnected', {data: 'something'});
					  $rootScope.$broadcast('relogin', {unauthorized: false});
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
			console.log("COULD NOT ATTACH CONNECTION.");
			self.setLogged(false);
		}
	};
	
	this.on_roster = function(iq) {
		//when user is logged and receives the roster, saves the session in localstorage for reconnect later.
		
		console.log("on_roster ...");
		console.log(iq);
		//Chats.reset();
		$(iq).find('item').each(function () {
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid.substring(0,jid.indexOf('@'));
			var subscription = $(this).attr('subscription') || 'none';
			var contact = {
				is_room: false,
				jid: jid,
				name: name,
				subscription: subscription,
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
		$(iq).find('item').each(function () {
            var sub = $(this).attr('subscription') || 'none';
            var jid = $(this).attr('jid');
			if(jid.indexOf('/') != -1) {
				jid = jid.substring(0,jid.indexOf('/'));
			}
            var name = $(this).attr('name') || jid.substring(0,jid.indexOf('@'));
			if(sub == 'remove') { //contact is being removed
				var delchat = Chats.get(jid);
				if(delchat != null) {
					Chats.remove(delchat);
				}
				console.log(jid + ' was removed from your contact list...');
			} else {//contact is being added or updated
				var contact = {
					is_room: false,
					jid: jid,
					name: name,
					subscription: sub,
					face: 'img/uesley.jpg',
					status: 'offline',
					unread: 0,
					lastText: '',
					lastType: 'composing',
					time: '',
					msgs: []
				}
				Chats.insert(contact);
				console.log("Contact " + jid + " was updated");
			}
		});
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
	
	this.send_broadcast = function(broadcast) {
		var body = JSON.stringify(broadcast);
		var message = $msg({to: 'all@broadcast.paulovitorjp.com', type: 'broadcast'}).c('body').t(body);
		console.log(message);
		connection.send(message);
		return true;
	};
	
	this.send_composing = function(jid) {
		var notify = $msg({to: jid, type: "chat"}).c('composing', {xmlns: "http://jabber.org/protocol/chatstates"});
        connection.send(notify);
		return true;
	};
	
	this.accept_subscribe = function(jid) {
		connection.send($pres({to: jid, type: "subscribed"})); //aceita
		connection.send($pres({to: jid, type: "subscribe"})); //e também solicita
		return true;
	};
	
	this.deny_subscribe = function(jid) {
		connection.send($pres({to: jid, type: "unsubscribed"}));
		return true;
	};
	
	this.add_user = function(user) {
		if(user.jid.indexOf('@') == -1) {
			user.jid = user.jid + "@" + SERVER_NAME;
		}
		
		//Chats.addSubscription(user);
		var iq = $iq({type: "set"}).c("query", {xmlns: "jabber:iq:roster"}).c("item", user);
		connection.sendIQ(iq);
		
		var subscribe = $pres({to: user.jid, "type": "subscribe"});
		connection.send(subscribe);
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
		
		body = $(message).find('body');
		if (body.length > 0) {
			body = body.text()
		} else {
			body = null;
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
	
	this.on_broadcast = function(message) {
		console.log("on_other_message arrived...");
		console.log(message);
		var body = $(message).children('body').text();
		console.log(body);
		var fromFull = $(message).attr('from');
		var from = fromFull.substring(0,fromFull.indexOf('@'));
		JSON.parse(body);
		console.log("aqui");
		Dashboard.addCard('broadcast', from, JSON.parse(body));
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
					if(room_id.substring(0,room_id.indexOf('@')) == 'monitores') {//if is in room monitores, is monitor
						if(jid == user.jid.substring(0,user.jid.indexOf('@'))) {
							user.isMonitor = true;
							console.log("IS MONITOR");
							$rootScope.$broadcast('updateChats', {data: 'something'});
						}
					}
				} else {
					room_user = {jid: jid, affiliation: '', role: ''};
				}
				console.log(JSON.stringify(room_user));
				Chats.insert(room);
				Chats.addParticipant(room_id, room_user);
			} else {
				if(room_id.substring(0,room_id.indexOf('@')) == 'monitores') {//if is not in room monitores, is not monitor
					if(jid == user.jid.substring(0,user.jid.indexOf('@'))) {
						user.isMonitor = false;
						console.log("IS NOT MONITOR");
						$rootScope.$broadcast('updateChats', {data: 'something'});
					}
				}
			}
		} else { //if presence from user
			jid = from.substring(0,from.indexOf('/'));
			if (ptype === 'subscribe') {
				//someone is asking to subscribe (add to contacts)
				Dashboard.addCard('subscribe', from); //this from has the slash, but will be cut
			}/* else if (ptype === 'subscribed') {
				//user has accepted your invitation, now it will be added to the roster
				var user = Chats.getSubscription(jid);
				var iq = $iq({type: "set"}).c("query", {xmlns: "jabber:iq:roster"})
					.c("item", user);
				connection.sendIQ(iq);
			}*/ else if (ptype !== 'error') {
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
				console.log(jid + " is " + status);
				Chats.setStatus(jid,status);
			}
			
		}

        return true;
	};
})

.factory('Upload', function($q, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $localstorage, $timeout, $ionicLoading, $fileHelper) {
  
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
          saveToPhotoAlbum: true,
          quality: 100,
        }

        $cordovaCamera.getPicture(options).then(

          function(fileURL) {
  
            var mimeType = $fileHelper.getMimetype(fileURL);
            var extension = $fileHelper.getExtension(mimeType);

          	var uploadOptions = new FileUploadOptions();
            uploadOptions.fileKey = "upfile";
            uploadOptions.fileName = makeid() + fileURL.substr(fileURL.lastIndexOf('/') + 1).replace('%','');
            uploadOptions.mimeType = "application/octet-stream";
            uploadOptions.chunkedMode = false;

            uploadOptions.fileName = uploadOptions.fileName.split(".");
            uploadOptions.fileName = uploadOptions.fileName[0]; 

            $cordovaFileTransfer.upload(serverURL, fileURL, uploadOptions).then(
              function(result) {
              	// $ionicLoading.hide();
                //deferred.resolve(uploadOptions.fileName);
                var resultdata = JSON.stringify(result);
                var parsedData = JSON.parse(resultdata); 
                deferred.resolve(parsedData.response);
              }, function(err) {
                   deferred.reject(err);
              }, function (progress) {
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
    set: function(key, value) {//this is used by individual values, for example 'jid' of the last logged user and 'logged'
	//these are saved at the root of the localstorage
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {//this is used by individual values, for example 'jid' of the last logged user and 'logged'
	//these are saved at the root of the localstorage
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {//this is used by JSON values, for example 'chats' and 'cards'
	//these are saved inside the user's JSON, so only him will be able to access it's contents...
	  var user_id = $window.localStorage['jid']; // gets user id
	  var user_data = $window.localStorage[user_id]; //gets user data
	  if(!user_data) {
		user_data = {};
	  } else {
		user_data = JSON.parse(user_data);
	  }
	  user_data[key] = value; // changes the value of key
	  $window.localStorage[user_id] = JSON.stringify(user_data); // rewrites it
      //$window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {//this is used by JSON values, for example 'chats' and 'cards'
	//these are saved inside the user's JSON, so only him will be able to access it's contents...
	  var user_id = $window.localStorage['jid'];
	  var user_data = $window.localStorage[user_id];
	  if(!user_data) {
		  user_data = {};
	  } else {
		  user_data = JSON.parse(user_data);
	  }
	  return user_data[key];
      //return JSON.parse($window.localStorage[key] || '{}');
    },
	remove: function(key) {//this is not used in the app yet, caution to see if it is necessary to remove something from the root or from the users JSON
		$window.localStorage.removeItem(key);
	}
  }
}]);