//Instantiate the interface for all audio modules (aka nodes)
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

//Create osc. node
var oscillator = audioCtx.createOscillator();

//Create gain node, which controls the master volume
var gainNode = audioCtx.createGain();

//Hook everything up
oscillator.connect(gainNode); //AudioNode#connect pipes output to another input (oscillator -> gainNode)
gainNode.connect(audioCtx.destination); //destination is the default audio output (speakers) for the browser

var maxFreq = 6000;
var maxVol = 0.02;

var initialFreq = 440;
var initialVol = 0.001;

// set options for the oscillator

oscillator.type = 'square';
oscillator.frequency.value = initialFreq; // value in hertz
//oscillator.detune.value = 100; // value in cents
oscillator.start(0);

oscillator.stop(3)

oscillator.onended = function() {
  console.log('Your tone has now stopped playing!');
}