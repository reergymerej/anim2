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
    },

    /**
    * Get radians from degrees.
    */
    getRad: function(degrees){
        return degrees * (Math.PI/180);
    }
};


anim.extend(anim.Actor.prototype, {
    draw: function(context){
        context.fillStyle = this.fillStyle;
        context.fillRect(this.x, this.y, this.width, this.height);
        this.update(context);
    },

    // get the next x and y based on speed and direction
    update: function(context){

        var canvas = context.canvas;

        this.x += this.speed * Math.cos(anim.getRad(this.direction));
        this.y += this.speed * Math.sin(anim.getRad(this.direction));

        if(this.x + this.width > canvas.width || this.x < 0){
            // debugger;
            this.direction = bounceX(this.direction);
            // this.direction = 180 - this.direction%360;
        }

        if(this.y + this.height > canvas.height || this.y < 0){
            // debugger;
            // this.direction = ( 180 - this.direction%360 ) * -1;
            this.direction *= -1;
        }

    }
});


$(function(){
    var canvas = $('#canvas')[0];


    for(var i = 0; i < 10; i++){
        anim.addActor({
            x: 100,
            y: 100,
            width: (i + 3) * 8,
            height: (i + 3) * 8,
            fillStyle: 'rgba(' + anim.rand(0, 255) + ', ' + anim.rand(0, 255) + ', ' + anim.rand(0, 255) + ', ' + anim.rand(5, 10) / 10 + ')',
            speed: 8,
            direction: anim.rand(0, 359)
        });
    }


    anim.play(canvas, 0, function(actors){
        var actor;
        for(var i = 0; i < actors.length; i++){
            actor = actors[i];
            actor.direction += (actor.id%2 === 0) ? actor.id : -actor.id/2;
        }
    });
});


function bounceX(angle){
    if(angle <= 90){
        return 180 - angle;
    }

    return 180 - angle;
    return angle - 180;
}
