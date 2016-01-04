var Controls = {};
Controls.keyDownMap = {};

Controls.mouseSens = 0.0100;//rads per pixel;

Controls.getKey = function(keyCode) {
	var key = String.fromCharCode(keyCode);

	// console.log(`key: ${key}`);

	return key;
};

Controls.keydown = function(e) {
	// console.log(e.key, e.code, e.keyCode, e.charCode);

	var key = Controls.getKey(e.keyCode);

	if (Controls.keyDownMap[key] != true) {
		Controls.keyDownMap[key] = true;
	}
};

Controls.isKeyDown = function(key) {
	// Controls.keyDownMap[key] is not simply returned because
	// it could be undefined
	if (Controls.keyDownMap[key]) {
		return true;
	}

	return false;
};

Controls.keyup = function(e) {
	var key = Controls.getKey(e.keyCode);

	Controls.keyDownMap[key] = false;
};

Controls.getDirOffsetVector = function(src) {
	var dirOffsetVector = {x: 0, y: 0};

	if (src === 'keyboard') {
		if (Controls.isKeyDown('W')) {
			dirOffsetVector.x += 1;
		}
		if (Controls.isKeyDown('A')) {
			dirOffsetVector.y += 1;
		}
		if (Controls.isKeyDown('S')) {
			dirOffsetVector.x -= 1;
		}
		if (Controls.isKeyDown('D')) {
			dirOffsetVector.y -= 1;
		}
	}

	return dirOffsetVector;
};

module.exports = Controls;
