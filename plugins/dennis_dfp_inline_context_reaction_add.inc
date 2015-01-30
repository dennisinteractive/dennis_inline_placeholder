<?php
/**
 * @file
 * Context reaction plugin for DFP Inline rendering.
 */

// @codingStandardsIgnoreStart
/**
 * Expose DFP Inline Tags as context reactions.
 */
class dennis_dfp_inline_context_reaction_add extends context_reaction {

  /**
   * Allow individual ad tags to be selected.
   */
  function options_form($context) {
    // Get existing values for this form.
    $values = $this->fetch_from_context($context);

    $rows = array();
    $row_elements = array();
    $form = array(
      '#theme' => 'dennis_dfp_inline_context_form',
      '#title' => t('Inline DFP tags'),
      '#description' => t('The following inline DFP tag definitions will be added to the page.'),
    );
    $form['inline_tags'] = array(
      '#tree' => TRUE,
    );

    // Get a list of tags.
    $tags = dfp_tag_load_all();
    // Add inline tags to the list.
    foreach ($tags as $tag) {
      if (isset($tag->settings['inline']['use']) && $tag->settings['inline']['use'] == TRUE) {
        $form['inline_tags'][$tag->machinename] = array(
          'enabled' => array(
            '#type' => 'checkbox',
            '#title' => t('Enabled'),
            '#default_value' => isset($values['inline_tags'][$tag->machinename]['weight']) ? TRUE : FALSE,
            '#title_display' => 'invisible',
          ),
          'weight' => array(
            '#type' => 'weight',
            '#title' => t('Weight'),
            '#default_value' => isset($values['inline_tags'][$tag->machinename]['weight']) ? (int) $values['inline_tags'][$tag->machinename]['weight'] : 0,
            '#delta' => 10,
            '#title_display' => 'invisible',
          ),
          'name' => array(
            '#markup' => check_plain($tag->slot),
          ),
          'machinename' => array(
            '#markup' => $tag->machinename,
          ),
        );
      }
    }

    // Sort the rows by weight.
    uasort($form['inline_tags'], '_dennis_dfp_inline_form_weight_arraysort');

    return $form;
  }

  /**
   * Options form submit handler.
   */
  function options_form_submit($values) {
    foreach ($values['inline_tags'] as $name => $value) {
      // Do not include disabled elements.
      if (!$value['enabled']) {
        unset($values['inline_tags'][$name]);
      }
      // Remove enabled flag as we are storing enabled tags only.
      else {
        unset($values['inline_tags'][$name]['enabled']);
      }
    }

    return $values;
  }

  /**
   * Check each currently set context for DFP ad slot machine names.
   */
  function execute() {
    foreach ($this->get_contexts() as $context_name => $context) {
      if (isset($context->reactions['dennis_dfp_inline'])) {
        foreach ($context->reactions['dennis_dfp_inline'] as $key => $value) {
          if (!empty($value)) {
            $this->$key = $value;
          }
        }
        break;
      }
    }
  }
}
// @codingStandardsIgnoreEnd
