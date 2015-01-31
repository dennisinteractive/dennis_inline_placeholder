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
  var pattern = new RegExp(config.placeholder, 'g');

  /**
   * Creates a ContentAnalyser
   *
   * @constructor
   * @class Class which analyses content and generates placement mappings.
   * @property {Object} element The Element object to work on.
   * @property {Array} tags An array of tag configuration.
   * @property {Integer} placeholderTags Counter for manual placeholders.
   * @property {Array} tagsLeft Maintain the number of tags to process.
   * @property {Array} mapping Array of mapping data which tells the Renderer
   *   where to insert ads in this.element.
   * @property {Object} tree Document fragment for the modified element children.
   * @property {String} content HTML contents of the document fragment.
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
     * @todo Implement minimum paragraph length to avoid spoiling content with
     * too short paragraphs.
     *
     * @return {Object} The instantiated object.
     */
    generateAutomatedMapping: function() {
      // Return early if there isn't any tags left to process.
      if (!this.tagsLeft) {
        return this;
      }

      // @todo Using the immediate child elements for the analysis. This could
      // do with a selector with predefined elements in the future.
      var children = this.tree.firstElementChild.children;

      var minDistance = (config && config.minDistance) || 2;
      var firstPosition = ((config && config.firstPosition) || 1) - 1;
      var pos = 0;
      var i = firstPosition;
      var method;
      var hasManual;
      var last = false;

      for (var key in this.tags) {
        // Check if the tag is already placed manually.
        if (this.tagsLeft.indexOf(key + '') === -1) {
          // Get the position of the current manual added tag and use that for
          // the calculation of the next position.
          pos = parseInt(utils.getKeyByValue(children, this.mapping[key][0]));
          i++;
          hasManual = true;
          continue;
        }

        // Calculate position.
        pos = (i++ === firstPosition) ? firstPosition : (pos + minDistance);
        // Inject before if manual placement has not happened yet.
        method = hasManual ? 'after' : 'before';
        // If currently calculated position is too far, stick the ad at the end.
        if (pos > children.length - 1) {
          pos = children.length -1;
          method = 'after';
          last = true;
        }
        this.mapping.push([children[pos], method, this.tags[key][0], last]);
      }

      return this;
    }
  };

  return ContentAnalyser;
});
