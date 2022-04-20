<?php
/**
 * Plugin Name: E2E Amendments
 */

add_action('wp_head', function (){
  // In order to enable reliable visual regression testing, font differences
  // across platforms must be removed. Otherwise, the visual regression tests
  // result in false negatives when the fonts available on developers' machines,
  // and on CI environment, differ.
  //
  // See https://github.com/jaredpalmer/cypress-image-snapshot/issues/18
  ?>
    <style>
      * { font-family: Helvetica !important; }
    </style>
  <?php
});
