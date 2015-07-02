// is mouse down?
var mouseDown = false;
$(document).mousedown(function() {
    mouseDown = true;
}).mouseup(function() {
    mouseDown = false;  
});

// JavaScript Document
var graph = new joint.dia.Graph;

// papers (similar to canvases)
var paper = new joint.dia.Paper({
    el: $('#myholder'),
    width: 600,
    height: 200,
    model: graph,
    gridSize: 1,
    id: 'hello'
});

var paperSmall = new joint.dia.Paper({
    el: $('#myholder-small'),
    width: 600,
    height: 100,
    model: graph,
    gridSize: 1
});

paperSmall.scale(.5);
paperSmall.$el.css('pointer-events', 'none');


function Shaper()
{
    this.shapes = {};
    this.links = [];
    
    this.defaultRect = {
      position: { x: 100, y: 30 },
      size: { width: 100, height: 30 },
      background: 'lightGray',
      text: 'muj box',
      
    }
    
    /*this.defaultPosition = { x: 100, y: 30 };
    this.defaultSize = { width: 100, height: 30 };
    this.defaultBg = 'lightGray';
    this.defaultText = 'muj box';
      */
    this.itemCount = 0;
    this.last = null;
    
    this.createRect = function (name, textA) {
        
        this.itemCount++;
        
        txt = (typeof textA == "undefined") ? this.defaultText + ' ' + this.itemCount : textA; 
        
        item = new joint.shapes.basic.Rect({
        position: this.defaultPosition,
        size: this.defaultSize,
        attrs: { rect: { fill: this.defaultBg, 'stroke-width': 2, stroke: 'black' }, text: { text: txt, fill: 'white' } }  });
        
        this.last = item;
        this.shapes[name] = item;
        return item;
    }
    
    this.rectBg = function (color, name) {
    
       if(typeof name == "undefined") {
        this.last.attributes.attrs.rect.fill = color; 
       }
       else
        this.shapes[name].attributes.attrs.rect.fill = color;
    
    }
    
    this.link = function (source,target) {
      if( this.shapes.hasOwnProperty(source) && this.shapes.hasOwnProperty(target) ) { 
        this.links.push( new joint.dia.Link({
            source: { id: this.shapes[source].id },
            target: { id: this.shapes[target].id },
            attrs: { '.connection': { 'stroke-width': 1, stroke: '#000' } }
        }) );
      }
      else
      {
        console.log('Zdroj nebo cíl neexistuje. \n Zdroj:'+source+"\n Cíl:"+target);
      }
          
    }
    
    this.render = function () {
       graph.addCells(this.shapes);
       graph.addCells(this.links);
    }
    
}

var shape = new Shaper();
shape.createRect('prvni', 'popisek boxu').translate(150);
shape.createRect('druhy');
shape.createRect('treti').translate(200,100);

shape.rectBg('orange','druhy');

shape.link('prvni', 'druhy');
shape.link('prvni', 'druhy');
shape.link('prvni', 'druhy');


var myAdjustVertices = _.partial(adjustVertices, graph);

// adjust vertices when a cell is removed or its source/target was changed
graph.on('add remove change:source change:target', myAdjustVertices);
paper.on('cell:pointerup', myAdjustVertices);

// drawing

shape.render();
