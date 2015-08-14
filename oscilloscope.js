var canvas = $("#canvas")[0];
var WIDTH = 400;
var HEIGHT = 300;
var FRAMERATE = 60;
var SAMPLE_DRAW_RATE = 5; //Increase to reduce resource drain, but also decrease resolution of the drawn wave (1 = Max Resolution/draw every sample)

canvas.width = WIDTH;
canvas.height = HEIGHT;

var canvasCtx = canvas.getContext("2d");

canvasCtx.fillStyle = 'rgb(0, 0, 0)';
canvasCtx.lineWidth = 1;
canvasCtx.strokeStyle = 'rgb(0, 255, 0)';

var bufferData = activeBuffer.getChannelData(0)
var sliceStart = 0;
var sliceSize = 200;

canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

var sampleIdx = 0; //Instead of creating expensive buffer slices, track where we are in the buffer.

function draw(){
	var limit = sampleIdx + sliceSize;
	
	canvasCtx.fillRect(0, 0, 400, 300);

	canvasCtx.beginPath();
	canvasCtx.moveTo(0, HEIGHT/2);
	var xCounter = 0;
	for (; sampleIdx <= limit; sampleIdx++){
		if (xCounter % SAMPLE_DRAW_RATE !== 0){xCounter++;continue}; // Control drawing resolution here (comment out for max res)
		var x = xCounter * (WIDTH / sliceSize);
		var y = bufferData[sampleIdx] * HEIGHT + HEIGHT/2;

		canvasCtx.lineTo(x, y);
		canvasCtx.stroke();
		
		xCounter++;
	}
	
	if (sampleIdx > 40000) { //Only work w/ first 40000 samples
		sampleIdx = 0;
	} 	
}

function drawCall(){
	window.requestAnimationFrame(draw);
}


setInterval(drawCall, 1000/FRAMERATE) //Prefer 60fps

//This version draws the wave gradually, as opposed to the traditional oscilloscope view. Much less taxing on resources, but does not reflect buffer changes until the screen blanks
// canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
// canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
// var tmpSlice = Array.prototype.slice.apply(bufferData, [sliceStart, sliceStart + sliceSize]);
// var sampleIdx = 0;

// function getNextSlice(){
// 	sampleIdx = 0;

// 	canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
// 	canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

// 	canvasCtx.beginPath();
// 	canvasCtx.moveTo(0, HEIGHT/2);

// 	if (sliceStart > 10000) { //Only work w/ first 10000 samples
// 		sliceStart = 0;
// 	} else {
// 	 sliceStart += sliceSize;
// 	}
// 	tmpSlice = Array.prototype.slice.apply(bufferData, [sliceStart, sliceStart + sliceSize]);
// }

// setInterval(function(){

// 	for (var i = 0; i < 5; i++){
// 		var sample = tmpSlice[sampleIdx];
// 		var x = sampleIdx * (WIDTH / sliceSize);
// 		var y = sample * HEIGHT + HEIGHT/2;
// 		canvasCtx.lineTo(x, y);
// 		canvasCtx.stroke();

// 		sampleIdx++;
// 	}

// 	if (sampleIdx !== 0 && sampleIdx >= sliceSize){
// 		getNextSlice();
// 	}
	
// }, 1000 / 60)