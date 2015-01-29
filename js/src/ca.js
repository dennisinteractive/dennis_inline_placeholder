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
], function(doc, $, Drupal, utils, undefined) {

  var config = Drupal.settings.dennisDfpInline.config;
  var childrenSelector = 'p, div, h2, h3, h4, h5, h6, pre';
  var pattern = new RegExp('<!--#dfpinline#-->', 'g');

  /**
   * Content analyser constructor.
   *
   * @param {Array} el jQuery object to process.
   */
  function ContentAnalyser(el) {
    this.element = el;
    this.tags = Drupal.settings.dennisDfpInline.tags || [];
    this.placeholderTags = 0;
    this.tagsLeft = Object.keys(this.tags);
    this.mapping = [];

    this.tree = doc.createDocumentFragment();
    this.tree.appendChild(el.cloneNode(true));

    this.content = this.tree.children[0].innerHTML;
    this.contentOriginal = this.content;

    console.log('constructor done');
  }

  ContentAnalyser.prototype = {
    /**
     * Search the content for editorially placed placeholders in the content.
     *
     * Search the content for editorially inserted placeholders in the content.
     * If found, replace them with an element so they can later be replaced with
     * actual ad slots.
     *
     * @return {Object} The instantiated object.
     */
    processPlaceholders: function() {
      // Search for editorially inserted placeholders.
      utils.each(this.content.match(pattern) || [], (function(match, key) {
        if (this.tagsLeft.length > 0) {
          // Convert the current match to a pattern.
          var re = new RegExp(match);
          // Generate placeholder elements to replace of the HTML comment.
          var skel = doc.createElement('span');
          var el = doc.createElement('span');
          var leftoverKey = this.tagsLeft.indexOf(key + ''); // Cast to string.
          el.id = 'dfpinline-placeholder-' + key;
          el.className = 'dfpinline-manual-placeholder';
          skel.appendChild(el);

          // Replace the match with the placeholder element.
          this.content = this.content.replace(re, skel.innerHTML);
          this.placeholderTags++;
          // Remove the tag pointer just processed.
          this.tagsLeft.splice(leftoverKey, 1);
        }
      }).bind(this)); // Function.prototype.bind to keep context.

      // Update the document fragment to keep up with changes so far.
      if (this.placeholderTags > 0) {
        this.updateFragment();
      }

      return this;
    },

    /**
     * Update the document fragment from the content string.
     *
     * Please note that this is currently done via jQuery .html() method.
     *
     * @return {Object} The instantiated object.
     */
    updateFragment: function() {
      $(this.tree.firstElementChild).html(this.content);

      return this;
    },

    generateMapping: function() {
      // Return early if there is nothing to process.
      if (this.placeholderTags === 0 && this.tagsLeft < 1) {
        return [];
      }

      // Generate mapping of any editorial placeholders.
      this.generatePlaceholderMapping();

      // Generate mapping of any remaining placeholders.
      this.generateAutomatedMapping();

      return this;
    },

    /**
     * Generate mapping of any editorial placeholders.
     *
     * @return {Object} The instantiated object.
     */
    generatePlaceholderMapping: function() {
      if (this.placeholderTags > 0) {
        utils.each(this.tree.querySelectorAll('.dfpinline-manual-placeholder'), (function(item, key) {
          this.mapping.push([item, 'replaceWith', this.tags[key][0]]);
        }).bind(this)); // Function.prototype.bind to keep context.
      }

      return this;
    },

    /**
     * Generate mapping of automated placements.
     *
     * @todo this should support partial processing, i.e when there are more
     * slots than editorially injercted placements.
     *
     * @return {Object} The instantiated object.
     */
    generateAutomatedMapping: function() {
      if (!this.tagsLeft) {
        return this;
      }

      var children = this.tree.querySelectorAll(childrenSelector);
      var minDistance = (config && config.minDistance) || 3;
      var firstPosition = (config && config.firstPosition) || 1;
      var pos;
      var i = 0;

      for (var key in this.tags) {
        i++;
        pos = (i === firstPosition) ? firstPosition : i + minDistance;
        this.mapping.push([children[pos], 'before', this.tags[key][0]]);
      }

      return this;
    }
  };

  return ContentAnalyser;
});
