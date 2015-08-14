function queryStringToJSON(query) { //http://www.developerdrive.com/2013/08/turning-the-querystring-into-a-json-object-using-javascript/
  var pairs = query.split('&');
  
  var result = {};
  pairs.forEach(function(pair) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  return JSON.parse(JSON.stringify(result));
}

var $synthesizer = $("#synthesizer");
var $mute = $("#mute");

$synthesizer.on("submit", function(event){
	event.preventDefault();
	var queryData = $(event.currentTarget).serialize();
	var formData = queryStringToJSON(queryData)
	
	switch (formData.waveform){
		case "sine":
			fillSine(activeBuffer, 0, formData.frequency);
			break;
		case "overdrive-sine":
			fillSineOverdrive(activeBuffer, 0, formData.frequency);
			break;
		case "square":
			fillPulse(activeBuffer, 0, formData.frequency);
			break;
		case "fourier-square":
			fillPulseFourier(activeBuffer, 0, formData.frequency, 50);
			break;
		case "noise":
			fillNoise(activeBuffer, 0);
			break;
	}
})

$mute.on("click", function(event){
	event.preventDefault();
	fillZero(activeBuffer, 0);
})