<?php
/**
 * @file
 * Context reaction plugin for DFP Inline rendering.
 */
define("DENNIS_DFP_INLINE_SELECTOR", '.field-name-body');
define("DENNIS_DFP_INLINE_PLACEHOLDER", '<!--#dfpinline#-->');
define("DENNIS_DFP_INLINE_FIRST_POSITION", 2);
define("DENNIS_DFP_INLINE_MIN_DISTANCE", 3);
define("DENNIS_DFP_INLINE_PARAGRAPH_LENGTH", 100);
define("DENNIS_DFP_INLINE_MAX_NUMBER", 4);
// @codingStandardsIgnoreStart
/**
 * Expose DFP Inline Tags as context reactions.
 */
class dennis_dfp_inline_context_reaction_add extends context_reaction {
  public $placeholder_config = [];

  /**
   * Allow individual ad tags to be selected.
   */
  function options_form($context) {
    // Get existing values for this form.
    $values = $this->fetch_from_context($context);

    if (!empty($settings['values'])) {
      $values = $settings['values'];
    }

    $form['inline_settings'] = array(
      '#type' => 'fieldset',
      '#title' => t('Global Inline Settings'),
      '#description' => t('The following settings control the automated placement of inline ad slots.'),
      '#group' => 'settings',
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
//      '#attached' => array(
//        'js' => array(
//          'vertical-tabs' => drupal_get_path('module', 'dennis_dfp_inline') . '/js/admin/dennis_dfp_inline.admin.js',
//        ),
//      ),
    );
    $form['inline_settings']['inline_selector'] = array(
      '#type' => 'textfield',
      '#title' => t('Field content selector'),
      '#default_value' => variable_get('dennis_dfp_inline_selector', DENNIS_DFP_INLINE_SELECTOR),
      '#description' => t('The DOM selector which translates to a single element with children as paragraphs or other blocks (media images, headings, etc.). This will be used for analysis and the placement of inline ad slots.'),
    );
    $form['inline_settings']['inline_placeholder'] = array(
      '#type' => 'textfield',
      '#title' => t('Inline ad placeholder'),
      '#default_value' => variable_get('dennis_dfp_inline_placeholder', DENNIS_DFP_INLINE_PLACEHOLDER),
      '#description' => t('The pattern to use for manually inserted inline ad slot placeholders.'),
    );
    $form['inline_settings']['inline_first_position'] = array(
      '#type' => 'select',
      '#title' => t('Automatically insert the first ad tag'),
      '#options' => array(
        1 => t('first'),
        2 => t('second'),
        3 => t('third'),
        4 => t('fourth'),
        5 => t('fifth'),
      ),
      '#field_prefix' => t('Before the'),
      '#field_suffix' => t('paragraph or other block level element (media file, etc.)'),
      '#default_value' => variable_get('dennis_dfp_inline_first_position', DENNIS_DFP_INLINE_FIRST_POSITION),
      '#description' => t('The first ad slot should appear BEFORE the configured element. Please note that this only applies if there are no manually added placeholders in the content.'),
    );
    $form['inline_settings']['inline_min_distance'] = array(
      '#type' => 'select',
      '#title' => t('Minimum distance between subsequent ad slots in content'),
      '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
      '#field_suffix' => t('paragraph or other block level element (media file, etc.)'),
      '#default_value' => variable_get('dennis_dfp_inline_min_distance', DENNIS_DFP_INLINE_MIN_DISTANCE),
      '#description' => t('The minimum distance measured in paragraphs between the automated ad slot placements in content. If content is shorter then ads will be added to the end of the content.'),
    );

    $form['inline_settings']['inline_max_num'] = array(
      '#type' => 'select',
      '#title' => t('Maximum number of placeholders in content'),
      '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
      '#field_suffix' => t('Maxium number of placeholders per node.'),
      '#default_value' => variable_get('dennis_dfp_inline_max_number', DENNIS_DFP_INLINE_MAX_NUMBER),
      '#description' => t('Maximum number of placeholders in content.'),
    );

    return $form;
  }

  /**
   * Options form submit handler.
   */
//  function options_form_submit($values) {
//    foreach ($values['inline_tags'] as $name => $value) {
//      // Do not include disabled elements.
//      if (!$value['enabled']) {
//        unset($values['inline_tags'][$name]);
//      }
//      // Remove enabled flag as we are storing enabled tags only.
//      else {
//        unset($values['inline_tags'][$name]['enabled']);
//      }
//    }
//
//    return $values;
//  }

  /**
   * Check each currently set context for inline DFP ad slots.
   */
//  function execute() {
//    foreach ($this->get_contexts() as $context_name => $context) {
//      if (isset($context->reactions['dennis_dfp_inline'])) {
//        foreach ($context->reactions['dennis_dfp_inline'] as $key => $value) {
//          if (!empty($value)) {
//            $this->$key = $value;
//          }
//        }
//        break;
//      }
//    }
//  }
//}

  // Execute context.
  function execute() {
    $i = 0;
    foreach ($this->get_contexts() as $context) {
      if (!isset($context->reactions['dennis_dfp_inline'])) {
        continue;
      }
//dpm($context->reactions['inline_body_placeholder']);
      foreach ($context->reactions['dennis_dfp_inline'] as $values) {
        if (!empty($values)) {
          $this->placeholder_config[$i] = $values;
        }
      }
    }
//    dpm($this->placeholder_config);
  }
}
// @codingStandardsIgnoreEnd
