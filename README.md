# Material Photo Gallery
A photo gallery inspired by Google Photos.

## Demo

## Install

#### Include Script
``` html
<script src="material-photo-gallery.min.js"></script>
```

#### Include Stylesheet
``` html
<link rel="stylesheet" href="material-photo-gallery.css" />
```

### HTML Structure
``` html
<div class="m-p-g">

	<!-- GALLERY THUMBNAILS -->
	<div class="m-p-g__thumbs google-image-layout" data-google-image-layout data-max-height="350">
			<img src="http://unsplash.it/600/400?image=198" data-full="http://unsplash.it/1200/800?image=198" class="m-p-g__thumbs-img" />
			<!-- add your thumbnails here -->
	</div>

	<div class="m-p-g__fullscreen">
		<!-- FULL SIZE IMAGES GET APPENDED HERE -->
	</div>

	<!-- GALLERY CONTROLS -->
	<div class="m-p-g__controls">
		<button type="button" class="m-p-g__controls-close">
			<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
		</button>
		<button type="button" class="m-p-g__controls-arrow m-p-g__controls-arrow--prev" data-prev>
			<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
		</button>
		<button type="button" class="m-p-g__controls-arrow m-p-g__controls-arrow--next" data-next>
			<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
		</button>
	</div>
</div>
```