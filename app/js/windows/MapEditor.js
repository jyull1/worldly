const d3 = require('d3');

var svg = d3.select("#chart")
			.append('svg');

svg.attr('width', 900)
	.attr('height', 900);