var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var channels = 2; 
var frameCount = audioCtx.sampleRate * 2.0 //Usually sample rate is 44100Hz. This means the buffer will fill 2 seconds

//second param is length of buffer, last is sampleRate
var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);

//Smaller buffer; may not be large enough for lower frequencies
var loopBuffer = audioCtx.createBuffer(channels, 2400, audioCtx.sampleRate);

var INTERVAL = (2 * Math.PI)/360;
var AMPLITUDE = 0.1;

//Zero-out buffer
function fillZero(buffer, channel){
	var rawBuffer = buffer.getChannelData(channel)
	var endOfBuffer = rawBuffer.length;
	for (var i = 0; i < endOfBuffer; i++) {
	  rawBuffer[i] = 0;
	}
}

//Fill the buffer with white noise;
//just random values between -1.0 and 1.0
function fillNoise(buffer, channel){
	var rawBuffer = buffer.getChannelData(channel)
	var endOfBuffer = rawBuffer.length;
	for (var i = 0; i < endOfBuffer; i++) {
	  // Math.random() is in [0; 1.0]
	  // audio needs to be in [-1.0; 1.0]
	  rawBuffer[i] = Math.random() * 2 - 1;
	}
}

function fillPulseFourier(buffer, channel, freq, harmonicDepth){
	var rawBuffer = buffer.getChannelData(channel)
	var endOfBuffer = buffer.length;
	var timeAdjust = audioCtx.sampleRate / freq

	//Hard-coded Fourier way; see Wikipedia
	// var incrementA = (2 * Math.PI) / timeAdjust;
	// var incrementB = (6 * Math.PI) / timeAdjust;
	// var incrementC = (10 * Math.PI) / timeAdjust;
	// var incrementD = (14 * Math.PI) / timeAdjust;
	// var incrementE = (18 * Math.PI) / timeAdjust;
	// var incrementF = (22 * Math.PI) / timeAdjust;
	// var incrementG = (26 * Math.PI) / timeAdjust;
	// var incrementH = (30 * Math.PI) / timeAdjust;
	// var incrementI = (34 * Math.PI) / timeAdjust;
	// var incrementJ = (38 * Math.PI) / timeAdjust;

	// for (var i = 0; i < endOfBuffer; i++){
	// 	rawBuffer[i] = AMPLITUDE * (4 / Math.PI) * ((Math.sin(i * incrementA)) + 
	// 																				((1/3) * Math.sin(i * incrementB)) + 
	// 																				((1/5) * Math.sin(i * incrementC)) +
	// 																				((1/7) * Math.sin(i * incrementD)) +
	// 																				((1/9) * Math.sin(i * incrementE)) +
	// 																				((1/11) * Math.sin(i * incrementF)) +
	// 																				((1/13) * Math.sin(i * incrementG)) +
	// 																				((1/15) * Math.sin(i * incrementH)) +
	// 																				((1/17) * Math.sin(i * incrementI)) +
	// 																				((1/19) * Math.sin(i * incrementJ)) 
	// 																			 ); 
	// }

	//Dynamic version of above
	var increments = [];
	var piMultiple = 2;
	for (var i = 0; i < harmonicDepth; i++){
		increments.push((piMultiple * Math.PI) / timeAdjust);
		piMultiple += 4;
	}	

	for (var i = 0; i < endOfBuffer; i++){
		var sample = AMPLITUDE * (4 / Math.PI);
		var sampleAdjustor = 0;
		var divisor = 1;
		increments.forEach(function(incr){
			sampleAdjustor += ((1 / divisor) * Math.sin(i * incr));
			divisor += 2;
		});
		sample *= sampleAdjustor;
		rawBuffer[i] = sample;
	}
}

//Faster than Fourier method
function fillPulse(buffer, channel, freq){
	var rawBuffer = buffer.getChannelData(channel)
	var endOfBuffer = buffer.length;
	var timeAdjust = audioCtx.sampleRate / freq
	
	var increment = (2 * Math.PI) / timeAdjust; //see: http://www.topherlee.com/software/pcm-tut-sine.html

	for (var i = 0; i < endOfBuffer; i++){
		rawBuffer[i] = (Math.sin(i * increment) < 0) ? AMPLITUDE : AMPLITUDE * -1; //Simply round the values to make a square wave
	}
}

function fillSine(buffer, channel, freq){
	//AudioBuffer#getChannelData returns a Float32Array which holds the PCM data
	var rawBuffer = buffer.getChannelData(channel)
	var endOfBuffer = buffer.length;

	var increment = (2 * Math.PI) / (audioCtx.sampleRate / freq); //see: http://www.topherlee.com/software/pcm-tut-sine.html

	for (var i = 0; i < endOfBuffer; i++){
		rawBuffer[i] = AMPLITUDE * Math.sin(i * increment); //Multiply the amplitude by the sine
	}
}

//Add Hard Clipping
function fillSineOverdrive(buffer, channel, freq){
	var rawBuffer = buffer.getChannelData(channel)
	var endOfBuffer = buffer.length;

	var increment = (2 * Math.PI) / (audioCtx.sampleRate / freq); //see: http://www.topherlee.com/software/pcm-tut-sine.html

	for (var i = 0; i < endOfBuffer; i++){
		var sinVal = Math.sin(i * increment);
		if (sinVal > 0.7) {
			rawBuffer[i] = AMPLITUDE * 0.7;
		} else if (sinVal < -0.7){
			rawBuffer[i] = AMPLITUDE * -0.7;
		} else {
			rawBuffer[i] = AMPLITUDE * sinVal; 
		}
	}
}

var activeBuffer = myArrayBuffer;

fillZero(activeBuffer, 0);

var source = audioCtx.createBufferSource(); //Returns an AudioBufferSourceNode, which is used to play an AudioBuffer
source.buffer = activeBuffer; //myArrayBuffer; //Hook up source to buffer
source.loop = true; //default is false
source.connect(audioCtx.destination); //Pipe to audio out
source.start(); //No args immediately starts playback, will play
//source.stop(8); //Parameter must be in SECONDS
source.onended = function(){console.log("DONE :)")}