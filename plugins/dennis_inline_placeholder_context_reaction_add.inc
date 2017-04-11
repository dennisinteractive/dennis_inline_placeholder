<?php
/**
 * @file
 * Context reaction plugin for DFP Inline rendering.
 */

/**
 * Expose Dennis Inline Placeholder as context reactions.
 */
class dennis_inline_placeholder_context_reaction_add extends context_reaction {
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
      '#field_prefix' => t('After the'),
      '#field_suffix' => t('paragraph'),
      '#default_value' => isset($values['inline_first_position']) ? $values['inline_first_position'] : '' ,
      '#description' => t('The first ad slot should appear BEFORE the configured element. Please note that this only applies if there are no manually added placeholders in the content.'),
    );
    $form['values']['inline_min_distance'] = array(
      '#type' => 'select',
      '#title' => t('Minimum distance between subsequent ad slots in content'),
      '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
      '#field_suffix' => t('paragraph'),
      '#default_value' => isset($values['inline_min_distance']) ? $values['inline_min_distance'] : '',
      '#description' => t('The minimum distance measured in paragraphs between the automated ad slot placements in content. If content is shorter then ads will be added to the end of the content.'),
    );

    $form['values']['inline_max_num'] = array(
      '#type' => 'select',
      '#title' => t('Maximum number of placeholders in content'),
      '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8,9 ,10)),
      '#field_suffix' => t('Maxium number of placeholders per article body.'),
      '#default_value' => isset($values['inline_max_num']) ? $values['inline_max_num'] : '',
      '#description' => t('Maximum number of placeholders in content.'),
    );
     $form['values']['minimum'] = array(
       '#type' => 'fieldset',
       '#title' => t('Mininum Settings'),
       '#description' => t('The following settings control the maximum number of ads depending on number of words.'),
       '#group' => 'settings',
       '#collapsible' => TRUE,
       '#collapsed' => TRUE,
     );
     $form['values']['minimum']['inline_total_words'] = array(
       '#type' => 'textfield',
       '#title' => t('Mininum number of words'),
       '#size' => 5,
       '#field_suffix' => t('Mininum number of words in an article for setting below.'),
       '#default_value' => isset($values['minimum']['inline_total_words']) ? $values['minimum']['inline_total_words'] : '',
       '#description' => t('Mininum number of words.'),
     );

     $form['values']['minimum']['inline_max_num_if_words'] = array(
       '#type' => 'select',
       '#title' => t('Maximum number of placeholders.'),
       '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
       '#field_suffix' => t('Maxium number of placeholders per node if number of words above.'),
       '#default_value' => isset($values['minimum']['inline_max_num_if_words']) ? $values['minimum']['inline_max_num_if_words'] : '',
       '#description' => t('Maximum number of placeholders in content.'),
     );


    $form['values']['inline_place_last_enabled'] = array(
      '#title' => t('Last Position Configuration Enabled'),
      '#type' => 'checkbox',
      '#description' => t('Turn on if you want the last position to be placed in the place underneath.'),
      '#default_value' => isset($values['inline_place_last_enabled']) ? $values['inline_place_last_enabled'] : 0,
    );

    $form['values']['inline_place_last'] = array(
      '#type' => 'select',
      '#title' => t('Last placeholder position'),
      '#options' => array(
        1 => t('first'),
        2 => t('second'),
        3 => t('third'),
        4 => t('fourth'),
        5 => t('fifth'),
      ),
      '#field_prefix' => t('Before the'),
      '#field_suffix' => t('paragraph from the end.'),
      '#default_value' => isset($values['inline_place_last']) ? $values['inline_place_last'] : '' ,
      '#description' => t('Place last ad before the following paragraph.'),
    );

    return $form;
  }

  // Execute context.
  function execute() {
    $i = 0;
    foreach ($this->get_contexts() as $context) {
      if (!isset($context->reactions['dennis_inline_placeholder'])) {
        continue;
      }
      foreach ($context->reactions['dennis_inline_placeholder'] as $values) {
        if (!empty($values)) {
          $this->placeholder_config[$i] = $values;
        }
      }
    }
  }
}
