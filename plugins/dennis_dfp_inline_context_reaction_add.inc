<?php

/**
 * @file
 * Context reaction plugin for DFP Inline rendering.
 */

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

    // Get a list of tags.
    $options = array();
    $tags = dfp_tag_load_all();

    // Add inline tags to the options list.
    foreach ($tags as $tag) {
      if (isset($tag->settings['inline']['use']) && $tag->settings['inline']['use'] == TRUE) {
        $options[$tag->machinename] = $tag->slot;
      }
    }

    $form = array(
      '#title' => t('Inline DFP tags'),
      '#description' => t('The following inline DFP tag definitions will be added to the page.'),
      '#default_value' => isset($values) ? $values : array(),
    );

    if (!empty($options)) {
      $form['#type'] = 'checkboxes';
      $form['#options'] = $options;
    }
    else {
      $form['#markup'] = t('There are no ad tags configured as inline. You can create them on the !link page.', array('!link' => l(t('DFP Ad Tags'), 'admin/structure/dfp_ads', array('html' => TRUE))));
    }

    return $form;
  }

  /**
   * Check each currently set context to see if the DFP tag specified by
   * machinename should be added to the page or not.
   */
  function execute() {
    foreach ($this->get_contexts() as $context_name => $context) {
      if (isset($context->reactions['dennis_dfp_inline'])) {
        foreach ($context->reactions['dennis_dfp_inline'] as $key => $value) {
          if (!empty($value)) {
            $this->inline_tags[$key] = $value;
          }
        }
        break;
      }
    }
  }
}
