define([
  'dfpinline/renderer',
  'domReady!',
  'has',
], function(Renderer) {

  var app = {
    init: function() {
      var r = false;

      try {
        r = new Renderer('.node-full > .content > .field-name-body');
        r.field && r.init();
      }
      catch(err) {
        throw new Error('[dfpinline] Renderer failed to instantiate: ' + err.message);
      }

      return r;
    }
  };

  return {
    init: function() {
      return !!(window.googletag && app.init());
    }
  };
});
