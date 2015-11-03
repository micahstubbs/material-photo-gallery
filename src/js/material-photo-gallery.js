/**
 *
 * Material Photo Gallery v0.0.1
 * A photo gallery inspired by Google Photos.
 * http://ettrics.com
 *
 * Free to use under the MIT License.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Gallery = factory();
  }
})(this, function() {

  'use strict';

  /**
   * Class constructor for Gallery component.
   *
   * @constructor
   * @param {HTMLElement} element - The gallery element.
   */

  var Gallery = function(element) {
    this._element = element;
    this.init();
  };

  /**
   * Css class names stored as strings.
   *
   * @private
   */

  Gallery.prototype._cssClasses = {
    GALLERY: 'm-p-g',
    THUMBS_BOX: 'm-p-g__thumbs',
    THUMB_IMG: 'm-p-g__thumbs-img',
    FULL_BOX: 'm-p-g__fullscreen',
    FULL_IMG: 'm-p-g__fullscreen-img',
    CONTROLS: 'm-p-g__controls',
    CONTROLS_CLOSE: 'm-p-g__controls-close',
    CONTROLS_NEXT: 'm-p-g__controls-arrow--next',
    CONTROLS_PREV: 'm-p-g__controls-arrow--prev'
  };

  /**
   * Init the Gallery component.
   */

  Gallery.prototype.init = function() {

    // Root element.
    this._gallery = this._element;

    // Container element for thumbnails.
    this._thumbsBox = this._gallery.querySelector('.' + this._cssClasses.THUMBS_BOX);

    // Nodelist of thumbnails.
    this._thumbsNodeList = this._thumbsBox.querySelectorAll('.' + this._cssClasses.THUMB_IMG);

    // Array of thumbnails.
    this._thumbs = Array.prototype.slice.call(this._thumbsNodeList);

    // Container of full size images.
    this._fullBox = this._gallery.querySelector('.' + this._cssClasses.FULL_BOX);

    // Container of controls.
    this._controls = this._gallery.querySelector('.' + this._cssClasses.CONTROLS);

    // Close control button.
    this._closeBtn = this._controls.querySelector('.' + this._cssClasses.CONTROLS_CLOSE);

    // Prev control button.
    this._prevBtn = this._controls.querySelector('.' + this._cssClasses.CONTROLS_PREV);

    // Next control button.
    this._nextBtn = this._controls.querySelector('.' + this._cssClasses.CONTROLS_NEXT);

    // Is true when the full size images have been loaded.
    this._fullImgsLoaded = false;

    // Is true when a full size image is being viewed.
    this._fullImgOpen = false;

    // Bind events to elements.
    this._bindEvents.call(this);

    // Load full size images.
    this._loadFullImgs.call(this);
  };

  /**
   * Add event listeners to elements.
   *
   * @private
   */

  Gallery.prototype._bindEvents = function() {

    for (var i = 0, ii = this._thumbs.length; i < ii; i++) {

      // Add click event to each thumbnail.
      this._thumbs[i].addEventListener('click', this._handleThumbClick.bind(this));

      // Add hover event to each thumbnail.
      this._thumbs[i].addEventListener('mouseover', this._handleThumbHover.bind(this));
    }

    // Add click event to close button.
    this._closeBtn.addEventListener('click', this._handleClose.bind(this));

    // Add click event to next button.
    this._nextBtn.addEventListener('click', this._handleNext.bind(this));

    // Add click event to prev button.
    this._prevBtn.addEventListener('click', this._handlePrev.bind(this));
  };

  /**
   * Load the full size images from the 'data-full' attribute.
   *
   * @private
   */

  Gallery.prototype._loadFullImgs = function() {

    var src, img;

    for (var i = 0, ii = this._thumbs.length; i < ii; i++) {

      // Source of full size image.
      src = this._thumbs[i].getAttribute('data-full');

      // Create empty Image object.
      img = new Image();

      // Give new Image full size image src value.
      img.src = src;

      // Give new Image appropriate class name.
      img.classList.add(this._cssClasses.FULL_IMG);

      // Append full size image to full size image container.
      this._fullBox.appendChild(img);
    }

    this._fullImgsLoaded = true;
  };

  /**
   * Makes the thumbnail transform to the same size and position as the full
   * size image.
   *
   * @private
   */

  Gallery.prototype._cssTransformVal = function() {

    var ww = window.innerWidth,
        wh = window.innerHeight,
        wcx = ww / 2,
        wcy = wh /2;

    var elem1 = this._fullImg.getBoundingClientRect(),
        elem2 = this._thumb.getBoundingClientRect();

    var scaleX = (elem1.width / elem2.width).toFixed(3),
        scaleY = (elem1.height / elem2.height).toFixed(3),
        transX = Math.round( (wcx) - (elem2.left) - (elem2.width / 2) ),
        transY = Math.round( (wcy) - (elem2.top) - (elem2.height / 2) );

    var transform = 'translate(' + transX + 'px,' + transY + 'px) scale(' + scaleX + ',' + scaleY + ')';

    return transform;
  };

  /**
   * Thumbnail hover event.
   *
   * @param {Event} event - The event.
   * @private
   */

  Gallery.prototype._handleThumbHover = function(event) {
    if (this._fullImgsLoaded && !this._fullImgOpen)
      this._transformThumbSetup.call(this, event);
  };

  /**
   * Thumbnail click event.
   *
   * @param {Event} event - The event.
   * @private
   */

  Gallery.prototype._handleThumbClick = function(event) {

    if (this._setupComplete && this._fullImgsLoaded & !this._fullImgOpen) {
      this._activateThumb.call(this); 
      this._activateControls.call(this);
      this._activateFullBox.call(this);

      this._disableScroll();
    } else {
      this._transformThumbSetup.call(this, event, this._handleThumbClick.bind(this));
    }
  };

  /**
   * Caches the thumbnail and full size image that was just hovered over.
   * Stores the css transform value so we can use it later.
   *
   * @param {Event} event - The event.
   * @param {Function} fn - An optional callback function.
   * @private
   */

  Gallery.prototype._transformThumbSetup = function(event, fn) {

    // Cache the thumb being hovered over.
    this._thumb = event.target;

    // Index of thumb.
    this._thumbIndex = this._thumbs.indexOf(this._thumb);

    // The full size image of that thumbnail.
    this._fullImg = this._fullBox.querySelectorAll('.' + this._cssClasses.FULL_IMG)[this._thumbIndex];

    // Do the math for the CSS transform and cache the value.
    this._thumbTransformVal = this._cssTransformVal.call(this);

    this._setupComplete = true;

    if (fn) fn();
  };

  /**
   * Animates the thumbnail and add the active class to it.
   *
   * @private
   */

  Gallery.prototype._activateThumb = function() {

    if (this._thumbTransformVal && this._fullImgsLoaded) {

      this._thumbTransformComplete.call(this);

      var animation = function() {

        // Increase z-index on thumbnail.
        this._thumb.classList.add('active');

        // Transform thumbnail to same size and position as full size image.
        this._thumb.style.webkitTransform = this._thumbTransformVal;
        this._thumb.style.transform = this._thumbTransformVal;

      }.bind(this);

      window.requestAnimationFrame(animation);
    }
  };

  /**
   * When the thumbnail finishes animating the full size image is revealed and
   * the thumbnail is hidden.
   *
   * @private
   */

  Gallery.prototype._thumbTransformComplete = function() {
    
    var complete = function() {

      // Show the full size image.
      this._fullImg.classList.add('active');

      // Hide the thumbnail.
      this._thumb.classList.add('hide');
      this._thumb.classList.remove('active');

      this._fullImgOpen = true;

      this._thumb.removeEventListener('webkitTransitionend', complete);
      this._thumb.removeEventListener('transitionend', complete);
    }.bind(this);

    this._thumb.addEventListener('webkitTransitionend', complete);
    this._thumb.addEventListener('transitionend', complete);
  };

  /**
   * Show the fullBox.
   *
   * @private
   */

  Gallery.prototype._activateFullBox = function() {
    this._fullBox.classList.add('active');
  };

  /**
   * Show the controls.
   *
   * @private
   */

  Gallery.prototype._activateControls = function() {
    this._controls.classList.add('active');
  };

  /**
   * CloseBtn click event.
   *
   * @private
   */

  Gallery.prototype._handleClose = function() {
    if (this._fullImgOpen) {
      this._closeFullImgAndResetThumb.call(this);
    }
  };

  /**
   * Hide the full size image, fullBox, controls, and reset the thumbnail back
   * to its original size and position.
   *
   * @private
   */

  Gallery.prototype._closeFullImgAndResetThumb = function() {

    var animation = function() {

      // Make the thumbnail visible again
      this._thumb.classList.add('active');
      this._thumb.classList.remove('hide');

      setTimeout(function() {

        // Hide full size image
        this._fullImg.classList.remove('active');

        // Hide full size image container
        this._fullBox.classList.remove('active');
        this._controls.classList.remove('active');

        // Make thuumbnail go back to it's original size and shape
        this._thumb.style.transform = 'translate3d(0, 0, 0)';
        this._thumb.style.webkitTransform = 'translate3d(0, 0, 0)';

        // Remove the high z-index.
        this._thumb.classList.remove('active');

        this._fullImgOpen = false;
        this._setupComplete = false;

        this._enableScroll();
      }.bind(this), 100);
    }.bind(this);

    window.requestAnimationFrame(animation);
  };

  /**
   * NextBtn click event.
   *
   * @private
   */

  Gallery.prototype._handleNext = function() {
    if (this._fullImgOpen) {
      this._changeImg.call(this, 'next');
    }
  };

  /**
   * PrevBtn click event.
   *
   * @private
   */

  Gallery.prototype._handlePrev = function() {
    if (this._fullImgOpen) {
      this._changeImg.call(this, 'prev');
    }
  };

  /**
   * Changes the active full size image and active thumbnail based on which
   * arrow was click (prev || next).
   *
   * @param {String} dir - A string to determine if we're going Prev or Next.
   * @private
   */

  Gallery.prototype._changeImg = function(dir) {

    // The full size image we are changing to
    this._newFullImg = dir === 'next' ? this._fullImg.nextElementSibling : this._fullImg.previousElementSibling;

    // The thumbnail we are changing to
    this._newThumb = dir === 'next' ? this._thumb.nextElementSibling : this._thumb.previousElementSibling;

    // Go back to the start when we reach the last image, or go to the end when we reach the first image
    if (!this._newFullImg || this._newFullImg.nodeName !== 'IMG') {
      this._newFullImg = dir === 'next' ? this._newFullImg = this._fullBox.querySelectorAll('.' + this._cssClasses.FULL_IMG)[0] : this._newFullImg = this._fullBox.querySelectorAll('.' + this._cssClasses.FULL_IMG)[this._fullBox.querySelectorAll('.' + this._cssClasses.FULL_IMG).length - 1];

      this._newThumb = dir === 'next' ? this._thumbs[0] : this._thumbs[this._thumbs.length - 1];
    }

    // Hide the old full size image and show the new one
    this._fullImg.classList.remove('active');
    this._fullImg = this._newFullImg;
    this._fullImg.classList.add('active');

    // Hide the old thumbnail and reset its css transforms
    this._thumb.classList.remove('active', 'hide');
    this._thumb.style.webkitTransform = 'translate3d(0, 0, 0)';
    this._thumb.style.transform = 'translate3d(0, 0, 0)';

    // Set the current thumbnail to the new one and apply the css transforms to it
    this._thumb = this._newThumb;
    this._thumb.style.webkitTransform = this._cssTransformVal.call(this);
    this._thumb.style.transform = this._cssTransformVal.call(this);
    this._thumb.classList.add('hide');
  };

  /**
   * Disables scrolling. Activated when a full size image is open.
   *
   * @private
   */

  Gallery.prototype._disableScroll = function() {

    function preventDefault(e) {
      e = e || window.event;
      if (e.preventDefault) e.preventDefault();
      e.returnValue = false;  
    }

    window.onwheel = preventDefault;
    window.ontouchmove  = preventDefault;
  };

  /**
   * Enables scrolling. Activated when a full size image is closed.
   *
   * @private
   */

  Gallery.prototype._enableScroll = function() {
    window.onwheel = null; 
    window.ontouchmove = null;
  };

  function init() {
    var g = document.querySelectorAll('.m-p-g');
    for (var i = 0; i < g.length; i++) {
      var a = new Gallery(g[i]);
    }
  }

  init();
});

