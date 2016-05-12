<?php
/**
 * @file
 * Context reaction plugin for DFP Inline rendering.
 */

/**
 * Expose DFP Inline Tags as context reactions.
 */
class dennis_dfp_inline_context_reaction_add extends context_reaction {
  public $placeholder_config = [];

  /**
   * Allow individual ad tags to be selected.
   */
  function options_form($context) {

    $values = [];
    $form = [];
    // Get existing values for this form.

    $settings = $this->fetch_from_context($context);


    if (!empty($settings['values'])) {
      $values = $settings['values'];
    }

    $form['values'] = array(
      '#type' => 'fieldset',
      '#title' => t('Global Inline Settings'),
      '#description' => t('The following settings control the automated placement of inline ad slots.'),
      '#group' => 'settings',
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
    );
    $form['values']['inline_selector'] = array(
      '#type' => 'textfield',
      '#title' => t('Field content selector'),
      '#default_value' => isset($values['inline_selector']) ? $values['inline_selector'] : '',
      '#description' => t('The DOM selector which translates to a single element with children as paragraphs or other blocks (media images, headings, etc.). This will be used for analysis and the placement of inline ad slots.'),
    );
    $form['values']['inline_placeholder'] = array(
      '#type' => 'textfield',
      '#title' => t('Inline ad placeholder'),
      '#default_value' => isset($values['inline_placeholder']) ? $values['inline_placeholder'] : '',
      '#description' => t('The pattern to use for manually inserted inline ad slot placeholders.'),
    );

    $form['values']['inline_first_position'] = array(
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
      '#default_value' => isset($values['inline_first_position']) ? $values['inline_first_position'] : '' ,
      '#description' => t('The first ad slot should appear BEFORE the configured element. Please note that this only applies if there are no manually added placeholders in the content.'),
    );
    $form['values']['inline_min_distance'] = array(
      '#type' => 'select',
      '#title' => t('Minimum distance between subsequent ad slots in content'),
      '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
      '#field_suffix' => t('paragraph or other block level element (media file, etc.)'),
      '#default_value' => isset($values['inline_min_distance']) ? $values['inline_min_distance'] : '',
      '#description' => t('The minimum distance measured in paragraphs between the automated ad slot placements in content. If content is shorter then ads will be added to the end of the content.'),
    );

    $form['values']['inline_max_num'] = array(
      '#type' => 'select',
      '#title' => t('Maximum number of placeholders in content'),
      '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
      '#field_suffix' => t('Maxium number of placeholders per node.'),
      '#default_value' => isset($values['inline_max_num']) ? $values['inline_max_num'] : '',
      '#description' => t('Maximum number of placeholders in content.'),
    );

    return $form;
  }

  // Execute context.
  function execute() {
    $i = 0;
    foreach ($this->get_contexts() as $context) {
      if (!isset($context->reactions['dennis_dfp_inline'])) {
        continue;
      }
      foreach ($context->reactions['dennis_dfp_inline'] as $values) {
        if (!empty($values)) {
          $this->placeholder_config[$i] = $values;
        }
      }
    }
  }
}
