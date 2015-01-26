define([
  'domReady!',
  'has',
], function() {

  var app = {};

  app.init = function() {
    console.log('I am a skeleton');
  };

  return {
    init: function() {
      return app.init();
    }
  };
});
