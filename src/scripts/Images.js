function Images() {
	// Holds images so that image names won't conflict
	//  with properties and functions of `Images`
	this.i = {};

	this.setupDone = false;

	this.totalNumImages = 0;
	this.numImagesLoaded = 0;
}

Images.prototype.load = function(path, name) {
	this.totalNumImages += 1;

	this.i[name] = new Image();
	this.i[name].src = path;

	this.i[name].onload = function() {
		console.log("image loaded");

		this.numImagesLoaded += 1;
	}.bind(this);
};

/*
 * Returns true if all images have loaded, else false
 */
Images.prototype.doneLoading = function() {
	if (this.setupDone === true && this.numImagesLoaded === this.totalNumImages) {
		return true;
	}

	return false;
};

module.exports = Images;
