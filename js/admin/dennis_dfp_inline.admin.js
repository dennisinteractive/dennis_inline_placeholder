(function ($) {
  'use strict';

  /**
   * Custom summary for vertical tabs.
   */
  Drupal.behaviors.dennisDfpInlineVerticalTabs = {
    attach: function (context) {

      var checkmark = '&#10003;';
      var exmark = '&#10008;';
      var summary;

      $('fieldset#edit-global-inline-settings', context).drupalSetSummary(function (context) {
        var selector = Drupal.checkPlain($('#edit-dennis-dfp-inline-selector', context).val());
        var placeholder = Drupal.checkPlain($('#edit-dennis-dfp-inline-placeholder', context).val());
        var firstPos = Drupal.checkPlain($('#edit-dennis-dfp-inline-first-position > option:selected', context).text());
        var minDistance = Drupal.checkPlain($('#edit-dennis-dfp-inline-min-distance', context).val());

        summary = (selector) ? checkmark + ' Selector configured<br/>' : exmark + ' Selector not set<br/>';
        summary += (placeholder) ? checkmark + ' Placeholder configured<br/>' : exmark + ' Placeholder not set<br/>';
        summary += '1st pos.: Before the <strong>' + firstPos + '</strong><br/>';
        summary += 'Min. distance: <strong>' + minDistance + '</strong> paragraphs';

        return summary;
      });
    }
  };

})(jQuery);
