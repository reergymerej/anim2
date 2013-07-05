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

    /**
    * Get a random integer between two numbers (inclusive).
    * @param {Number} min
    * @param {Number} max
    * @return {Number}
    */
    rand: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    start: undefined,
    end: undefined,
    canvas: undefined,
    context: undefined,

    /**
    * All the Actors.
    */
    actors: [],
    actorId: 0,
    updateActors: undefined,
    clickHandlers: [],
    moveToFrames: 0,

    Actor: function(config){

        var me = this;

        // Set defaults.
        anim.extend(config, {
            width: 50,
            height: 50,
            x: 0,
            y: 0,
            speed: 0,
            direction: 10,
            rotation: 0,
            spin: 0,
            fillStyle: anim.getColor()
        });

        // Create getters/setters for each attribute.
        anim.eachOwn(config, function(prop, value){
            me[prop] = value;
        });

        switch(config.type){
            case 'Rectangle':
                this.draw = function(context){
                    context.fillStyle = this.fillStyle;
                    context.fillRect(0, 0, this.width, this.height);
                }
                break;
            case 'Circle':
                this.draw = function(context){
                    var radius = this.width / 2;
                    context.beginPath();
                    context.arc(0 + radius, 0 + radius, radius, 0, anim.getRad(360) );
                    context.fillStyle = this.fillStyle;
                    context.fill();
                }
                break;
            case 'Triangle':
                this.draw = function(context){
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(0 + this.width, 0);
                    context.lineTo(0 + this.width, 0 + this.height);
                    context.lineTo(0, 0);
                    context.fillStyle = this.fillStyle;
                    context.fill();
                }
                break;
            case 'Image':
                this.image = new Image();
                this.image.src = config.src;
                this.draw = function(context){
                    // context.drawImage(this.image, this.x, this.y);
                    context.drawImage(this.image, 0, 0);
                }
                break;
            default:
                if(!this.draw){
                    console.error('need a draw method');
                }
        }
    },

    /**
    * @param {Object} config
    * @return {anim.Actor}
    */
    addActor: function(config){
        var actor;

        this.extend(config, {
            id: this.actorId++
        });
        actor = this.create('Actor', config);
        this.actors.push(actor);
        return actor;
    },

    /**
    * Start the animation.
    * @param canvas
    * @param {Number} [frames] Stop after this many frames.  Run continuously if -1.
    * @param {function} updateActors
    */
    play: function(canvas, frames, updateActors){
        var me = this;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        // Add click listeners.
        me.clicks = [];
        $(this.canvas).click(function(event){
            me.clicks.push(event);
        });

        this.framesLeft = frames;

        this.updateActors = updateActors;

        this.animate();
    },

    animate: function(){
        var me = this,
            actor;

        // clear the canvas
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        // Process the clicks.
        this.processClicks();
        

        // update each actor
        this.updateActors(this.actors);

        // draw each actor
        for(var i = 0, max = this.actors.length; i < max; i++){
            actor = this.actors[i];
            this.context.save();
            this.context.translate(actor.x, actor.y);
            this.context.rotate(anim.getRad(actor.rotation));
            actor.draw(this.context);
            this.context.restore();
            actor.setNextPosition(this.context);
        }

        // prepare for the next loop
        if(this.framesLeft > 0 || this.framesLeft === -1){
            if(this.framesLeft > 0){
                this.framesLeft--;  
            }
            requestAnimationFrame(this.animate.bind(this));
        }
    },

    /**
    * Execute all the click handlers.
    */
    processClicks: function(){
        var x, y;

        for(var i = 0; i < this.clickHandlers.length; i++){
            for(var j = 0; j < this.clicks.length; j++){
                x = this.clicks[j].offsetX;
                y = this.clicks[j].offsetY;
                this.clickHandlers[i](x, y);
            }
        }
        this.clicks = [];
    },

    /**
    * Get radians from degrees.
    */
    getRad: function(degrees){
        return degrees * (Math.PI/180);
    },

    /**
    * Get degrees from radians.
    */
    getDeg: function(radians){
        return radians / (Math.PI/180);
    },

    /**
    * Get a random color.
    */
    getColor: function(){
        var num = this.rand(0, 255),
            r = Math.random() <= 5 ? num : 0,
            g = Math.random() <= 5 ? num : 0,
            b = Math.random() <= 5 ? this.rand(0, 255) : num;

        return 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';
        // return 'rgba(' + this.rand(0, 255) + ', ' + this.rand(0, 255) + ', ' + this.rand(0, 255) + ', ' + this.rand(5, 10) / 10 + ')'
    },

    /**
    * Add an onclick handler to the canvas.
    * @param {function} handler
    */
    onClick: function(handler){
        this.clickHandlers.push(handler);
    }
};

