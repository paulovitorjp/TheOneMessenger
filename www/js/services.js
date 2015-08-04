angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Uesley Lima',
    lastText: 'You on your way?',
    face: 'img/uesley.jpg',
	time: '09:50',
	status: 'online'
  }, {
    id: 1,
    name: 'Fabiana Hofer',
    lastText: 'Hey, it\'s me',
    face: 'img/fabi.jpg',
	time: '07:12',
	status: 'online'
  }, {
    id: 2,
    name: 'Paulo Vitor Pereira',
    lastText: 'I should buy a boat',
    face: 'img/paulo.jpg',
	time: 'Ontem 18:37',
	status: 'away'
  }, {
    id: 3,
    name: 'Paulo Victor Maluf',
    lastText: 'Look at my mukluks!',
    face: 'img/maluf.jpg',
	time: 'Ontem 07:56',
	status: 'away'
  }, {
    id: 4,
    name: 'Rafael Grisanti',
    lastText: 'This is wicked good ice cream. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa. Testando mensagem super ultra mega blaster ultimate 2 gold platinum realmente longa.',
    face: 'img/grisanti.jpg',
	time: '28/07/15 11:00',
	status: 'offline'
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
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Login', function($localstorage) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var user = {
    id: 0,
    logged: false,
  };
/**
  getCookie = function (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }
  
  setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";path=/";
  }
  **/
  return {
    user: function() {
      return user;
    },
    isLogged: function() {
	  //var isLogged = getCookie("logged");
	  var isLogged = $localstorage.get("logged");
	  if(isLogged=="true") user.logged = true;
	  else user.logged = false;
      return user.logged;
    },
    setLogged: function(bool) {
      user.logged = bool;
      //setCookie("logged",bool,10);//10 dias expira
	  $localstorage.set("logged",bool);
    }
  };
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
    }
  }
}]);