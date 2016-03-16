$(document).ready(function(){
	
	var w = 960,				//width of display area
		h = 500,				//height of display area
		sz = 10,				//size of squares
		r = sz / 2,				//half size
		t = 2,					//max time for delay
		isMouseDown = false,	//variable to check if mouse is being held down
		runTime = 500,			//default time to run 500ms
		running = false,		//variable to check if the simulation is running
		timerId = 0;			//variable to store the delay timer id 
		
	
	var rows = Math.ceil(h / sz);	//number of rows
	var cols = Math.ceil(w / sz);	//number of columns
	
	//fills the cells with an array of cell objects
	var cells = d3.range(0, rows * cols).map(function (d) {
	  var col = d % cols;
	  var row = (d - col) / cols;
	  var alive = false;
	  return {
		r: row,
		c: col,
		x: col * sz + r,
		y: row * sz + r,
		alive: alive
	  }
	});
	//functions to get the x and y of the rectangle
	var rectx = function(d) { return d.x - r; };
	var recty = function(d) { return d.y - r; };
	//function to fill the presets with alive cells
	var fillPreset = function(data){
		data.data.forEach(function(d){
			cells[d[1]*cols + d[0]+(Math.ceil(cols/2) - Math.ceil(data.width/2))+((Math.ceil(rows/2)-Math.ceil(data.height/2)) * cols )].alive = true;
		});
		update(cells);
	};	
	//hard coded preset data 
	var presetData = [
		{
			'name':'creeper face',
			'data':[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],
				[0,1],[9,1],
				[0,2],[2,2],[3,2],[6,2],[7,2],[9,2],
				[0,3],[2,3],[3,3],[6,3],[7,3],[9,3],
				[0,4],[4,4],[5,4],[9,4],
				[0,5],[3,5],[4,5],[5,5],[6,5],[9,5],
				[0,6],[3,6],[4,6],[5,6],[6,6],[9,6],
				[0,7],[3,7],[6,7],[9,7],
				[0,8],[9,8],
				[0,9],[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9]],
			'width':10,
			'height':10
		},
		{
			'name':'glider',
			'data':[[2,0],[0,1],[2,1],[1,2],[2,2]],
			'width':3,
			'height':3
		},
		{
			'name':'ship',
			'width':5,
			'height':4,
			'data':[[0,0],[3,0],[4,1],[0,2],[4,2],[1,3],[2,3],[3,3],[4,3]]
		},
		{
			'name':'Gosper glider gun',
			'width':36,
			'height':9,
			'data':[[24,0],
				[22,1],[24,1],
				[12,2],[13,2],[20,2],[21,2],[34,2],[35,2],
				[11,3],[15,3],[20,3],[21,3],[34,3],[35,3],
				[0,4],[1,4],[10,4],[16,4],[20,4],[21,4],
				[0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],
				[10,6],[16,6],[24,6],
				[11,7],[15,7],
				[12,8],[13,8]]
		},
		{
			'name':'Infinite Growth 1',
			'width':8,
			'height':6,
			'data':[[6,0],[4,1],[6,1],[7,1],[4,2],[6,2],[4,3],[2,4],[0,5],[2,5]]
		},
		{
			'name':'Infinite Growth 2',
			'width':5,
			'height':5,
			'data':[[0,0],[1,0],[2,0],[4,0],[0,1],[3,2],[4,2],[1,3],[2,3],[4,3],[0,4],[2,4],[4,4]]
		},
		{
			'name':'Pulsar 3',
			'width':15,
			'height':15,
			'data':[[4,0],[10,0],
				[4,1],[10,1],
				[4,2],[5,2],[9,2],[10,2],
				[0,4],[1,4],[2,4],[5,4],[6,4],[8,4],[9,4],[12,4],[13,4],[14,4],
				[2,5],[4,5],[6,5],[8,5],[10,5],[12,5],
				[4,6],[5,6],[9,6],[10,6],
				[4,8],[5,8],[9,8],[10,8],
				[2,9],[4,9],[6,9],[8,9],[10,9],[12,9],
				[0,10],[1,10],[2,10],[5,10],[6,10],[8,10],[9,10],[12,10],[13,10],[14,10],
				[4,12],[5,12],[9,12],[10,12],
				[4,13],[10,13],
				[4,14],[10,14]]
		}
	];
	//build the elelments of the document
	var div = d3.select('.main-container');
	//right group of buttons above play field
	var right_group = div.append('div')
		.classed('btn-group',true)
		.attr('role','btn-group')
		.style('float','right');
	right_group.append('a')
		.attr({
			'id':'menu',
			'role':'button',
			'data-toggle':'dropdown',
			'type':'button'
		}).classed('btn btn-default dropdown-toggle',true)
		.text('Presets')
		.append('span').classed('caret',true);
	var presets = right_group.append('ul')
		.classed('dropdown-menu',true)
		.selectAll('li')
		.data(presetData);
	right_group.append('a')
		.attr('id','menu')
		.attr('role','button')
		.classed('btn',true)
		.classed('btn-default',true)
		.attr('href','index.html')
		.text("Main Menu");
		
	right_group.append('a')
		.attr('id','rules')
		.attr('role','button')
		.classed('btn',true)
		.classed('btn-default',true)
		.text("Rules")
		.on('click',function(){
			alert("Any live cell with fewer than two live neighbours dies, as if caused by under-population.\n\
				Any live cell with two or three live neighbours lives on to the next generation.\n\
				Any live cell with more than three live neighbours dies, as if by overcrowding.\n\
				Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.\n\n\
				Clicking on the cell toggles it between alive and dead.\n\
				Click start will run the generations based on the time frame from the slider.\n\
				Click stop to stop the simulation\n\
				Click clear to reset all the cells to dead.");
		});
		
	presets.enter().append('li')
		.append('a')
		.text(function(d){return d.name;})
		.on('click',fillPreset);
	//title displayed on document
	div.append('h1')
		.attr('id','title')
		.text("Conway's Game of Life");
		
	//the display area of the game
	var board = div.append('svg')
		.attr('width',w)
		.attr('height',h)
		.on('contextmenu',function(d){
			d3.event.preventDefault();
			d3.event.stopPropagation();
			return false;
		});
	//controls for the game
	var commands = div.append('div')
		.attr('class','commands');
	div.append("p")
		.attr('id','whoby')
		.html('Created by<br>Ryan Wilson');
	//slider to control the speed which the game runs		
	commands.append('div').attr('class','slider-container')
		.append('input')
		.attr('class','slider')
		.attr('id','slider')
		.attr('type','text');
		
	d3.select('.slider-container').append('p')
		.text('Speed ' +(runTime/1000).toFixed(2)+' seconds');
		
	$('#slider')
		.slider({step:.01,min:.01,max:t,value:(runTime/1000)})
		.on('slide',function(slideEvt){
			$('#slider').text(slideEvt.value+"s");
			d3.select('.slider-container').select('p')
				.text('Speed ' +(runTime/1000).toFixed(2)+' seconds');
			runTime = slideEvt.value * 1000;
			if(running){
				clearInterval(timerId);
				timerId = setInterval(run,runTime);
			}});
	//control buttons
	var buttons = commands.append('div')
		.attr('class','btn-group')
		.attr('role','btn-group');
	buttons.append('button')
		.classed('btn',true)
		.classed('btn-default',true)
		.attr('id','start')
		.text('Start')
		.on('click',function(){
			if(!running){
			running = true;
			timerId = setInterval(run,runTime);
			}});	
		
	buttons.append('button')
		.classed('btn',true)
		.classed('btn-default',true)
		.attr('id','stop')
		.text('Stop')
		.on('click',function(){
			if(running){
				running = false;
				clearInterval(timerId);
			}});	
	buttons.append('button')
		.classed('btn',true)
		.classed('btn-default',true)
		.attr('id','clear')
		.text('Clear')
		.on('click',function(){
			if(running){
				running = false;
				clearInterval(timerId);
			}
			reset();});		
	//checking if the mouse is depressed
	$(document).mouseup(function() {
		isMouseDown = false;
	});
	
	/*var topCell = function(c) { return cells[Math.max(0, c.r - 1) * cols + c.c]; };
	var leftCell = function(c) { return cells[c.r * cols + Math.max(0, c.c - 1)]; };
	var bottomCell = function(c) { return cells[Math.min(rows - 1, c.r + 1) * cols + c.c]; };
	var rightCell = function(c) { return cells[c.r * cols + Math.min(cols - 1, c.c + 1)]; };

	var topLeftCell = function(c) { return cells[Math.max(0, c.r - 1) * cols + Math.max(0, c.c - 1)]; };
	var bottomLeftCell = function(c) { return cells[Math.min(rows - 1, c.r + 1) * cols + Math.max(0, c.c - 1)]; };
	var bottomRightCell = function(c) { return cells[Math.min(rows - 1, c.r + 1) * cols + Math.min(cols - 1, c.c + 1)]; };
	var topRightCell = function(c) { return cells[Math.max(0, c.r - 1) * cols + Math.min(cols - 1, c.c + 1)]; };*/
	//event handler for when clicking on the board
	var click = function(d,set){
		d3.event.preventDefault()
		d3.event.stopPropagation();
		d.alive = set;
		update(cells);
		};
	//event handler for when the reset button is clicked	
	var reset = function(){
		cells.forEach(function(d){d.alive = false;});
		update(cells);
	}
	//function to check if the neighbors of a cell to see if that cell "el" comes to life, dies, or stays alive
	var check_neighbors = function(el){
		var newCell = $.extend(true, {}, el);
		newCell.elnt = null;
		//var neighbours = cells.filter(function(obj){ return (obj.r >= el.r-1 && obj.r <= el.r+1);})
		//.filter(function(obj2) {return ((obj2.c >= el.c-1 && obj2.c <= el.c+1) && !(obj2.c === el.c && obj2.r === el.r) );})
		//.filter(function(al){return al.alive === true;});
		// this improves the speed that it collects the neighbours of the cell
		var neighbours = [];
		neighbours.push(cells[(el.r-1)*cols + (el.c-1)]);
		neighbours.push(cells[(el.r)*cols + (el.c-1)]);
		neighbours.push(cells[(el.r+1)*cols + (el.c-1)]);
		neighbours.push(cells[(el.r-1)*cols + (el.c)]);
		neighbours.push(cells[(el.r+1)*cols + (el.c)]);
		neighbours.push(cells[(el.r-1)*cols + (el.c+1)]);
		neighbours.push(cells[(el.r)*cols + (el.c+1)]);
		neighbours.push(cells[(el.r+1)*cols + (el.c+1)]);
		neighbours = neighbours.filter(function(al){return al && al.alive === true;});
		//if(newCell.alive===true){
		newCell.alive = (newCell.alive && neighbours.length >= 2 && neighbours.length <= 3) || (!newCell.alive && neighbours.length===3);
		//}else{
		//	newCell.alive = neighbours.length===3;
		//}
		return newCell;
	}
	//function that runs the process of checking all the cells for the next generation
	var run = function(){
		var newCells = [];
		var count = 0;
		for(var i = 0; i < cells.length; i++){
			newCells.push(check_neighbors(cells[i],i));
			count++;
		}
		cells = newCells;
		update(cells);
	}
	//function that updates the board, redrawing as needed
	var update = function(data_cells){
		var cell = board.selectAll(".cell")
		  .data(data_cells);
		
		cell.attr("class", function(d) { return "cell " + ((d.alive) ? "alive" : "dead"); });
		
		cell.enter().append("rect")
		  .attr("class", function(d) { return "cell " + ((d.alive) ? "alive" : "dead"); })
		  .attr("x", rectx)
		  .attr("y", recty)
		  .attr("width", sz)
		  .attr("height", sz)
		  .each(function(d) {
			d3.select(this).on('mousedown',function(d){
				isMouseDown = true;
				click(d,d3.event.button === 0);
				return false;
			}).on('mouseover',function(d){
				if(isMouseDown)
					click(d,d3.event.button === 0);
				return false;
			}).on('mouseup',function(d){
				isMouseDown = false;
				d3.event.preventDefault();
				d3.event.stopPropagation();
				return false;
			});
			d.elnt = d3.select(this);
		  });
		  
		cell.exit()
			.remove();
		}
		
	update(cells);
	
});