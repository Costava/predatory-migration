function Audio() {
	this.howls = {};

	this.categories = {};

	this.setupDone = false;

	this.totalNumSounds = 0;
	this.numSoundsLoaded = 0;
}

Audio.prototype.add = function(name, paths, category) {
	this.totalNumSounds += 1;

	// `buffer: true` forces HTML5 audio, which can use a file:// location
	var newHowl = new Howl({
		urls: paths,
		buffer: true,
		onload: function() {
			console.log("sound loaded");

			this.numSoundsLoaded += 1;
		}.bind(this),
		onloaderror: function() {
			document.querySelector('.js-loading-text').innerHTML = "Error loading audio. Your browser may not support .wav files.";
		}
	});

	if (typeof category === 'string') {
		if (this.categories[category] === undefined) {
			this.categories[category] = [];
		}

		this.categories[category].push(newHowl);
	}

	this.howls[name] = newHowl;
};

Audio.prototype.setCategoryVolume = function(category, vol) {
	var array = this.categories[category];

	for (var i = 0; i < array.length; i++) {
		array[i].volume(vol);
	}
};

/*
 * Returns true if all sounds have loaded, else false
 */
Audio.prototype.doneLoading = function() {
	if (this.setupDone === true && this.numSoundsLoaded === this.totalNumSounds) {
		return true;
	}

	return false;
};

module.exports = Audio;
