# Material Photo Gallery

a vanilla JavaScript [material design](https://material.io/design/) photo gallery plugin built with design inspiration from [Google Photos](https://photos.google.com/)

[![scaled-material-photo-gallery](https://user-images.githubusercontent.com/2119400/47237268-63a1c700-d393-11e8-8798-d8d8b264ed23.png)](//micahstubbs.github.io/material-photo-gallery/example)

interact with the live example at https://micahstubbs.github.io/material-photo-gallery/example

## Install

#### Usage

```js
var MaterialPhotoGallery = require('material-photo-gallery')

var elem = document.querySelector('.m-p-g')
var gallery = new MaterialPhotoGallery(elem)
```

#### Include Script

```html
<script src="material-photo-gallery.min.js"></script>
```

#### Include Stylesheet

```html
<link rel="stylesheet" href="material-photo-gallery.css" />
```

#### HTML

```html
<div class="m-p-g">

  <div class="m-p-g__thumbs" data-google-image-layout data-max-height="350">
      <img src="http://unsplash.it/600/400?image=198" data-full="http://unsplash.it/1200/800?image=198" class="m-p-g__thumbs-img" />
      <!-- Rest of your thumbnails... -->
  </div>

  <div class="m-p-g__fullscreen"></div>
</div>
```

Specify the path to the full size images with the `data-full` attribute on the thumbnail images.

#### Initialize Plugin

```js
// Select gallery element.
var elem = document.querySelector('.m-p-g')

// Init gallery
var gallery = new Gallery(elem)
```

## Browser Support

- Latest Edge
- Latest Chrome
- Latest Firefox
- Latest Safari

## Credits

This project uses [imagesLoaded by David DeSandro](https://github.com/desandro/imagesloaded), and [Google Image Layout by ptgamr](https://github.com/ptgamr/google-image-layout).

This project is a fork of https://github.com/TrueValentine/material-photo-gallery that modernises the codebase and adds new features, like swipe gestures on mobile to navigate the gallery from the detail view.

See also the [Bricks](https://github.com/ArjanJ/bricks) image layout library from [ArjanJ](https://github.com/ArjanJ)

## License

MIT license
