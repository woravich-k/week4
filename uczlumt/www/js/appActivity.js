//load the map
var mymap = L.map('mapid').setView([51.505,-0.09],13);


		
//load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',{
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,'+'<a href="http://creativecommons.org/licenses/by-sa/2.0/"> CC-BY-SA</a>,'+'imagery &copy; <a href="http://mapbox.com">Mapbox</a>', 
	id: 'mapbox.streets'
	}).addTo(mymap);

// //create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions  can use the sam variable
// var client;
		
// //and a variable that will hold the layer itself - we need to do this outside the function so that we can use it to remove the layer later on
// var earthquakelayer;

// create icon template
var testMarkerRed = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'red'
});
var testMarkerPink = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'pink'
});
		
//create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions  can use the sam variable
var client;

//and a variable that will hold the layer itself - we need to do this outside the function so that we can use it to remove the layer later on
var earthquakelayer;
var busstoplayer;

//use as global variable as they will be used to remove layers and avoid duplicate layers.
var loadingEarthquakes;
var loadingBusstops;
		
//create the code to get the Earthquakes data using an XMLHttpRequest
function getData(layername){
	autoPan = false;
	if (layername == "earthquakes" && !loadingEarthquakes){
		url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
	}else if (layername == "busstops" && !loadingBusstops){
		url = 'data/busstops.geojson'
	}else {
		alert("The layer is not loaded to the map, since it has already been existed.")
		return
	}
	//alert("Loading")
	client = new XMLHttpRequest();
	
	client.open('GET', url);
	client.onreadystatechange = dataResponse; //note don't use earthquakeResponse() with brackets as that doesn't work
	client.send();
}

//create the code to wait for the response from the data server, and process the response once it is received
function dataResponse(){
//this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4){
	//once the data is ready, process the data
	var geoJSONData = client.responseText;
	loadLayer(geoJSONData);
	}
}


//convert the received data - which is text - to JSON format and add it to the map
function loadLayer(geoJSONData){
	
	//convert the text to JSON
	var json = JSON.parse(geoJSONData);
	//decide which layer do we load?
	//avoid duplicate layers
	if (geoJSONData.indexOf("earthquake")>0){
		loadingEarthquakes = true;
		earthquakelayer = L.geoJson(json,
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
	}else if (geoJSONData.indexOf("IIT_METHOD")>0){
		loadingBusstops = true;
		busstoplayer = L.geoJson(json).addTo(mymap)
		// zoom to bus stops
		mymap.fitBounds(busstoplayer.getBounds());
	}

}

function removeData(layername){
//check whether the layer is existed on the map or not if not inform the user.
	if (layername == "earthquakes") {
		if (loadingEarthquakes){
			//alert("removing the earthquake data here");
			mymap.removeLayer(earthquakelayer);
			loadingEarthquakes = false;
		} else {
			alert("There is no earthquake layer on the map");
		}
	}
	if (layername == "busstops") {
		if (loadingBusstops){
			//alert("removing the busstops data here");
			mymap.removeLayer(busstoplayer);
			loadingBusstops = false;
		} else {
			alert("There is no bus stop layer on the map");
		}
	}
	
}
	



//Tracking location
var currentLocationLyr;
var id;
var firstTime = true;
var previousBound;
var autoPan = false;

function trackLocation() {
	if (!firstTime){
	// zoom to center
		mymap.fitBounds(currentLocationLyr.getLatLng().toBounds(250));
		autoPan = true;
		
		
	} else {
		if (navigator.geolocation) {
			alert("Getting current location");
			id = navigator.geolocation.watchPosition(showPosition);
			
			
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
		firstTime = false;
		mymap.fitBounds(currentLocationLyr.getLatLng().toBounds(250));
		autoPan = true;
	}else if (autoPan) {
		mymap.panTo(currentLocationLyr.getLatLng());
		
	}	
}

//turn off autoPan when user drag the map.
mymap.on('dragstart', function() {
	autoPan = false;
})


function alertAuto(){
	alert(autoPan);
	
}





//Earthquakes switch
var EQbox = document.getElementById("EQbox");	
function EQ()	{
//add a point
	if (EQbox.checked){
		getData('earthquakes');
	} else {
		removeData('earthquakes');
	}
}

//Bus switch
var Busbox = document.getElementById("Busbox");	
function bus()	{
//add a point
	if (Busbox.checked){
		getData('busstops');
	} else {
		removeData('busstops');
	}
}

//Current location switch
var locationBox = document.getElementById("locationBox");	
function currentLocation()	{
//add a point
	if (locationBox.checked){
		trackLocation();
	} else {
		navigator.geolocation.clearWatch(id);
		mymap.removeLayer(currentLocationLyr);
		firstTime = true;
		autoPan = false;
		
	}
}


//UCL switch
var UCL;
var UCLbox = document.getElementById("UCLbox");	
function UCLpoint()	{
//add a point
	if (UCLbox.checked){
		autoPan = false;
		UCL = L.marker([51.5,-0.09]).addTo(mymap).bindPopup("<b>Hello world!</b><br/>I am a popup.<br/><a href='http://www.ucl.ac.uk'>Go to UCL website</a>").openPopup();
		mymap.flyToBounds(UCL.getLatLng().toBounds(500));
	} else {
		mymap.removeLayer(UCL);
	}
}
	
//add a circle
var circle;
var circle_box = document.getElementById("circle_box");		
function addCircle(){
	if (circle_box.checked){
		autoPan = false;
		circle = L.circle([51.508,-0.11],500,{
			color: 'red',
			fillColor: '#f03',
			fillOpacity: 0.5
		}).addTo(mymap).bindPopup("I am a circle.");
		mymap.flyToBounds(circle);
	} else {
		mymap.removeLayer(circle);
	}
	
}
		
//add a polygon with 3 end points (i.e. a triangle)
var myPolygon;
var poly_box = document.getElementById("poly_box");	
function addPolygon(){
	if (poly_box.checked){
		autoPan = false;
		myPolygon = L.polygon([
			[51.509,-0.08], 
			[51.503,-0.06], 
			[51.51,-0.047]
		],{
			color: 'blue',
			fillColor: '#096aea',
			fillOpacity: 0.2
		}).addTo(mymap).bindPopup("I am a polygon.");
		mymap.flyToBounds(myPolygon);
		
	} else {
		mymap.removeLayer(myPolygon);
	}
}

function panToCurrentLoc(){
	if (!firstTime) {
		trackLocation();
	}
}

