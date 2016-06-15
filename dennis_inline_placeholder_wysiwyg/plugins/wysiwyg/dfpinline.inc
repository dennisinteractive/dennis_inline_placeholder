<?php
/**
 * @file
 * Dennis DFP Inline/Wysiwyg API integration.
 */
define("dennis_inline_placeholder_PLACEHOLDER", '<div class="inline-auto-placeholder"></div>');

/**
 * Implements hook_wysiwyg_plugin().
 */
function dennis_inline_placeholder_wysiwyg_dfpinline_plugin() {
  $plugins['dfpinline'] = array(
    'title'      => t('Inline Ads'),
    'icon file'  => 'dfpinline.png',
    'icon title' => t('Insert inline ad slot placeholder'),
    'settings'   => array(
      'dfpInlinePattern' => variable_get('dennis_inline_placeholder_placeholder', dennis_inline_placeholder_PLACEHOLDER),
    ),
  );

  return $plugins;
}