anim.extend(anim.Actor.prototype, {

    /**
    * Move a number of pixels.
    * @param {Number} x
    * @param {Number} y
    * @return {Object} new position
    */
    move: function(x, y){
        this.x += x;
        this.y += y;
        return {
            x: this.x,
            y: this.y
        };
    },


    /**
    * Move the a new position.
    * @param {Number} x
    * @param {Number} y
    * @param {Number} [frames] If provided, move to that position over the next frames.
    */
    moveTo: function(x, y, frames){
        var xChange = x - this.x,
            yChange = y - this.y,
            distance = Math.sqrt( xChange * xChange + yChange * yChange),
            slope = yChange / xChange,
            degrees = 180 - anim.getDeg( Math.atan2(xChange, yChange) );

        if(frames){
            this.direction = (270 + degrees)%360;
            this.speed = distance/frames;
            this.moveToFrames = frames;
        } else {
            this.x = x;
            this.y = y;
        }
    },

    // get the next x and y based on speed and direction
    setNextPosition: function(context){

        var canvas = context.canvas;

        // update the speed
        this.accelerate(this.acceleration);

        if(this.moveToFrames){
            this.moveToFrames--;
        } else if(this.moveToFrames === 0){
            this.speed = 0;
            delete this.moveToFrames;
        }

        // update the rotation
        this.rotate(this.spin);

        this.x += this.speed * Math.cos(anim.getRad(this.direction));
        this.y += this.speed * Math.sin(anim.getRad(this.direction));

        if(this.x + this.width > canvas.width || this.x < 0){
            this.direction = 180 - this.direction;
        }

        if(this.y + this.height > canvas.height || this.y < 0){
            this.direction *= -1;
        }
    },

    /**
    * Set rotation.
    * @param {Number} degrees
    */
    setRotation: function(degrees){
        this.rotation = degrees;
    },

    /**
    * Rotate.
    * @param {Number} degrees
    */
    rotate: function(degrees){
        degrees = degrees || 0;
        this.rotation += degrees;
    },

    /**
    * Change speed based on a rate of acceleration.
    * @param {Number} rate
    * @return {Number} new speed
    */
    accelerate: function(rate){
        rate = rate || 0;
        this.speed += rate;

        // If we're accelerating to a specific speed, see if we're there.
        if(this.isAccelerating && this.speed >= this.isAccelerating){
            this.setAcceleration(0);
            delete this.isAccelerating;
        }
        return this.speed;
    },

    /**
    * Accelerate to a specified speed.
    * @param {Number} speed Desired speed.
    * @param {Number} frames Frames to get to desired speed.
    */
    accelerateTo: function(speed, frames){
        this.isAccelerating = speed;
        this.setAcceleration(speed / frames);
    },

    /**
    * Set the acceleration rate.
    * @param {Number} acceleration
    */
    setAcceleration: function(acceleration){
        this.acceleration = acceleration;
    }
});


$(function(){
    var canvas = $('#canvas')[0],
        actor;

    actor = anim.addActor({
        x: 200,
        y: 200,
        spin: 1,
        type: 'Image',
        src: 'img/flag.png'
    });

    anim.onClick(function(x, y){
        actor.moveTo(x, y, 50);
    });

    anim.play(canvas, -1, function(actors){
        var actor,
            maxSpeed = 8;
        for(var i = 0; i < actors.length; i++){
            actor = actors[i];
            actor.spin = actor.speed;
        }
    });
});