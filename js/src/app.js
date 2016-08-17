/* globals Renderer: false;
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

(function () {
  Drupal.behaviors.dennisDfpInline = {
    attach: function( context, settings ) {

      // Chris K - Temp fix.
      // Google Consumer Surveys break when used in conjunction with Dennis Inline Placeholders.
      // Until we refactor this to be PHP/Drupal based this fix forces placeholders on mobile only
      // where GCS are not required.
      var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

      if ( vw < 760 &&
          window.googletag &&
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
