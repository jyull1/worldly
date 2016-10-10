const 	d3 = require('d3'),
	 	DataManager = require('./js/DataManager.js');

var svg = d3.select("#chart")
			.append('svg')
				.attr('width', 900)
				.attr('height', 900)
				.style("fill", "blue");

var newMapButton = d3.select('#newMap');

newMapButton.on('click', DataManager.newMap);