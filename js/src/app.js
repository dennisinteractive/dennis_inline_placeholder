/**
 * @module dfpinline/app
 *
 * @description
 *   This application expects configuration values in `Drupal.settings` prepared
 *   by the Drupal module.
 *
 * @module dfpinline/app
 */

var dennisDfpInline = dennisDfpInline || {};
var Renderer;

(function () {
  Drupal.behaviors.dennisDfpInline = {
    attach: function( context, settings ) {

      if ( window.googletag &&
          Drupal.settings.dennisDfpInline &&
          Drupal.settings.dennisDfpInline.config &&
          Drupal.settings.dennisDfpInline.config.selector
        ) {
        var r = new Renderer( settings.dennisDfpInline.config.selector, settings.dennisDfpInline );
            r.field && r.init();
      }
    }
  };
})();
