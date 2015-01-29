define([
  'domReady!',
  'drupal',
  'jquery',
  'utils',
  'dfpinline/ca'
], function(doc, Drupal, $, utils, ContentAnalyser) {

  var settings = Drupal.settings.dennisDfpInline;

  function Renderer(selector) {
    if (!settings || !settings.config) {
      throw new Error('Configuration missing.');
    }

    if (!settings.tags) {
      throw new Error('There are no ad tags defined.');
    }

    this.field = doc.querySelector(selector);

    if (!this.field) {
      throw new Error('Element not found.');
    }

    this.adsReady = [];
    this.analyser = null;
  }

  Renderer.prototype = {

    /**
     * Render slots in the document fragment of Content Analyser.
     *
     * @return {Object} The instantiated object.
     */
    render: function() {
      var ca = this.analyser;
      var target, method, tag, last;

      // Process the generated mapping. This inserts specified DFP ad wrappers.
      utils.each(ca.mapping, (function(item) {
        var tree = this.analyser.tree;

        target = item[0];
        method = item[1];
        tag = item[2];
        last = item[3];

        // Get the tag spec from settings.
        var tagSpec = settings.tags.filter(function(val) {
          return val[0] === tag;
        });

        // Generate the wrapper element of the ad slot.
        var $adWrapper = $('<div>', {
          id: 'dfpinline-ad-' + tag + '-wrapper',
          class: 'dfpinline-wrapper dfp-tag-wrapper ' + tagSpec[0][1].classes
        });
        $('<div>', {
          id: 'dfp-ad-' + tag,
          class: 'dfp-tag-wrapper'
        }).appendTo($adWrapper);

        // If position is set as last, make sure it is appended to the very end
        // to avoid mixing up ad order.
        if (last) {
          target = tree.firstElementChild.lastElementChild;
        }
        // Add the final ad slot wrapper to the document fragment.
        $(target, tree)[method]($adWrapper);
        this.adsReady.push('dfp-ad-' + tag);
      }).bind(this)); // Function.prototype.bind to keep context.

      // Finally replace the original field contents with the new contents.
      ca.element.parentNode.replaceChild(ca.tree, ca.element);

      return this;
    },

    /**
     * Display DFP ads
     *
     * @return {Object} The instantiated object.
     */
    display: function() {
      utils.each(this.adsReady, function(slot) {
        googletag.cmd.push(function() {
          googletag.display(slot);
        });
      });

      return this;
    },

    /**
     * Initialise the Renderer.
     *
     * @return {Object} The instantiated object.
     */
    init: function() {
      this.analyser = new ContentAnalyser(this.field);
      var ca = this.analyser;

      // Process editorially added placeholders.
      ca.processPlaceholders();
      // Generate mapping info.
      ca.generateMapping();

      if (ca.mapping) {
        this.render();
        this.display();
      }

      return this;
    }
  };

  return Renderer;
});
