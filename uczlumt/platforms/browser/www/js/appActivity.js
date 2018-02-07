//load the map
var mymap = L.map('mapid').setView([51.505,-0.09],13);


		
//load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',{
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,'+'<a href="http://creativecommons.org/licenses/by-sa/2.0/"> CC-BY-SA</a>,'+'imagery &copy; <a href="http://mapbox.com">Mapbox</a>', 
	id: 'mapbox.streets'
	}).addTo(mymap);
	
	
// //add a point
// L.marker([51.5,-0.09]).addTo(mymap).bindPopup("<b>Hello world!</b><br/>I am a popup.<br/><a href='http://www.ucl.ac.uk'>Go to UCL website</a>").openPopup();
		
// //add a circle
// L.circle([51.508,-0.11],500,{
	// color: 'red',
	// fillColor: '#f03',
	// fillOpacity: 0.5
// }).addTo(mymap).bindPopup("I am a circle.");
		
// //add a polygon with 3 end points (i.e. a triangle)
// var myPolygon = L.polygon([
	// [51.509,-0.08], 
	// [51.503,-0.06], 
	// [51.51,-0.047]
// ],{
	// color: 'blue',
	// fillColor: '#096aea',
	// fillOpacity: 0.2
// }).addTo(mymap).bindPopup("I am a polygon.");


//create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions  can use the sam variable
var client;
		
//and a variable that will hold the layer itself - we need to do this outside the function so that we can use it to remove the layer later on
var earthquakelayer;

// create icon template
var testMarkerRed = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'red'
});
var testMarkerPink = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'pink'
});
		
//create the code to get the Earthquakes data using an XMLHttpRequest
function getEarthquakes(){
	client = new XMLHttpRequest();
	client.open('GET','https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson');
	client.onreadystatechange = earthquakeResponse; //note don't use earthquakeResponse() with brackets as that doesn't work
	client.send();
}
		
//create the code to wait for the response from the data server, and process the response once it is received
function earthquakeResponse(){
//this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4){
	//once the data is ready, process the data
	var earthquakedata = client.responseText;
	loadEarthquakelayer(earthquakedata);
	}
}
		
//convert the received data - which is text - to JSON format and add it to the map
function loadEarthquakelayer(earthquakedata){
	//convert the text to JSON
	var earthquakejson = JSON.parse(earthquakedata);
	
	//add the JSON layer onto the map it will appear using the default icons
	earthquakelayer = L.geoJson(earthquakejson,
	{
		//use point to layer to create the points
		pointToLayer: function(feature, latlng){
			//look at the GeoJSON filr - specifically at the properties - to see the earthquake magnitude and use a different marker depending on this value
			//also include a pop-up that shows the place value of the earthquakes 
			if (feature.properties.mag>1.75){
				return L.marker(latlng,{icon:testMarkerRed}).bindPopup("<b> location: "+feature.properties.place+"</b>");
			}else{
			//mag is lower than 1.75
				return L.marker(latlng,{icon:testMarkerPink}).bindPopup("<b> location: "+feature.properties.place+"</b>");
			}
		}
	}).addTo(mymap);
	
	//change the map zoom so that all the data is shown
	mymap.fitBounds(earthquakelayer.getBounds());
	autoPan = false;
	
}

// //load the map data (earthquake) after the page has loaded	
// document.addEventListener('DOMContentLoaded',function(){
	// getEarthquakes();
// },false);


//Tracking location
var currentLocationLyr;
var firstTime = true
var previousBound
var autoPan = true

function trackLocation() {
	if (!firstTime){
	// zoom to center
		mymap.flyToBounds(currentLocationLyr.getLatLng().toBounds(250));
		mymap.on('zoomend', function() {
			autoPan = true;
		});
		
	} else {
		autoPan = true;
		if (navigator.geolocation) {
			alert("Getting current location");
			navigator.geolocation.watchPosition(showPosition);
			
			
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}
}

function showPosition(position) {

	if(!firstTime){
		mymap.removeLayer(currentLocationLyr);
	}
	currentLocationLyr = L.marker([position.coords.latitude,position.coords.longitude]).addTo(mymap);
	
	if(firstTime){
		mymap.flyToBounds(currentLocationLyr.getLatLng().toBounds(250));
		firstTime = false;
	}else if (autoPan) {
		mymap.panTo(currentLocationLyr.getLatLng());
		
	}	
}

//turn off autoPan when user drag the map.
mymap.on('dragstart', function() {
	autoPan = false;
})