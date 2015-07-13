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

    markup: '<g class="rotatable"><g class="scalable"><rect/><path/></g><image/><text class="title"/> </g>',
    
    defaults: joint.util.deepSupplement({
        inPorts: [],
        type: 'basic.Rect',
        attrs: {
            'rect': {'stroke-width': 0, stroke: 'black', filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1 }}, fill: 'white', stroke: 'black', 'follow-scale': true, width: 80, height: 40 },
            'text': {'pointer-events': 'none', 'font-size': 14, 'ref-x': 46, 'ref-y': 20 , ref: 'rect','text-anchor': 'start', 'y-alignment': 'middle', 'x-alignment': 'left', fill: 'black' },
            'image': {'pointer-events': 'none','xlink:href': 'http://placehold.it/40x40' ,'ref-x': 8, 'ref-y': 5, ref: 'rect' },
            'circle': {size: {width:20, height: 20}, fill: 'gray', stroke: 'black', 'stroke-width': 1 }
        }
        
    }, joint.shapes.basic.Generic.prototype.defaults)
});

paper.on('cell:pointerdown', function (el) {
  shape.getById( el.model.get('id') ).selectRect();
});


paper.on('blank:pointerdown', deselect);

function deselect()
{
  shape.selectRect(false);
}

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
        if (txt.length > 13)
        {
          rSize.width = ( txt.length * 7 ) + this.defaultRect.imageSize.width; 
        }  
        
        // vytvarim box
        item = new joint.shapes.basic.Rect({
        data: {name: name, defaultColor: this.defaultRect.background},
        position: this.defaultRect.position,
        size: rSize,
        attrs: { 
          rect: { fill: this.defaultRect.background, rx: this.defaultRect.borderRadius, ry: this.defaultRect.borderRadius, magnet: true }, 
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
    
    this.move = function (x,y,opt) {
      this.last.translate(x,y,opt);
      return this;
    }
    
    this.setImage = function (name, src) {
      obj = this.shapes[name];
      obj.attr({ image: { 'xlink:href': src } });
    
      return this;
    }
    
    this.setText = function (name, text) {
      obj = this.shapes[name];
      obj.attr({ text: { 'text': text } });
    
      return this;
    }
    
    this.render = function () {
       graph.addCells(this.shapes);
       graph.addCells(this.links);
       
    }
    
}

var shape = new Shaper();
shape.createRect('prvni', 'Člověk V. Grafü').move(150).rectBg('#07C3ED',true);
shape.createRect('druhy', 'Dlouhatánské DŽDŽDŽ').rectBg('orange',true).move(50,100);
shape.createRect('treti').move(367,76).rectBg('green',true);

shape.link('prvni', 'druhy').link('treti', 'druhy').link('treti', 'prvni');
shape
  .setImage('prvni', 'http://brandonmathis.com/projects/fancy-avatars/demo/images/avatar_male_dark_on_clear_200x200.png')
  .setText('prvni','Roman Karpov');

// drawing
shape.render();

// ulozeni (snazsi nez jsem myslel)
//console.log( JSON.stringify(graph) );
