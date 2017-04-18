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
   * Search the content for editorially placed placeholders in the content.
   * Replaces them with a different one  so they are ignored when placing the automatic ones.
   * It can later be replaced with actual ad slots.
   *
   * @return {Object}
   *   The instantiated object.
   */
  processPlaceholders: function() {

    // we'll target the manually placed placeholders
    // replacing them temporally by dfpinline-manual-placeholder class
    // to replace them again with the final customized in context placeholder.
    var manualPlaceholder = new RegExp('<div class="dfpinline-auto-placeholder"></div>', 'g');
    var match = this.content.match(manualPlaceholder);

    this.utilseach(match || [], (function(match, key) {
      if (this.tagsLeftCount > 0) {
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
        this.tagsLeftCount--;
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
      this.utilseach(this.tree.querySelectorAll('.dfpinline-manual-placeholder'), (function(item) {
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
    // We grab all paragraphs (p tags).
    if (this.tagsLeftCount < 1) {
      return this;
    }
    var minDistance = (this.config && parseInt(this.config.minDistance)) || 2;
    var firstPosition = ((this.config && parseInt(this.config.firstPosition)) || 1) - 1;
    var pos = 0;
    var method;
    var last = false;
    var maxNumber = this.tags;
    var minWordCount = parseInt(this.config.minimum.inline_total_words);
    var minWordCountAdNumber = parseInt(this.config.minimum.inline_max_num_if_words);
    var lastAdPosition = parseInt(this.config.lastAdPosition);
    //We want to count the amount of words in an article.
    var wordCount = 0;

    // We select all <p> tags inside this.tree and create an array of them.
    var pTags = [];

    [].slice.call( this.tree.childNodes[0].childNodes ).forEach(function( node ) {
      if (node.nodeName === 'P') {
        pTags.push(node);
      }
    });
    
    // Then we clean out the empty ones (if they have html but no text).
    pTags = this.removeEmptyParagraphs(pTags);

    for (var j = 0; j < pTags.length; j++) {
      wordCount += pTags[j].innerText.split(' ').length;
    }
    // Requirement: if less than minWordCount words only show minWordCountAdNumber ads.
    if (wordCount < minWordCount) {
      maxNumber = minWordCountAdNumber;
    }

    // If we have manual placeholders we'll move the next ones forward.
    // Ex: If we have 1 manual placeholder, the automatic will ignore the 1st automatic.

    if(this.placeholderTags > 0){
      firstPosition = firstPosition + (this.placeholderTags * minDistance);
    }

    // We loop as many times as max tags per page.
    for (var index = 0; index < this.tagsLeftCount; index++) {
      // Insert method. After the selected paragraph.
      method = 'after';
      if( index ===0 ){
        pos = firstPosition;
      }
      else{
       pos =  pos + minDistance;
      }
      // Place last ad before the lastAdPosition paragraph if that option is enabled.
      if (this.config.lastAdPositionEnabled === 1 && index === (this.tagsLeftCount - 1)) {
        pos = pTags.length - lastAdPosition;
        method = 'before';
        last = true;
      }
      // If we get to the end of the article don't add more even if we didn't reach the maximum of ads set.
      // Update: Must be 3 or more paragraphs after last  Ad
      if (pos > pTags.length - 4) {
        last = true;
        continue;
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
  },
  /**
   *
   * @param pTags
   * @returns {Array}
     */
  removeEmptyParagraphs: function(pTags){
    // We create a new array where to place the p tags that have no empty html tags inside.
    var newPTags = [];
    for(var i = pTags.length - 1; i >= 0; i--) {
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
