(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * imagesLoaded v3.2.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('wolfy87-eventemitter'),
      require('eventie')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( window,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {

'use strict';

var $ = window.jQuery;
var console = window.console;

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) == '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0; i < obj.length; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options, onAlways );
    }
    // use elem as selector string
    if ( typeof elem == 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options == 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0; i < this.elements.length; i++ ) {
      var elem = this.elements[i];
      this.addElementImages( elem );
    }
  };

  /**
   * @param {Node} element
   */
  ImagesLoaded.prototype.addElementImages = function( elem ) {
    // filter siblings
    if ( elem.nodeName == 'IMG' ) {
      this.addImage( elem );
    }
    // get background image on element
    if ( this.options.background === true ) {
      this.addElementBackgroundImages( elem );
    }

    // find children
    // no non-element nodes, #143
    var nodeType = elem.nodeType;
    if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
      return;
    }
    var childImgs = elem.querySelectorAll('img');
    // concat childElems to filterFound array
    for ( var i=0; i < childImgs.length; i++ ) {
      var img = childImgs[i];
      this.addImage( img );
    }

    // get child background images
    if ( typeof this.options.background == 'string' ) {
      var children = elem.querySelectorAll( this.options.background );
      for ( i=0; i < children.length; i++ ) {
        var child = children[i];
        this.addElementBackgroundImages( child );
      }
    }
  };

  var elementNodeTypes = {
    1: true,
    9: true,
    11: true
  };

  ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
    var style = getStyle( elem );
    // get url inside url("...")
    var reURL = /url\(['"]*([^'"\)]+)['"]*\)/gi;
    var matches = reURL.exec( style.backgroundImage );
    while ( matches !== null ) {
      var url = matches && matches[1];
      if ( url ) {
        this.addBackground( url, elem );
      }
      matches = reURL.exec( style.backgroundImage );
    }
  };

  // IE8
  var getStyle = window.getComputedStyle || function( elem ) {
    return elem.currentStyle;
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.addBackground = function( url, elem ) {
    var background = new Background( url, elem );
    this.images.push( background );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    this.progressedCount = 0;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !this.images.length ) {
      this.complete();
      return;
    }

    function onProgress( image, elem, message ) {
      // HACK - Chrome triggers event before object properties have changed. #83
      setTimeout( function() {
        _this.progress( image, elem, message );
      });
    }

    for ( var i=0; i < this.images.length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.once( 'progress', onProgress );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image, elem, message ) {
    this.progressedCount++;
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // progress event
    this.emit( 'progress', this, image, elem );
    if ( this.jqDeferred && this.jqDeferred.notify ) {
      this.jqDeferred.notify( this, image );
    }
    // check if completed
    if ( this.progressedCount == this.images.length ) {
      this.complete();
    }

    if ( this.options.debug && console ) {
      console.log( 'progress: ' + message, image, elem );
    }
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    this.emit( eventName, this );
    this.emit( 'always', this );
    if ( this.jqDeferred ) {
      var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
      this.jqDeferred[ jqMethod ]( this );
    }
  };

  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    var isComplete = this.getIsImageComplete();
    if ( isComplete ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    this.proxyImage = new Image();
    eventie.bind( this.proxyImage, 'load', this );
    eventie.bind( this.proxyImage, 'error', this );
    // bind to image as well for Firefox. #191
    eventie.bind( this.img, 'load', this );
    eventie.bind( this.img, 'error', this );
    this.proxyImage.src = this.img.src;
  };

  LoadingImage.prototype.getIsImageComplete = function() {
    return this.img.complete && this.img.naturalWidth !== undefined;
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'progress', this, this.img, message );
  };

  // ----- events ----- //

  // trigger specified handler for event type
  LoadingImage.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  LoadingImage.prototype.onload = function() {
    this.confirm( true, 'onload' );
    this.unbindEvents();
  };

  LoadingImage.prototype.onerror = function() {
    this.confirm( false, 'onerror' );
    this.unbindEvents();
  };

  LoadingImage.prototype.unbindEvents = function() {
    eventie.unbind( this.proxyImage, 'load', this );
    eventie.unbind( this.proxyImage, 'error', this );
    eventie.unbind( this.img, 'load', this );
    eventie.unbind( this.img, 'error', this );
  };

  // -------------------------- Background -------------------------- //

  function Background( url, element ) {
    this.url = url;
    this.element = element;
    this.img = new Image();
  }

  // inherit LoadingImage prototype
  Background.prototype = new LoadingImage();

  Background.prototype.check = function() {
    eventie.bind( this.img, 'load', this );
    eventie.bind( this.img, 'error', this );
    this.img.src = this.url;
    // check if image is already complete
    var isComplete = this.getIsImageComplete();
    if ( isComplete ) {
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      this.unbindEvents();
    }
  };

  Background.prototype.unbindEvents = function() {
    eventie.unbind( this.img, 'load', this );
    eventie.unbind( this.img, 'error', this );
  };

  Background.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'progress', this, this.element, message );
  };

  // -------------------------- jQuery -------------------------- //

  ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
    jQuery = jQuery || window.jQuery;
    if ( !jQuery ) {
      return;
    }
    // set local variable
    $ = jQuery;
    // $().imagesLoaded()
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  };
  // try making plugin
  ImagesLoaded.makeJQueryPlugin();

  // --------------------------  -------------------------- //

  return ImagesLoaded;

});

},{"eventie":2,"wolfy87-eventemitter":3}],2:[function(require,module,exports){
/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( window );

},{}],3:[function(require,module,exports){
/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listenersMap = this.getListenersAsObject(evt);
        var listeners;
        var listener;
        var i;
        var key;
        var response;

        for (key in listenersMap) {
            if (listenersMap.hasOwnProperty(key)) {
                listeners = listenersMap[key].slice(0);
                i = listeners.length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

},{}],4:[function(require,module,exports){
/**
 *
 * Google Image Layout v0.0.1
 * Description, by Anh Trinh.
 * http://trinhtrunganh.com
 *
 * Free to use under the MIT License.
 *
 */

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory;
	} else {
		root.GoogleImageLayout = factory(root);
	}
})(this, function (root) {

	'use strict';

	var GoogleImageLayout = {};

	var HEIGHTS = [], margin = 5;

	var turnObjToArray = function(obj) {
		return [].map.call(obj, function(element) {
			return element;
		})
	};

	var _debounceOrThrottle = function () {
		if(!useDebounce && !!poll) {
			return;
		}
		clearTimeout(poll);
		poll = setTimeout(function(){
			echo.render();
			poll = null;
		}, delay);
	};

	/**
	 * Get the height that make all images fit the container
	 *
	 * width = w1 + w2 + w3 + ... = r1*h + r2*h + r3*h + ...
	 * 
	 * @param  {[type]} images the images to be calculated
	 * @param  {[type]} width  the container witdth
	 * @param  {[type]} margin the margin between each image 
	 * 
	 * @return {[type]}        the height
	 */
	var _getHeigth = function(images, width, margin) {

		// width -= images.length * margin;
		// width -= images.length;

		var r = 0, img;

		for (var i = 0 ; i < images.length; i++) {
			img = images[i];
			r += parseInt(img.getAttribute('data-width')) / parseInt(img.getAttribute('data-height'));
		}

		return width / r; //have to round down because Firefox will automatically roundup value with number of decimals > 3

	};

	var _setHeight = function(images, height) {

		// console.log("set height");

		HEIGHTS.push(height);

		var img;

		for (var i = 0 ; i < images.length; i++) {
			img = images[i];
			img.style.width = height * parseInt(img.getAttribute('data-width')) / parseInt(img.getAttribute('data-height')) + 'px';
			img.style.height = height + 'px';
			// img.style.marginRight = margin - 4 + 'px'; // -4 is the negative margin of the inline element
			// img.style.marginBottom = margin + 'px';
			img.classList.add('layout-completed');
		}

	};

	GoogleImageLayout.init = function (opts) {
		opts = opts || {};
		var nodes = document.querySelectorAll('div[data-google-image-layout]');
		var length = nodes.length;
		var elem;

		for (var i = 0 ; i < length; i++) {
			elem = nodes[i];
			GoogleImageLayout.align(elem);
		}
	};

	GoogleImageLayout.align = function(elem) {

		//get the data attribute
		
		var containerWidth = elem.clientWidth,
			maxHeight = parseInt(elem.getAttribute('data-max-height') || 120);

		var imgNodes = turnObjToArray(elem.querySelectorAll('img'));

		w : while (imgNodes.length > 0) {

			for (var i = 1 ; i <= imgNodes.length; i++) {
				var slice = imgNodes.slice(0, i);
				var h = _getHeigth(slice, containerWidth, margin);

				if (h < maxHeight) {
					_setHeight(slice, h);
					imgNodes = imgNodes.slice(i);
					continue w;
				}
			}

			_setHeight(slice, Math.min(maxHeight, h));
			break;
		}

	};

	return GoogleImageLayout;
});

var GoogleImageLayout = require('./google-image-layout');
var imagesLoaded = require('imagesloaded');

var imgLoad = imagesLoaded(document.querySelector('.google-image-layout'));

imgLoad.on('progress', function(instance, image) {
  image.img.setAttribute('data-width', image.img.offsetWidth);
  image.img.setAttribute('data-height', image.img.offsetHeight);
});


imgLoad.on('done', function(instance) {
  GoogleImageLayout().init();
});

window.onresize = function() {
  GoogleImageLayout().init();
};
},{"./google-image-layout":4,"imagesloaded":1}],5:[function(require,module,exports){
require('imagesloaded');
require('./google-image-layout');
require('./material-photo-gallery');
},{"./google-image-layout":4,"./material-photo-gallery":6,"imagesloaded":1}],6:[function(require,module,exports){
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
   * @param {HTMLElement} element The gallery element.
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
    this._fullBox = this._gallery.querySelector('#' + this._thumbsBox.getAttribute('data-fullbox'));

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
   * @param {Event} event The event.
   * @private
   */

  Gallery.prototype._handleThumbHover = function(event) {
    if (this._fullImgsLoaded && !this._fullImgOpen)
      this._transformThumbSetup.call(this, event);
  };

  /**
   * Thumbnail click event.
   *
   * @param {event} event The event.
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
   * @param {event} event The event.
   * @param {function} function An optional callback function.
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
   *@private
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
   * @param {String} dir A string to determine if we're going Prev or Next.
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
    this._thumb.style.transform = 'translate3d(0, 0, 0)';

    // Set the current thumbnail to the new one and apply the css transforms to it
    this._thumb = this._newThumb;
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


},{}]},{},[5]);
