/**
 * Content analyser module
 *
 * @module dfpinline/ca
 *
 * Creates a ContentAnalyser
 *
 * @constructor
 * @alias
 *   module:dfpinline/ca
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
  this.tags = this.config.maxNumber;
  this.inlineClass = this.config.placeholder;
  this.placeholderTags = 0;
  this.tagsLeft = Object.keys(this.tags);
  this.mapping = [];

  this.tree = document.createDocumentFragment();
  this.tree.appendChild(el.cloneNode(true));
  this.content = this.tree.querySelector('*').innerHTML;
}

ContentAnalyser.prototype = {

  /**
   * Search the content for editorially placed placeholders in the content.
   * If found, replace them with an element so they can later be replaced with
   * actual ad slots.
   *
   * @return {Object}
   *   The instantiated object.
   */
  processPlaceholders: function() {
    // Search for editorially inserted placeholders.
    this.utilseach(this.content.match(this.pattern), (function(match, key) {
      if (this.tags.length > 0) {
        // Convert the current match to a pattern.
        var re = new RegExp(match);
        // Generate placeholder elements to replace of the HTML comment.
        var skel = document.createElement('span');
        var el = document.createElement('span');

        el.id = 'dfpinline-placeholder-' + key;
        el.className = 'dfpinline-manual-placeholder';
        skel.appendChild(el);

        // Replace the match with the placeholder element.
        this.content = this.content.replace(re, skel.innerHTML);
        this.placeholderTags++;
      }
    }).bind(this)); // Function.prototype.bind to keep context.

    // Update the document fragment to keep up with changes so far.
    if (this.placeholderTags > 0) {
      this.updateFragment();
    }

    return this;
  },

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
      this.utilseach(this.tree.querySelectorAll('.dfpinline-manual-placeholder'), (function(item) {
        this.mapping.push([item, 'replaceWith', this.tags[0]]);
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
    // @todo Using the immediate child elements for the analysis. This could
    // do with a selector with predefined elements in the future.
    //var children = this.tree.querySelector('*').children;
    // We grab all paragraphs (p tags).
    var pTags = this.tree.querySelectorAll('p');
    var minDistance = (this.config && parseInt(this.config.minDistance)) || 2;
    var firstPosition = ((this.config && parseInt(this.config.firstPosition)) || 1) - 1;
    var pos = 0;
    var i = firstPosition;
    var method;
    var hasManual;
    var last = false;
    var maxNumber = this.tags;
    var numTags = 0;
    var minWordCount = parseInt(this.config['minimum']['inline_total_words']);
    var minWordCountAdNumber = parseInt(this.config['minimum']['inline_max_num_if_words']);
    var lastAdPosition = parseInt(this.config['lastAdPosition']);
    //We want to count the amount of words in an article.
    var wordCount = 0;
    for (var i = 0; i < pTags.length; i++) {
      wordCount += pTags[i].innerText.split(' ').length;
    }
    // Requirement: if less than minWordCount words only show minWordCountAdNumber ads.
    if (wordCount < minWordCount) {
      var maxNumber = minWordCountAdNumber;
    }
    // We loop as many times as max tags per page.
    for (var index = 0; index < maxNumber; index++) {
      // Calculate position.
      pos = ( i++ === firstPosition ) ? firstPosition : ( pos + minDistance );
      // Inject before if manual placement has not happened yet.
      method = hasManual ? 'after' : 'before';
      // Place last ad before the lastAdPosition paragraph.
      if (index == (maxNumber - 1)) {
        pos = pTags.length - lastAdPosition;
        method = 'before';
        last = true;
      }
      this.mapping.push([pTags[pos], method, last]);
    }

    return this;
  },

  utilseach: function(collection, fn) {
    var i = 0,
      length = collection.length,
      cont;

    for (i; i < length; i++) {
      cont = fn(collection[i], i);
      if(cont === false) {
        break; //allow early exit
      }
    }
  }

};
