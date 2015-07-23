/**
 * @module dfpinline/app
 *
 * @description
 *   This application expects configuration values in `Drupal.settings` prepared
 *   by the Drupal module.
 *
 * @module dfpinline/app
 */
define([
  'drupal',
  'dfpinline/renderer',
  'has',
], function(Drupal, Renderer) {

  var app = {
    init: function() {
      var r = false;

      try {
        r = new Renderer(Drupal.settings.dennisDfpInline.config.selector);
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
      return !!(window.googletag &&
        Drupal.settings.dennisDfpInline &&
        Drupal.settings.dennisDfpInline.config &&
        Drupal.settings.dennisDfpInline.config.selector &&
        app.init());
    }
  };
});
