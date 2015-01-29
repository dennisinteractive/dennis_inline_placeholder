<?php
/**
 * @file
 * Admin settings form
 */

/**
 * Generate admin setting form.
 */
function dennis_gallery_adv_admin_form() {
  $form = array();

  $form['ads'] = array(
    '#type' => 'fieldset',
    '#title' => t('Ad related settings'),
    '#description' => t('The following settings control the automatic ad refresh behaviour of the ad slots displayed on the gallery when it is in presentation mode.'),
  );

  $form['ads']['dfp'] = array(
    '#type' => 'fieldset',
    '#title' => t('DFP'),
    '#collapsible' => FALSE,
    '#description' => t('The following settings apply to DFP ad tags.'),
  );
  $form['ads']['dfp']['dennis_gallery_adv_refresh_nth_dfp'] = array(
    '#type' => 'select',
    '#title' => t('Refresh ads on every nth slide change'),
    '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
    '#default_value' => variable_get('dennis_gallery_adv_refresh_nth_dfp', 3),
    '#description' => t('Refresh DFP ad units on every Nth gallery slide change.'),
  );
  $form['ads']['dfp']['dennis_gallery_adv_refresh_interval_dfp'] = array(
    '#type' => 'textfield',
    '#title' => t('Ad refresh interval'),
    '#size' => 5,
    '#maxlength' => 6,
    '#default_value' => variable_get('dennis_gallery_adv_refresh_interval_dfp', 5000),
    '#description' => t('This timeout value indicates that DFP ad slots should refresh after the specified amount of time has passed since the last gallery slide change. This setting overrides the previous one.'),
    '#field_suffix' => 'ms',
  );
  $form['ads']['dfp']['dennis_gallery_adv_inline_mpu'] = array(
    '#type' => 'select',
    '#title' => t('Display mpu every nth slide (mobile view only)'),
    '#options' => drupal_map_assoc(array(3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)),
    '#default_value' => variable_get('dennis_gallery_adv_inline_mpu', 5),
    '#description' => t('Insert MPU every nth slide in the mobile view.'),
  );

  $tags = dfp_tag_load_all(TRUE);
  $tag_options = array('' => '- ' . t('None') . ' -');
  $tag_options += drupal_map_assoc(array_keys($tags));

  $form['ads']['dfp']['advanced'] = array(
    '#type' => 'fieldset',
    '#title' => t('Advanced DFP settings'),
    '#description' => t('The following settings allow overrides to ad slots served on an advanced gallery page. Use with caution!'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );
  $form['ads']['dfp']['advanced']['dennis_gallery_adv_adslot_top'] = array(
    '#type' => 'select',
    '#title' => t('Top ad tag'),
    '#options' => $tag_options,
    '#default_value' => variable_get('dennis_gallery_adv_adslot_top', DENNIS_GALLERY_ADV_ADSLOT_TOP),
    '#description' => t('Ad tag to display at the top of the advanced gallery page.'),
  );
  $form['ads']['dfp']['advanced']['dennis_gallery_adv_adslot_right'] = array(
    '#type' => 'select',
    '#title' => t('Right hand side ad tag'),
    '#options' => $tag_options,
    '#default_value' => variable_get('dennis_gallery_adv_adslot_right', DENNIS_GALLERY_ADV_ADSLOT_RIGHT),
    '#description' => t('Ad tag to display at the right hand side of an advanced gallery page.'),
  );

  $form['ads']['vibrantmedia'] = array(
    '#type' => 'fieldset',
    '#title' => t('Vibrant'),
    '#collapsible' => FALSE,
    '#description' => t('The following settings apply to Vibrant Media image ads.'),
  );
  $form['ads']['vibrantmedia']['dennis_gallery_adv_refresh_nth_vibrant'] = array(
    '#type' => 'select',
    '#title' => t('Refresh ads on every nth slide change (Vibrant Media Picture ads'),
    '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
    '#default_value' => variable_get('dennis_gallery_adv_refresh_nth_vibrant', 3),
    '#description' => t('Refresh Vibrant image ads on every Nth gallery slide change.'),
  );
  $form['ads']['vibrantmedia']['dennis_gallery_adv_refresh_interval_vibrant'] = array(
    '#type' => 'textfield',
    '#title' => t('Ad refresh interval'),
    '#size' => 5,
    '#maxlength' => 6,
    '#default_value' => variable_get('dennis_gallery_adv_refresh_interval_vibrant', 5000),
    '#description' => t('This timeout value indicates that Vibrant image ads should refresh after the specified amount of time has passed since the last gallery slide change. This setting overrides the previous one.'),
    '#field_suffix' => 'ms',
  );

  $form['tracking'] = array(
    '#type' => 'fieldset',
    '#title' => t('Tracking'),
    '#collapsible' => FALSE,
    '#description' => t('The following settings apply to analytics and event tracking.'),
  );
  $form['tracking']['dennis_gallery_adv_eventtracking'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable Google Analytics event tracking'),
    '#default_value' => variable_get('dennis_gallery_adv_eventtracking', FALSE),
    '#description' => t('Enable this to fire custom events on navigating galleries.'),
  );

  $form['advanced'] = array(
    '#type' => 'fieldset',
    '#title' => t('Advanced settings'),
    '#description' => t('The following settings allow overrides to entity rendering, use with caution.'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );

  $display_modes_options = drupal_map_assoc(array_keys(field_view_mode_settings('node', 'gallery_adv')));

  $form['advanced']['dennis_gallery_adv_inline_view_mode'] = array(
    '#type' => 'select',
    '#title' => t('View mode of inline gallery references'),
    '#options' => $display_modes_options,
    '#default_value' => variable_get('dennis_gallery_adv_inline_view_mode', 'gallery_reference'),
    '#description' => t('Select the view mode to use when rendering inline references of Advanced Gallery images.'),
  );

  $image_styles = drupal_map_assoc(array_keys(image_styles()));
  array_unshift($image_styles, t('Do not override'));

  $form['advanced']['dennis_gallery_adv_inline_view_mode_image_style'] = array(
    '#type' => 'select',
    '#title' => t('Image style of inline gallery reference images'),
    '#options' => $image_styles,
    '#default_value' => variable_get('dennis_gallery_adv_inline_view_mode_image_style', 0),
    '#description' => t('Select the image style to use when rendering inline references of Advanced Gallery images.'),
    '#states' => array(
      'visible' => array(
        ':input[name="dennis_gallery_adv_inline_view_mode"]' => array('value' => 'gallery_reference'),
      ),
    ),
  );

  return system_settings_form($form);
}
