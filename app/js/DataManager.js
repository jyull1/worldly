const d3 = require('d3');

//The data object containing all information for the map in memory.
//Documents attached to the map are represented by string URLs.
var liveData = {};

module.exports = {
	/**
	Returns a blank polygon object for a new map. 
	*/
	newMap: function(){
		liveData = {
			//A wrapper for the geoJSON object. Worldly-specific metadata must be stored outside of geo.
			geo: {
				type: "Polygon",
				coordinates: []
			}			
		}
	},

	getData: function(){
		return liveData;
	}
}