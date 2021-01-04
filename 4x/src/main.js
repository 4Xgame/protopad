var context;

function onDocReady(fn) {
	if (document.readyState != 'loading'){
	  fn();
	} else if (document.addEventListener) {
	  document.addEventListener('DOMContentLoaded', fn);
	} else {
	  document.attachEvent('onreadystatechange', function() {
		if (document.readyState != 'loading')
		  fn();
	  });
	}
  }

onDocReady(function() {
	function renderGrid() {
		for (var i = 0; i < 600/20; i++) {
			for(var j = 0; j < 500/20; j++) {
				drawCell(i, j)
			}
		}
	}
	
	function drawCell(x, y) {
	  var cell = getCell(x,y);
		context.moveTo(20*x, 20*y);
	  if (view == 'heatmap') {
		  context.fillStyle = `rgb(0, ${cell.food}, 0)`
	  } else {
		  context.fillStyle = cell.color
	  }
	  context.fillRect(20*x,20*y,20,20);
	}
	
	function propagateStat(stat, x, y) {
	  var cell = getCell(x,y)
	  if (cell) {
		for (var i = -1; i <= 1; i++){
		  for (var j = -1; j <= 1; j++ ) {
					var nextCell = getCell(x+i, y+j)
			if (nextCell) {
				var cost = nextCell[stat+'Cost']
			  var val = cell[stat] - cost
						
			  if (val > nextCell[stat] && val > 0) {
					updateCell(nextCell, stat, val)
				  propagateStat(stat, x+i, y+j)
			  }
			}
		  }
		}
	  }
	}
	
	function getCell(x, y) {
		if (x >= 0 && x < 600/20 && y >= 0 && y < 500/20) {
		  return cellGrid[x][y]
	  }
	  return null
	}
	
	function setCell(cell, x, y) {
		if (x >= 0 && x < 600/20 && y >= 0 && y < 500/20) {
		  cellGrid[x][y] = Object.assign({}, cell)
	  }
	}
	
	function updateCell(cell, stat, val) {
		cell[stat] = val
	}
	
	var my_canvas = document.getElementById('canvas'),
    context = my_canvas.getContext("2d");
		
	var tileButtons = document.querySelectorAll('button.tile')
	var viewButtons = document.querySelectorAll('button.view')

	var view = 'tiles'
	var tile = 'pasture'

	my_canvas.onclick = function(e) {
	  var x = Math.floor(e.offsetX/20)
	  var y = Math.floor(e.offsetY/20)
	  switch(tile){
	  case 'farm':
		setCell(farm, x, y);
		break;
	  case 'road':
		setCell(road, x, y);
		break;
	  case 'town':
		var cell = getCell(x,y)
		if (cell.food < cell.foodCost) {
			alert('Not enough food for a town at that tile.');
		  break;
		}
		setCell(town, x, y);
		break;
	  case 'pasture':
		setCell(cell, x, y);
		break;
	  }
	 
	  propagateStat('food', x, y);
	  renderGrid()
	}

	tileButtons.forEach(function (button) {
		button.onclick = function() {
		view = 'tile'
		tile = button.getAttribute('data-tile')
		renderGrid()
	  }
	})

	viewButtons.forEach(function (button) {
		button.onclick = function() {
		view = button.getAttribute('data-view')
		renderGrid()
	  }
	})

	var cell = {
		food: 0,
		foodCost: 45,
		color: '#683'
	}
	
	var town = Object.assign({}, cell, {foodCost:80, color:'white'})
	var road = Object.assign({}, cell, {foodCost:5, color:'brown'})
	var farm = Object.assign({}, cell, {food:200, foodCost:0, color:'#7B4'})
	
	var cellGrid = []
	for (var i = 0; i < 600/20; i++) {
		var row = []
		for(var j = 0; j < 500/20; j++) {
		row.push(Object.assign({}, cell))
		}
		cellGrid.push(row)
	}

	setCell(farm, 18, 15)
	setCell(road, 17, 15)
	setCell(road, 16, 15)
	setCell(town, 15, 14)
	setCell(road, 15, 15)
	setCell(road, 14, 15)
	setCell(road, 13, 15)

	propagateStat('food', 18,15)
	renderGrid()
});