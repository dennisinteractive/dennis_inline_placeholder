/**
 * @file ca.js
 *
 * Content analyser module.
 */
define([
  'domReady!',
  'jquery',
  'drupal',
  'utils'
], function(doc, $, Drupal, utils) {

  var settings = Drupal.settings.dennisDfpInline;
  var config = settings.config;
  var childrenSelector = 'p, div, h2, h3, h4, h5, h6, pre';
  var pattern = new RegExp('<!--#dfpinline#-->', 'g');

  function ContentAnalyser($el) {
    this.element = $el[0];
    this.children = $el.children(childrenSelector);
    this.content = $el.html();
    this.contentOriginal = this.content;
    this.mapping = [];

    this.tags = settings.tags || {};
    this.placeholderTags = 0;

    var total = Object.keys(this.tags).length;
    this.tagsTotal = total;
  }

  ContentAnalyser.prototype = {

    processPlaceholders: function() {
      // Search for editorially inserted placeholders.
      var manualMatches = this.content.match(pattern);

      if (utils.isArray(manualMatches)) {
        utils.each(manualMatches, (function(match, key) {
          if (this.tagsTotal > 0) {
            var skel = doc.createElement('span');
            var el = doc.createElement('span');
            // Convert the current match to a pattern.
            var re = new RegExp(match);

            el.id = 'dfpinline-placeholder-' + key;
            el.className = 'dfpinline-manual-placeholder';
            skel.appendChild(el);

            // Replace the placeholders with a span element.
            this.content = this.content.replace(re, skel.innerHTML);
            this.placeholderTags++;
            this.tagsTotal--;
          }
        }).bind(this)); // Function.prototype.bind to keep context.
      }

      return this.content;
    },

    generateMapping: function() {
      if (this.tagsTotal < 1) {
        return [];
      }

      var i = 0;
      var minDistance = (config && config.minDistance) || 3;
      var firstPosition = (config && config.firstPosition) || 1;
      var pos;

      for (var key in settings.tags) {
        i++;
        pos = (i === firstPosition) ? firstPosition : i + minDistance;
        this.mapping.push([this.children[pos], 'before', key]);
      }

      return this.mapping;
    }

  };

  return ContentAnalyser;
});
