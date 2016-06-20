/**
 * Content analyser module
 *
 * @module inlinePlaceholder/ca
 *
 * Creates a ContentAnalyser
 *
 * @constructor
 * @alias
 *   module:inlinePlaceholder/ca
 * @class
 *   Class which analyses content and generates placement mappings.
 *
 * @property {Object} element
 *   The Element object to work on.
 *
 * @property {Array} tags
 *   An array of tags. Every item in the array is an array where the first
 *   child is a string with the machine name of the ad tag and the second is
 *   an object literal with additional attributes. Currently only `classes` is
 *   implemented.
 *   Example `[ 0 => [ 0 => 'mpu_1', 1 => { classes: 'inline-1'} ] ]`
 *   Values are provided from back-end through `Drupal.settings.dennisDfpInline.tags`
 *
 * @property {Integer} placeholderTags
 *   Internal counter for manual placeholders.
 *
 * @property {Array} tagsLeft
 *   An array of keys to help maintaning the number of tags left to process.
 *
 * @property {Array} mapping
 * Array of mapping data which tells the Renderer where to insert ads in
 * `this.element`.
 *
 * @property {Object} tree
 *   A DOM document fragment storing modified element children.
 *
 * @property {String} content
 *   HTML contents of the document fragment.
 *
 * @param {Array} el
 *   Element object to process.
 */
function ContentAnalyser(el, settings) {
  this.config = settings.config;
  this.pattern = new RegExp(this.config.placeholder, 'g');

  this.element = el;
  this.tags = [];
  this.inlineClass = this.config.placeholder;
  this.placeholderTags = 0;
  this.tagsLeftCount = this.config.maxNumber;
  this.mapping = [];

  this.tree = document.createDocumentFragment();
  this.tree.appendChild(el.cloneNode(true));
  this.content = this.tree.querySelector('*').innerHTML;
}

ContentAnalyser.prototype = {

  /**
   * Update the document fragment from the content string.
   *
   * Please note that this is currently done via jQuery .html() method.
   *
   * @return {Object}
   *   The instantiated object.
   */
  updateFragment: function() {
    this.tree.firstElementChild.innerHTML = this.content;

    return this;
  },

  /**
   * Generate a mapping between placeholders and ad tags.
   *
   * @return {Object}
   *   The instantiated object.
   */
  generateMapping: function() {
    // Return early if there is nothing to process.
    if (this.placeholderTags === 0 && this.tagsLeft < 1) {
      return [];
    }

    // Generate mapping of any editorial placeholders.
    this.generatePlaceholderMapping();
    // Generate mapping of any remaining placeholders.
    this.generateAutomatedMapping();

    return this;
  },

  /**
   * Generate mapping of any editorial placeholders.
   *
   * @return {Object}
   *   The instantiated object.
   */
  generatePlaceholderMapping: function() {
    if (this.placeholderTags > 0) {
      // we select all the manual placeholders, with their temporary state to identify
      // and replace with the context generated placeholder.
      this.utilseach(this.tree.querySelectorAll('.inline-manual-placeholder'), (function(item) {
        this.mapping.push([item, 'replaceWith', this.pattern]);
      }).bind(this)); // Function.prototype.bind to keep context.
    }

    return this;
  },

  /**
   * Generate mapping of automated placements.
   *
   * @return {Object}
   *   The instantiated object.
   *
   * @todo Implement minimum paragraph length to avoid spoiling content with
   * too short paragraphs.
   */
  generateAutomatedMapping: function() {

    if (this.tagsLeftCount < 1) {
      return this;
    }

    // TODO - The placeholder that comes in from config, doesn't actually match what is on the page
    // When it does this can be used to match any given placeholder
    // We select all <p> tags inside this.tree and create an array of them.
    var pTags = [];

    [].slice.call(this.tree.childNodes[0].childNodes).forEach(function(node) {
      if (node.nodeName === 'P' && node.textContent) {
        pTags.push(node);
      } else if (node.className && node.className.search('inline') > -1 && node.className.search('placeholder') > -1) {
        pTags = [];
        pTags.push(node);
      }
    });

    // Set all variables and logic together
    var minDistance    = (this.config && this.config.minDistance) ? parseInt(this.config.minDistance, 10) : 2;
    var firstPosition  = (this.config && this.config.firstPosition) ? parseInt(this.config.firstPosition, 10) : 2;
    var lastAdPosition = (this.config && this.config.lastAdPositionEnabled === 1) ? pTags.length - parseInt(this.config.lastAdPosition, 10) : null;
    var maxNumber      = (this.config && this.config.maxNumber) ? parseInt(this.config.maxNumber, 10) : null;

    // Check if there is a minimum amount of words set
    if (this.config.minimum && this.config.minimum.inline_total_words) {
      var wordCount = 0;

      for (var j = 0; j < pTags.length; j++) {
        wordCount += pTags[j].innerText.split(' ').length;
      }

      // Requirement: if less than minWordCount words only show minWordCountAdNumber ads.
      if (wordCount && (wordCount < parseInt(this.config.minimum.inline_total_words, 10))) {
        maxNumber = parseInt(this.config.minimum.inline_max_num_if_words, 10);
      }
      
    }

    if (lastAdPosition) { maxNumber--; }

    var lastAdPlacement = 0;
    var numAdsPlaced    = 0;

    // Loop through our pTags array and place our adverts
    pTags.forEach(function(tag, index) {
      var last = false;
      var method = 'after';
      var placeAd = false;

      // First advert
      if (index === firstPosition) {
        placeAd = true;
      }

      // Min Distance between adverts
      if ((lastAdPlacement + minDistance) === index) {
        placeAd = true;
      }

      // Don't exceed maxNumber of ads
      if (maxNumber && (numAdsPlaced >= maxNumber)) {
        placeAd = false;
      }

      // If last ad rule is set
      if (lastAdPosition) {
        if (index === lastAdPosition) {
          method = 'before';
          placeAd = true;
        }

        if (index > lastAdPosition) {
          placeAd = false;
        }
      } 

      // If any of the criterias are met by the time we get here push them to the DOM
      if (placeAd === true) {
        // Remove side by side ads by removing the first appearing ad
        if (lastAdPlacement === (index - 1)) {
          this.mapping.pop();
        }
        lastAdPlacement = index;
        numAdsPlaced++;
        this.mapping.push([tag, method, last]);
      }
    }.bind(this)); // bind.this to keep context

    return this;
  },

  utilseach: function(collection, fn) {
    var i = 0,
      length = collection.length,
      cont;

    for (i; i < length; i++) {
      cont = fn(collection[i], i);
      if (cont === false) {
        break; //allow early exit
      }
    }
  },
  /**
   * @param pTags
   * @returns {Array}
   */
  removeEmptyParagraphs: function(pTags) {
    // We create a new array where to place the p tags that have no empty html tags inside.
    var newPTags = [];
    for (var i = pTags.length - 1; i >= 0; i--) {
      // If it's not an empty p tag (no text or empty html tag)
      if (pTags[i].textContent) {
        // We push it to our new pTags array.
        newPTags.push(pTags[i]);
      }
    }
    // We reverse the array to make it
    newPTags.reverse();
    return newPTags;
  },
};
