define([
  'dfpinline/slotrender',
  'domReady!',
  'has',
], function(slotrender) {

  return {
    init: function() {
      return slotrender.init();
    }
  };
});
