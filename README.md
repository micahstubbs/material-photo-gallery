# Material Photo Gallery
A vanilla javascript photo gallery plugin inspired by Google Photos.

## Demo
<a href="//ettrics.github.io/material-photo-gallery/">View demo</a>

## Install

#### NPM
```
npm install material-photo-gallery --save-dev
```

#### Usage
```js
var MaterialPhotoGallery = require('material-photo-gallery');

var elem = document.querySelector('.m-p-g');
var gallery = new MaterialPhotoGallery(elem);
```

#### Include Script
``` html
<script src="material-photo-gallery.min.js"></script>
```

#### Include Stylesheet
``` html
<link rel="stylesheet" href="material-photo-gallery.css" />
```

#### HTML
``` html
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
``` js
// Select gallery element.
var elem = document.querySelector('.m-p-g');

// Init gallery
var gallery = new Gallery(elem);
```

## Browser Support
- Latest Edge
- Latest Chrome
- Latest Firefox
- Latest Safari

## Credits
This project uses [imagesLoaded by David DeSandro](https://github.com/desandro/imagesloaded), and [Google Image Layout by ptgamr](https://github.com/ptgamr/google-image-layout).

## License
MIT license.