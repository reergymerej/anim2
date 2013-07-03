var anim = {
    /**
    * Add the properties of one object to another.
    * @method extend
    * @param {object} obj1 destination object
    * @param {object} obj2 object to add from
    */
    extend: function(obj1, obj2){
        anim.eachOwn(obj2, function(prop, val){
            if(!obj1.hasOwnProperty(prop)){
                obj1[prop] = val;
            }
        });
    },

    /**
    * Create a new instance of a class.
    * @method create
    * @param {String} cls
    * @param {Object} [config]
    * @return an instance of the class specified
    */
    create: function(cls, config){
        if(this.hasOwnProperty(cls)){
            return new this[cls](config);
        }
    },

    /**
    * Perform an operation on each "own" property in an object.
    * @param {object} obj
    * @param {function} operation passed the property and its value
    */
    eachOwn: function(obj, operation){
        for(var i in obj){
            if(obj.hasOwnProperty(i)){
                operation.call(obj, i, obj[i]);
            }
        }
    },

    rand: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    start: undefined,
    end: undefined,
    requestId: undefined,
    canvas: undefined,
    context: undefined,
    /**
    * All the Actors.
    */
    actors: [],
    actorId: 0,
    updateActors: undefined,

    Actor: function(config){

        var me = this;

        // Create getters/setters for each attribute.
        anim.eachOwn(config, function(prop, value){
            me[prop] = value;
        });
    },

    addActor: function(config){
        this.extend(config, {
            id: this.actorId++
        });
        this.actors.push(this.create('Actor', config));
    },

    /**
    * Start the animation.
    * @param canvas
    * @param {Number} [seconds] Stop after this many seconds.  Run continuously if not provided.
    * @param {function} updateActors
    */
    play: function(canvas, seconds, updateActors){
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        console.log(this.actors);

        this.start = Date.now();
        this.end = seconds ? this.start + seconds * 1000 : undefined;

        this.updateActors = updateActors;

        this.renderFrame();
    },

    renderFrame: function(){
        var me = this,
            actor;

        // clear the canvas
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        // update each actor
        this.updateActors(this.actors);

        // draw each actor
        for(var i = 0, max = this.actors.length; i < max; i++){
            actor = this.actors[i];
            actor.draw(this.context);
        }

        if(this.end === undefined || Date.now() < this.end){
            requestAnimationFrame(this.renderFrame.bind(this));
        }
    }
};


anim.extend(anim.Actor.prototype, {
    draw: function(context){
        context.fillStyle = this.fillStyle;
        context.fillRect(this.x, this.y, this.width, this.height);
        this.update(context);
    },
    update: function(context){
        var canvas = context.canvas,
            nextX = this.x + this.move.x,
            nextY = this.y + this.move.y;

        this.x = nextX;
        this.y = nextY;

        if(nextX + this.width > canvas.width || nextX < 0){
            this.move.x *= -1;
        }

        if(nextY + this.height > canvas.height || nextY < 0){
            this.move.y *= -1;
        }
    }
});



$(function(){
    var canvas = $('#canvas')[0];

    for(var i = 0; i < 10; i++){
        anim.addActor({
            x: 0,
            y: 0,
            width: i * 5 + 10,
            height: i * 5 + 10,
            fillStyle: 'rgba(' + anim.rand(0, 255) + ', ' + anim.rand(0, 255) + ', ' + anim.rand(0, 255) + ', ' + anim.rand(5, 10) / 10 + ')',
            move: {
                x: 1.2,
                y: i * .01 + .1
            }
        });
    }

    anim.play(canvas, 0, function(actors){
        var move;

        for(var i = 0; i < actors.length; i++){
            move = actors[i].move;
            move.x += .1;
            move.y += .1;
        }

    });
});