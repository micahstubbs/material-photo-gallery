var Layout = require('./vendor/google-image-layout');
var Gallery = require('./material-photo-gallery');

// Select gallery element.
var elem = document.querySelector('.m-p-g');

// Init gallery
document.addEventListener('DOMContentLoaded', function() {
	var gallery = new Gallery(elem);
});
