/**
 * @file
 * Dennis DFP Inline WYSIWYG plugin
 */
(function() {
  // Image placeholder class.
  var imagePlaceholderClass = "inline-placeholder-image";

  Drupal.wysiwyg.plugins.dfpinline = {

    /**
     * Execute the button.
     */
    invoke: function (data, settings, instanceId) {
      var content = (data.format === 'html') ? this._getPlaceholder(settings) : settings.dfpInlinePattern;
      Drupal.wysiwyg.instances[instanceId].insert(content);
    },

    /**
     * Replace all placeholders with images.
     */
    attach: function (content, settings) {
      // Get html element placeholder.
      var divPlaceholder = settings.dfpInlinePattern;
      // Get image placeholder.
      var imgPlaceholder = this._getPlaceholder(settings);
      // Replace inline placeholder with image placeholder for viewing in wysiwyg
      content = content.replace(divPlaceholder, imgPlaceholder);
      return content;
    },
    /**
     * Replace images with inline placeholder tags in content upon detaching editor.
     */
    detach: function(content, settings) {

      // Get inline pattern / placeholder.
      var dfpInlinePattern = settings.dfpInlinePattern;
      // Get wysiwyg content.
      var jo = jQuery('<div>' + content + '</div>');
      // Find all image placeholders in wysiwyg text.
      jo.find('img.'+imagePlaceholderClass).each(function () {
        // Replace all image placeholders with the html placeholder element.
        jQuery(this).replaceWith(dfpInlinePattern);
      });
      return jo.html();
    },

    /**
     * Helper function to return a HTML placeholder.
     */
    _getPlaceholder: function (settings) {
      return '<img src="' + settings.path + '/images/placeholder.png"  class="'+imagePlaceholderClass+'" />';
    }
  };

}(jQuery));
