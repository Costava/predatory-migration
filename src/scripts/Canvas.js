var Canvas = {};

Canvas.clear = function(canvas, ctx) {
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
};

/*
 * Draws border box with top left corner at (x, y).
 * Border and fill
 *  - can be drawn independently
 *  - will be drawn if the respective color is provided
 * @param {2d context} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} borderWidth
 * @param {string} [borderColor]
 * @param {string} [fillColor]
 */
Canvas.drawBorderBox = function(ctx, x, y, width, height, borderWidth, borderColor, fillColor) {
	ctx.save();

	ctx.translate(x, y);

	if (borderColor) {
		var leftX = borderWidth / 2;
		var rightX = width - borderWidth / 2;
		var topY = leftX;
		var botY = height - borderWidth / 2;

		ctx.beginPath();
		ctx.moveTo(leftX, 0);
		ctx.lineTo(leftX, botY);
		ctx.lineTo(rightX, botY);
		ctx.lineTo(rightX, topY);
		ctx.lineTo(borderWidth, topY);

		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.stroke();
		ctx.closePath();
	}

	if (fillColor) {
		ctx.fillStyle = fillColor;
		ctx.fillRect(
			borderWidth,
			borderWidth,
			width - 2 * borderWidth,
			height - 2 * borderWidth);
	}

	ctx.restore();
};

Canvas.fillCircle = function(ctx, x, y, radius, color) {
	ctx.save();

	ctx.translate(x, y);
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI);

	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

Canvas.drawPlayerBlip = function(ctx, x, y, radius, lineWidth, direction, color) {
	ctx.save();
	ctx.translate(x, y);

	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI);
	var xdist = radius * Math.cos(direction);
	var ydist = radius * Math.sin(direction);
	ctx.moveTo(xdist, -ydist);
	ctx.lineTo(2 * xdist, 2 * -ydist);

	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;

	ctx.stroke();
	ctx.closePath();

	ctx.restore();
};

Canvas.drawViewTri = function(ctx, x, y, direction, FOV, viewDistance) {
	ctx.save();

	var side = (1 / Math.cos(FOV / 2)) * viewDistance;

	ctx.translate(x, y);
	// Math.PI / 2 is added so triangle is not rotated
	// counter-clockwise by that much
	ctx.rotate(-direction + Math.PI / 2);

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.rotate(FOV / 2);
	ctx.lineTo(0, -side);
	ctx.rotate(-FOV);
	ctx.lineTo(0, -side);
	ctx.lineTo(0, 0);

	ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

Canvas.setImageSmoothing = function(ctx, state) {
	ctx.imageSmoothingEnabled = state;
	ctx.mozImageSmoothingEnabled = state;
	ctx.webkitImageSmoothingEnabled = state;
};

module.exports = Canvas;
