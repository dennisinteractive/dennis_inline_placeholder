define([
  'dfpinline/renderer',
  'domReady!',
  'has',
], function(Renderer) {

  var app = {
    init: function() {
      var r = new Renderer('.node-full > .content > .field-name-body');
      r.init();

      return r;
    }
  };

  return {
    init: function() {
      return app.init();
    }
  };
});
