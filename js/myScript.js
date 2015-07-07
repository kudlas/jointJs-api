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
      background: 'blue',
      text: 'muj box',
    }    
    
    this.itemCount = 0;
    // chaining
    this.last = null;
    
    // selecting variables
    this.selectedIndex = '';
    this.selectedColor = 'lightGray';
    this.inactiveColor = 'gray';
    
    this.createRect = function (name, textA) {
        
        this.itemCount++;
        
        // text do boxu
        txt = (typeof textA == "undefined") ? this.defaultRect.text + ' ' + this.itemCount : textA; 
        
        // vytvarim box
        item = new joint.shapes.basic.Rect({
        data: {name: name, defaultColor: this.defaultRect.background},
        position: this.defaultRect.position,
        size: this.defaultRect.size,
        attrs: { rect: { fill: this.defaultRect.background, 'stroke-width': 2, stroke: 'black' }, text: { text: txt, fill: 'white' } }  });
        
        // ukladam box do promenne kvuli retezeni
        this.last = item;
        
        // ukladam box do seznamu boxu
        this.shapes[name] = item;
        
        // retezeni
        return this;
    }
    
    this.getById = function (id) {
      //return this.last.id;
        retName = '';
        $.each(this.shapes, function (i, v) {
          if(v.id==id)
          {
            retName = i;
            return;
          }
        });
        
        this.last = this.shapes[retName];
        return this;
    }
    
    this.selectRect = function (name) {
                                              
      rect = (this.rectExists(name)) ? this.shapes[name] : this.last;
    
      if(typeof rect != 'undefined' )
      {
        /*console.log(this.selectedIndex);
        console.log( this.rectExists(this.selectedIndex) );*/
        
        
        
        // přebarvení při odznačení                
        inactiveCol = (typeof this.shapes[this.selectedIndex] != 'undefined') ? this.shapes[this.selectedIndex].attr().attributes.data.defaultColor : this.inactiveColor; // defaultní barva
        if(this.rectExists(this.selectedIndex) ) this.rectBg(inactiveCol,this.selectedIndex);
        
        // hlavní obarvování, zapamatování co je označeno
        this.rectBg(this.selectedColor,rect);
        this.selectedIndex = rect.get('data').name;
      }
      else
      console.log('Zadaný rectangle neexistuje');
      
      return this;
    
    }
    
    this.move = function (x,y,opt) {
    
      this.last.translate(x,y,opt);
      return this;
      
    }
    
    /**
     * Přebarví pozadí rectanglu
     * @param {string} barva na jakou barvu se bude barvit
     * @param {string|object|boolean} objekt Objekt který se bude barvit, lze předat přímo objekt, nebo string index objektu. V případě zadání true se vezme zřetězený (poslední) objekt a tomu se přepíše defaultní barva, kterou si pamatuje.      
     */        
    this.rectBg = function (color, name) {
    
      // výběr objektu na který se bude barva aplikovat
       target = null;
       if(typeof name == "undefined" ) {
          target = this.last;
       }
       else
        if(typeof name == 'object')
          target = rect;
        else
        if(typeof name == 'boolean') { // přetížení parametru, pokud je zadáno trů, propíše se zadaná barva jako defaultní
           target = this.last;
           target.attr().attributes.data.defaultColor=color;
          }
          else
          target = this.shapes[name];
          
          // přebarvování
          target.attr({ rect: { fill: color } });
          
    }
    
    this.rectExists = function (name) {
        return this.shapes.hasOwnProperty(name);
    }
    
    this.link = function (source,target) {
      if( this.rectExists(source) && this.rectExists(target) ) { 
        this.links.push( new joint.dia.Link({
            source: { id: this.shapes[source].id },
            target: { id: this.shapes[target].id },
            attrs: { '.connection': { 'stroke-width': 1, stroke: '#000' } },
            smooth: true,
        }) );
        
        return this;
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
shape.createRect('prvni', 'popisek boxu').move(150);
shape.createRect('druhy').rectBg('orange',true);
shape.createRect('treti').move(200,100).rectBg('black',true);


// TODO: kontrolovat jestli jsou parametry stejné a když jsou tak klonovat
shape.link('prvni', 'druhy').link('prvni', 'druhy').link('prvni', 'druhy');


var myAdjustVertices = _.partial(adjustVertices, graph);

paper.on('cell:pointerdown', function (el) {
  shape.getById( el.model.get('id') ).selectRect();
});

// adjust vertices when a cell is removed or its source/target was changed
graph.on('add remove change:source change:target', myAdjustVertices);
paper.on('cell:pointerup', myAdjustVertices);

// drawing

shape.render();
