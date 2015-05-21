$(document).ready(function(){
	
	var w = 960,
		h = 500,
		sz = 20,
		r = sz / 2,
		sr = r * r,
		ssz = sz * sz,
		v = 3,
		n = 1,
		t = 5000,
		isMouseDown = false,
		runTime = 1000,
		running = false,
		timerId = 0;
		
	
	var rows = Math.ceil(h / sz);
	var cols = Math.ceil(w / sz);
	
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
	var rectx = function(d) { return d.x - r; };
	var recty = function(d) { return d.y - r; };
		
	var div = d3.select('body')
		.append('div')
		.attr('class','main-container');
	var right_group = div.append('div')
		.classed('btn-group',true)
		.attr('role','btn-group')
		.style('float','right');
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
		
	div.append('h1')
		.attr('id','title')
		.text("Conway's Game of Life");
		
	var board = div.append('svg')
		.attr('width',w)
		.attr('height',h);
	var commands = div.append('div')
		.attr('class','commands');
	
			
	commands.append('div').attr('class','slider-container')
		.append('input')
		.attr('class','slider')
		.attr('id','slider')
		.attr('type','text');
		
		d3.select('.slider-container').append('p')
		.text('Speed ' +Math.floor(runTime/1000).toFixed(2)+' seconds');
		
	$('#slider')
		.slider({step:.25,min:.25,max:5,value:Math.floor(runTime/1000)})
		.on('slide',function(slideEvt){
			$('#slider').text(slideEvt.value+"s");
			d3.select('.slider-container').select('p')
				.text('Speed ' +(runTime/1000).toFixed(2)+' seconds');
			runTime = slideEvt.value * 1000;
			if(running){
				clearInterval(timerId);
				timerId = setInterval(run,runTime);
			}});
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
	$(document).mouseup(function() {
	isMouseDown = false;});
	
	var topCell = function(c) { return cells[Math.max(0, c.r - 1) * cols + c.c]; };
	var leftCell = function(c) { return cells[c.r * cols + Math.max(0, c.c - 1)]; };
	var bottomCell = function(c) { return cells[Math.min(rows - 1, c.r + 1) * cols + c.c]; };
	var rightCell = function(c) { return cells[c.r * cols + Math.min(cols - 1, c.c + 1)]; };

	var topLeftCell = function(c) { return cells[Math.max(0, c.r - 1) * cols + Math.max(0, c.c - 1)]; };
	var bottomLeftCell = function(c) { return cells[Math.min(rows - 1, c.r + 1) * cols + Math.max(0, c.c - 1)]; };
	var bottomRightCell = function(c) { return cells[Math.min(rows - 1, c.r + 1) * cols + Math.min(cols - 1, c.c + 1)]; };
	var topRightCell = function(c) { return cells[Math.max(0, c.r - 1) * cols + Math.min(cols - 1, c.c + 1)]; };
	var click = function(d){
		d3.event.preventDefault()
		d3.event.stopPropagation();
		d.alive = !d.alive;
		update(cells);
		};
	function reset(){
		cells.forEach(function(d){d.alive = false;});
		update(cells);
	}
	function check_neighbors(el){
		var newCell = $.extend(true, {}, el);
		newCell.elnt = null;
		var neighbors = cells.filter(function(obj){ return (obj.r >= el.r-1 && obj.r <= el.r+1);})
		.filter(function(obj2) {return ((obj2.c >= el.c-1 && obj2.c <= el.c+1) && !(obj2.c === el.c && obj2.r === el.r) );})
		.filter(function(al){return al.alive === true;});
		if(newCell.alive===true){
			if(neighbors.length < 2 || neighbors.length > 3)
				newCell.alive = false;
			else
				newCell.alive = true;
			
		}else{
			if(neighbors.length===3)
				newCell.alive = true;
			else
				newCell.alive = false;
		}
		return newCell;
	}
	function run(){
		
		var newCells = [];
		var count = 0;
		for(var i = 0; i < cells.length; i++){
			newCells.push(check_neighbors(cells[i]));
			count++;
		}
		console.log(count);
		cells = newCells;
		update(cells);
	}
	function update(data_cells){
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
				click(d);
				return false;})
				.on('mouseover',function(d){
					if(isMouseDown)
				click(d);});
			d.elnt = d3.select(this);
		  });
		  
		cell.exit()
			.remove();
		}
		
	update(cells);
	
});