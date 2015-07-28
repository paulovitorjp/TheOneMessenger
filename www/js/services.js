angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Uesley Lima',
    lastText: 'You on your way?',
    face: 'img/uesley.jpg'
  }, {
    id: 1,
    name: 'Fabiana Hofer',
    lastText: 'Hey, it\'s me',
    face: 'img/fabi.jpg'
  }, {
    id: 2,
    name: 'Paulo Vitor Pereira',
    lastText: 'I should buy a boat',
    face: 'img/paulo.jpg'
  }, {
    id: 3,
    name: 'Paulo Victor Maluf',
    lastText: 'Look at my mukluks!',
    face: 'img/maluf.jpg'
  }, {
    id: 4,
    name: 'Rafael Grisanti',
    lastText: 'This is wicked good ice cream.',
    face: 'img/grisanti.jpg'
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
});
