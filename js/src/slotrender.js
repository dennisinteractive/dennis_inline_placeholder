define([
  'domReady!',
  'drupal',
  'jquery',
  'utils',
  'dfpinline/ca'
], function(doc, Drupal, $, utils, ContentAnalyser) {

  var slotRender = {};
  var settings = Drupal.settings.dennisDfpInline;
  var $field = $('.node-full > .content > .field-name-body');

  slotRender.render = function() {
    if (!settings.tags) {
      return false;
    }

    var analyser = new ContentAnalyser($field);
    // var newContent = analyser.processPlaceholders();
    var mapping = analyser.generateMapping();
    var target, method, tag;

    utils.each(mapping, function(item) {
      target = item[0];
      method = item[1];
      tag = item[2];

      var $adWrapper = $('<div>', {id: 'dfp-ad-' + tag + '-wrapper', class: 'dfp-tag-wrapper dfpinline-wrapper ' + settings.tags[tag].classes});
      $('<div>', {id: 'dfp-ad-' + tag, class: 'dfp-tag-wrapper'}).appendTo($adWrapper);

      $(target)[method]($adWrapper);

      googletag.display('dfp-ad-' + tag);
    });
  };

  return {
    init: function() {
      return slotRender.render();
    }
  };
});
