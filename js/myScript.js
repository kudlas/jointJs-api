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

joint.shapes.basic.Rect = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable"><g class="scalable"><rect/></g><image/><text class="title"/></g>',
    
    defaults: joint.util.deepSupplement({
    
        type: 'basic.Rect',
        attrs: {
            'rect': {'stroke-width': 0, stroke: 'black', filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1 }}, fill: 'white', stroke: 'black', 'follow-scale': true, width: 80, height: 40 },
            'text': { 'font-size': 14, 'ref-x': 46, 'ref-y': 20 , ref: 'rect','text-anchor': 'start', 'y-alignment': 'middle', 'x-alignment': 'left', fill: 'black' },
            'image': {'xlink:href': 'http://placehold.it/40x40' ,'ref-x': 8, 'ref-y': 5, ref: 'rect' }
        }
        
    }, joint.shapes.basic.Generic.prototype.defaults)
});


function Shaper()
{
    this.shapes = {};
    this.links = [];
    
    this.defaultRect = {
      position: { x: 0, y: 0 },
      size: { width: 140, height: 40 },
      background: 'blue',
      text: 'muj box',
      borderRadius: 11,
      imageSize: {width: 30, height: 30}
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
      
        // změna velikosti podle obsahu
        rSize = {width: this.defaultRect.size.width, height: this.defaultRect.size.height};
        if (txt.length > 20)
        {
          rSize.width = ( txt.length * 7.5 ) + this.defaultRect.imageSize.width; 
        }  
        
        // vytvarim box
        item = new joint.shapes.basic.Rect({
        data: {name: name, defaultColor: this.defaultRect.background},
        position: this.defaultRect.position,
        size: rSize,
        attrs: { 
          rect: { fill: this.defaultRect.background, rx: this.defaultRect.borderRadius, ry: this.defaultRect.borderRadius }, 
          text: { text: txt, 'id': name+"text" },
          image: {width: this.defaultRect.imageSize.width, height: this.defaultRect.imageSize.height}
          }  
          
        });

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
    
    /**
     * Označí zadaný rectangle (podle name). Podle parametru je možno odznačovat, nebo označit poslední
     * @param {string|object|boolean} nazev nazev rectanglu který se má označit, pokud je boolean odznačí se.
     */ 
    this.selectRect = function (name) {
      
      if(typeof name == 'boolean')
      {
         inactiveCol = (typeof this.shapes[this.selectedIndex] != 'undefined') ? this.shapes[this.selectedIndex].attr().attributes.data.defaultColor : this.inactiveColor; // defaultní barva
         if(this.rectExists(this.selectedIndex) ) this.rectBg(inactiveCol,this.selectedIndex);
         return;
      }
                                              
      rect = (this.rectExists(name)) ? this.shapes[name] : this.last;
    
      if(typeof rect != 'undefined' )
      {
        // přebarvení při odznačení                
        inactiveCol = (typeof this.shapes[this.selectedIndex] != 'undefined') ? this.shapes[this.selectedIndex].attr().attributes.data.defaultColor : this.inactiveColor; // defaultní barva
        if(this.rectExists(this.selectedIndex) ) this.rectBg(inactiveCol,this.selectedIndex);
        
        // hlavní obarvování, zapamatování co je označeno
        this.rectBg(this.selectedColor,rect);
        this.selectedIndex = rect.get('data').name;
      }
      else
      { 
        console.log('Rectangle neexistuje.');
      }
      
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
          
          return this;
          
    }
    
    this.rectExists = function (name) {
        return this.shapes.hasOwnProperty(name);
    }
    
    // zavést s jedním parametrem, což bude link mezi last a tím v argumentu
    this.link = function (source,target) {
      if( this.rectExists(source) && this.rectExists(target) ) { 
        this.links.push( new joint.dia.Link({
            source: { id: this.shapes[source].id },
            target: { id: this.shapes[target].id },
            attrs: { 
              '.connection': { 'stroke-width': 1, stroke: '#000' },  
              '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
            },
            //smooth: true,
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
shape.createRect('prvni', 'Alexej Sergejevič Karpov').move(150).rectBg('#07C3ED',true);
shape.createRect('druhy').rectBg('orange',true).move(50,100);
shape.createRect('treti').move(200,100).rectBg('green',true);


// TODO: kontrolovat jestli jsou parametry stejné a když jsou tak klonovat
shape.link('prvni', 'druhy').link('treti', 'druhy').link('treti', 'prvni');


var myAdjustVertices = _.partial(adjustVertices, graph);

paper.on('cell:pointerdown', function (el) {
  shape.getById( el.model.get('id') ).selectRect();
});


paper.on('blank:pointerdown', deselect);

function deselect()
{
  shape.selectRect(false);
}



//image.model.css('pointer-events', 'none');


// drawing
shape.render();
