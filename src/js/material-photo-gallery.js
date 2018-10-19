/**
 *
 * Material Photo Gallery v0.1.0
 * A photo gallery inspired by Google Photos.
 *
 * Free to use under the MIT License.
 *
 */

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(
      require('imagesLoaded'),
      require('./vendor/google-image-layout'),
      require('./create-controls')
    )
  } else {
    root.Gallery = factory(window.imagesLoaded, window.GoogleImageLayout)
  }
})(this, function(imagesLoaded, GoogleImageLayout, CreateControls) {
  'use strict'

  /**
   * Class constructor for Gallery component.
   *
   * @constructor
   * @param {HTMLElement} element - The gallery element.
   */

  var Gallery = function(element) {
    this._element = element
    this._layout()
  }

  /**
   * Detect CSS transform support
   */

  var transform = false,
    transformString = 'transform',
    domPrefixes = 'Webkit Moz ms'.split(' '),
    pfx = '',
    elem = document.createElement('div')

  if (elem.style.transform !== undefined) {
    transform = true
  }

  if (transform === false) {
    for (var i = 0; i < domPrefixes.length; i++) {
      if (elem.style[domPrefixes[i] + 'Transform'] !== undefined) {
        pfx = domPrefixes[i]
        transformString = pfx + 'Transform'
        transform = true
        break
      }
    }
  }

  /**
   * Detect transitionend event support
   */

  var transitions = {
      transition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'otransitionend'
    },
    transitionendString,
    elem = document.createElement('div')

  for (var t in transitions) {
    if (typeof elem.style[t] !== 'undefined') {
      transitionendString = transitions[t]
      break
    }
  }

  function debounce(func, wait, immediate) {
    var timeout
    return function() {
      var context = this,
        args = arguments
      var later = function() {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  /**
   * handle touch events
   */
  var xDown = null
  var yDown = null

  function getTouches(evt) {
    return (
      evt.touches || evt.originalEvent.touches // browser API
    ) // jQuery
  }

  function handleTouchStart(evt) {
    xDown = getTouches(evt)[0].clientX
    yDown = getTouches(evt)[0].clientY
  }

  function handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return
    }

    var xUp = evt.touches[0].clientX
    var yUp = evt.touches[0].clientY

    var xDiff = xDown - xUp
    var yDiff = yDown - yUp

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff > 0) {
        /* left swipe */
        // alert('left swipe')
        this._handleNext()
      } else {
        /* right swipe */
        // alert('right swipe')
        this._handlePrev()
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
      } else {
        /* down swipe */
      }
    }
    /* reset values */
    xDown = null
    yDown = null
  }

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
  }

  /**
   * Init the Google Image Layout.
   */

  Gallery.prototype._layout = function() {
    var gallery = this
    var imgLoad = imagesLoaded(
      document.querySelector('div[data-google-image-layout]')
    )

    imgLoad.on('progress', function(instance, image) {
      image.img.setAttribute('data-width', image.img.offsetWidth)
      image.img.setAttribute('data-height', image.img.offsetHeight)
    })

    imgLoad.on('done', function(instance) {
      var g = new GoogleImageLayout().init({
        after: function() {
          gallery.init()
        }
      })
    })

    imgLoad.on('fail', function(instance) {
      var galleryEl = gallery._element
      var alertBox = document.createElement('div')
      alertBox.className = 'm-p-g__alertBox'
      var alertBoxTitle = document.createElement('h2')
      alertBoxTitle.innerHTML = 'Error'
      var alertBoxMessage = document.createElement('p')
      alertBox.appendChild(alertBoxTitle)
      alertBox.appendChild(alertBoxMessage)
      galleryEl.appendChild(alertBox)

      var brokenImages = []
      instance.images.forEach(function(image) {
        if (!image.isLoaded) {
          brokenImages.push(image.img.currentSrc)
        }
      })

      alertBoxMessage.innerHTML = 'Failed to load:' + ' ' + brokenImages
    })

    window.onresize = debounce(function() {
      var g = new GoogleImageLayout().init({
        after: function() {
          setTimeout(function() {
            gallery._handleResize()
          }, 500)
        }
      })
    }, 25)
  }

  /**
   * Init the Gallery component.
   */

  Gallery.prototype.init = function() {
    var controls = CreateControls.init()
    this._element.appendChild(controls)

    // Root element.
    this._gallery = this._element

    // Container element for thumbnails.
    this._thumbsBox = this._gallery.querySelector(
      '.' + this._cssClasses.THUMBS_BOX
    )

    // Nodelist of thumbnails.
    this._thumbsNodeList = this._thumbsBox.querySelectorAll(
      '.' + this._cssClasses.THUMB_IMG
    )

    // Array of thumbnails.
    this._thumbs = Array.prototype.slice.call(this._thumbsNodeList)

    // Container of full size images.
    this._fullBox = this._gallery.querySelector('.' + this._cssClasses.FULL_BOX)

    // Container of controls.
    this._controls = this._gallery.querySelector(
      '.' + this._cssClasses.CONTROLS
    )
    // this._controls = CreateControls.init();

    // Close control button.
    this._closeBtn = this._controls.querySelector(
      '.' + this._cssClasses.CONTROLS_CLOSE
    )

    // Prev control button.
    this._prevBtn = this._controls.querySelector(
      '.' + this._cssClasses.CONTROLS_PREV
    )

    // Next control button.
    this._nextBtn = this._controls.querySelector(
      '.' + this._cssClasses.CONTROLS_NEXT
    )

    // Is true when the full size images have been loaded.
    this._fullImgsLoaded = false

    // Is true when a full size image is being viewed.
    this._fullImgOpen = false

    // Bind events to elements.
    this._bindEvents.call(this)

    // Load full size images.
    this._loadFullImgs.call(this)
  }

  /**
   * Add event listeners to elements.
   *
   * @private
   */

  Gallery.prototype._bindEvents = function() {
    for (var i = 0, ii = this._thumbs.length; i < ii; i++) {
      // Add click event to each thumbnail.
      this._thumbs[i].addEventListener(
        'click',
        this._handleThumbClick.bind(this)
      )

      // Add hover event to each thumbnail.
      this._thumbs[i].addEventListener(
        'mouseover',
        this._handleThumbHover.bind(this)
      )
    }

    // Add click event to close button.
    this._closeBtn.addEventListener('click', this._handleClose.bind(this))

    // Add click event to next button.
    this._nextBtn.addEventListener('click', this._handleNext.bind(this))

    // Add click event to prev button.
    this._prevBtn.addEventListener('click', this._handlePrev.bind(this))

    window.addEventListener('scroll', this._handleScroll.bind(this))

    // touch events
    document.addEventListener('touchstart', handleTouchStart.bind(this))
    document.addEventListener('touchmove', handleTouchMove.bind(this))
  }

  Gallery.prototype._handleScroll = debounce(function() {
    this._resetFullImg.call(this)
  }, 25)

  Gallery.prototype._handleResize = function() {
    this._resetFullImg.call(this)
  }

  /**
   * Load the full size images from the 'data-full' attribute.
   *
   * @private
   */

  Gallery.prototype._loadFullImgs = function() {
    var src, img

    for (var i = 0, ii = this._thumbs.length; i < ii; i++) {
      // Source of full size image.
      src = this._thumbs[i].getAttribute('data-full')

      // Create empty Image object.
      img = new Image()

      // Give new Image full size image src value.
      img.src = src

      // Give new Image appropriate class name.
      img.classList.add(this._cssClasses.FULL_IMG)

      // Append full size image to full size image container.
      this._fullBox.appendChild(img)
    }

    this._loadFullImgsDone.call(this)
  }

  Gallery.prototype._loadFullImgsDone = function() {
    var imgLoad = imagesLoaded(this._fullBox)
    imgLoad.on(
      'done',
      function(instance) {
        var imgArr = instance.images

        this._fullImgs = []
        this._fullImgDimensions = []
        this._fullImgsTransforms = []

        for (var i = 0, ii = imgArr.length; i < ii; i++) {
          var rect = imgArr[i].img.getBoundingClientRect()
          this._fullImgs.push(imgArr[i].img)
          this._positionFullImgs.call(this, imgArr[i].img, i)
          this._fullImgDimensions.push(rect)
        }

        this._fullImgsLoaded = true
      }.bind(this)
    )
  }

  Gallery.prototype._positionFullImgs = function(img, i, applyTransform) {
    var transform = this._transformFullImg(img, this._thumbs[i])
    this._fullImgsTransforms.push(transform)

    img.style.marginTop = -img.height / 2 + 'px'
    img.style.marginLeft = -img.width / 2 + 'px'
    if (applyTransform !== false) {
      img.style[transformString] = transform
    }
  }

  /**
   * Makes the thumbnail transform to the same size and position as the full
   * size image.
   *
   * @private
   */

  Gallery.prototype._transformFullImg = function(fullImg, thumb, fullImgSize) {
    var scaleX, scaleY, transX, transY

    fullImg = fullImg.getBoundingClientRect()
    thumb = thumb.getBoundingClientRect()

    if (fullImgSize) {
      scaleX = (thumb.width / fullImgSize.width).toFixed(3)
      scaleY = (thumb.height / fullImgSize.height).toFixed(3)
      transX = thumb.left - fullImgSize.left + fullImgSize.width / 2
      transY = thumb.top - fullImgSize.top + fullImgSize.height / 2
    } else {
      scaleX = (thumb.width / fullImg.width).toFixed(3)
      scaleY = (thumb.height / fullImg.height).toFixed(3)
      transX = thumb.left - fullImg.left + fullImg.width / 2
      transY = thumb.top - fullImg.top + fullImg.height / 2
    }

    var transform =
      'translate(' +
      transX +
      'px,' +
      transY +
      'px) scale(' +
      scaleX +
      ',' +
      scaleY +
      ')'

    return transform
  }

  Gallery.prototype._resetFullImg = function() {
    this._fullImgsTransforms = []

    for (var i = 0, ii = this._fullImgs.length; i < ii; i++) {
      var size = {
        width: this._fullImgDimensions[i].width,
        height: this._fullImgDimensions[i].height,
        left: this._fullImgDimensions[i].left,
        top: this._fullImgDimensions[i].top
      }

      if (i === this._thumbIndex && this._fullImgOpen) {
        this._fullImgs[i].removeAttribute('style')
        this._positionFullImgs.call(this, this._fullImgs[i], i, false)
      } else {
        this._fullImgs[i].removeAttribute('style')
        this._positionFullImgs.call(this, this._fullImgs[i], i)
      }
    }
  }

  /**
   * Thumbnail hover event.
   *
   * @param {Event} event - The event.
   * @private
   */

  Gallery.prototype._handleThumbHover = function(event) {
    if (this._fullImgsLoaded && !this._fullImgOpen) {
      this._transformThumbSetup.call(this, event)
    }
  }

  /**
   * Thumbnail click event.
   *
   * @param {Event} event - The event.
   * @private
   */

  Gallery.prototype._handleThumbClick = function(event) {
    if (this._thumb != event.target) {
      // Cache the thumb being hovered over.
      this._thumb = event.target

      // Index of thumb.
      this._thumbIndex = this._thumbs.indexOf(this._thumb)

      // The full size image of that thumbnail.
      this._fullImg = this._fullImgs[this._thumbIndex]
    }

    if (this._setupComplete && this._fullImgsLoaded && !this._fullImgOpen) {
      this._activateFullImg.call(this)
      this._activateControls.call(this)
      this._activateFullBox.call(this)
      this._disableScroll()
    }
  }

  /**
   * Caches the thumbnail and full size image that was just hovered over.
   * Stores the css transform value so we can use it later.
   *
   * @param {Event} event - The event.
   * @param {Function} fn - An optional callback function.
   * @private
   */

  Gallery.prototype._transformThumbSetup = function(event, fn) {
    this._setupComplete = false

    // Cache the thumb being hovered over.
    this._thumb = event.target

    // Index of thumb.
    this._thumbIndex = this._thumbs.indexOf(this._thumb)

    // The full size image of that thumbnail.
    this._fullImg = this._fullImgs[this._thumbIndex]

    this._setupComplete = true

    if (fn) fn()
  }

  Gallery.prototype._activateFullImg = function() {
    this._thumb.classList.add('hide')
    this._fullImg.classList.add('active')
    this._fullImg.style[transformString] = 'translate3d(0,0,0)'
    this._fullImgOpen = true

    this._fullImgs.forEach(function(img) {
      if (!img.classList.contains('active')) {
        img.classList.add('almost-active')
      }
    })
  }

  /**
   * Show the fullBox.
   *
   * @private
   */

  Gallery.prototype._activateFullBox = function() {
    this._fullBox.classList.add('active')
  }

  /**
   * Show the controls.
   *
   * @private
   */

  Gallery.prototype._activateControls = function() {
    this._controls.classList.add('active')
  }

  /**
   * CloseBtn click event.
   *
   * @private
   */

  Gallery.prototype._handleClose = function() {
    if (this._fullImgOpen) {
      this._closeFullImg.call(this)
    }
  }

  Gallery.prototype._closeFullImg = function() {
    var animation = function() {
      this._fullBox.classList.remove('active')
      this._controls.classList.remove('active')
      this._fullImg.style[transformString] = this._fullImgsTransforms[
        this._thumbIndex
      ]
      this._thumb.classList.remove('hide')

      this._fullImgs.forEach(function(img) {
        img.classList.remove('almost-active')
      })

      var fullImgTransEnd = function() {
        this._fullImg.classList.remove('active')
        this._fullImg.removeEventListener(transitionendString, fullImgTransEnd)

        this._fullImgOpen = false
      }.bind(this)

      this._fullImg.addEventListener(transitionendString, fullImgTransEnd)
      this._enableScroll()
    }.bind(this)

    window.requestAnimationFrame(animation)
  }

  /**
   * NextBtn click event.
   *
   * @private
   */

  Gallery.prototype._handleNext = function() {
    if (this._fullImgOpen) {
      this._changeImg.call(this, 'next')
    }
  }

  /**
   * PrevBtn click event.
   *
   * @private
   */

  Gallery.prototype._handlePrev = function() {
    if (this._fullImgOpen) {
      this._changeImg.call(this, 'prev')
    }
  }

  /**
   * Changes the active full size image and active thumbnail based on which
   * arrow was click (prev || next).
   *
   * @param {String} dir - A string to determine if we're going Prev or Next.
   * @private
   */

  Gallery.prototype._changeImg = function(dir) {
    this._thumbIndex = this._fullImgs.indexOf(this._fullImg)
    dir === 'next' ? (this._thumbIndex += 1) : (this._thumbIndex -= 1)

    this._newFullImg =
      dir === 'next'
        ? this._fullImg.nextElementSibling
        : this._fullImg.previousElementSibling

    if (!this._newFullImg || this._newFullImg.nodeName !== 'IMG') {
      this._newFullImg =
        dir === 'next'
          ? (this._newFullImg = this._fullImgs[0])
          : (this._newFullImg = this._fullImgs[this._fullImgs.length - 1])
      dir === 'next'
        ? (this._thumbIndex = 0)
        : (this._thumbIndex = this._fullImgs.length - 1)
    }

    this._newFullImg.style[transformString] = 'translate3d(0,0,0)'
    this._fullImg.classList.remove('active')
    this._fullImg.style[transformString] = this._fullImgsTransforms[
      this._thumbIndex - 1
    ]

    this._fullImg = this._newFullImg
    this._fullImg.classList.add('active')
  }

  /**
   * Disables scrolling. Activated when a full size image is open.
   *
   * @private
   */

  Gallery.prototype._disableScroll = function() {
    function preventDefault(e) {
      e = e || window.event
      if (e.preventDefault) e.preventDefault()
      e.returnValue = false
    }

    window.onwheel = preventDefault
    window.ontouchmove = preventDefault
  }

  /**
   * Enables scrolling. Activated when a full size image is closed.
   *
   * @private
   */

  Gallery.prototype._enableScroll = function() {
    window.onwheel = null
    window.ontouchmove = null
  }

  return Gallery
})
