var geo = {
    /**
    * @param {Number} config.x
    * @param {Number} config.y
    */
    Point: function(config){
        this.x = config.x;
        this.y = config.y;
    },

    /**
    * @class
    * @param {Number} config.direction
    * @param {Number} config.magnitude
    */
    Vector: function(config){
        this.magnitude = config.magnitude;
        this.direction = config.direction;
        this.setDirection(config.direction);
    },

    /**
    * Get a hypotenuse length given opposite and adjacent lengths.
    * @param {Number} opposite
    * @param {Number} adjacent
    * @return {Number}
    */
    getHypotenuse: function(opposite, adjacent){
        return Math.sqrt(opposite * opposite + adjacent * adjacent);
    },

    /**
    * Get radians from degrees.
    * @param {Number} degrees
    * @return {Number} radians
    */
    getRad: function(degrees){
        return degrees * (Math.PI/180);
    },

    /**
    * Get degrees from radians.
    * @param {Number} radians
    * @return {Number} degrees
    */
    getDeg: function(radians){
        return radians * (180/Math.PI);
    }
};

geo.Vector.prototype = {

    /**
    * Set the direction, update the x and y.  Ensures direction < 360.
    * @param {Number} direction
    * @return {Vector} this
    */
    setDirection: function(direction){
        var radians;
        this.direction = direction%360;
        radians = geo.getRad(this.direction);
        this.x = this.magnitude * Math.cos(radians);
        this.y = this.magnitude * Math.sin(radians);
        return this;
    },

    /**
    * Reverse this vector.
    * @return {Vector} this
    */
    reverse: function(){
        this.setDirection(this.direction + 180);
        return this;
    },

    /**
    * Add another vector to this one.
    * @param {Vector} vector
    * @return {Vector} this
    */
    add: function(vector){
        this.x += vector.x;
        this.y += vector.y;
        this.direction = geo.getDeg( Math.atan2( this.x, this.y ) );
        return this;
    }
};

var anim = {

    /**
    * Set configuration properties.
    * @param {Object} props
    */
    config: function(props){
        this.extend(this, props, true);
    },

    /**
    * framerate
    */
    fps: 30,

    /**
    * Add the properties of one object to another.
    * @method extend
    * @param {object} obj1 destination object
    * @param {object} obj2 object to add from
    * @param {boolean} [overwrite=false]
    */
    extend: function(obj1, obj2, overwrite){
        overwrite = !!overwrite;

        anim.eachOwn(obj2, function(prop, val){
            var hasProp = obj1.hasOwnProperty(prop);
            if(!hasProp || hasProp === overwrite){
                obj1[prop] = val;
            }
        });
    },

    /**
    * Check if a value is between two others, inclusive.
    * @param {Number} x the value to test
    * @param {Range} range
    */
    between: function(x, range){
        return x >= range.a && x <= range.b;
    },

    /**
    * Check if a range overlaps another range.
    * @param {Range} range1
    * @param {Range} range2
    * @return {boolean}
    */
    rangesOverlap: function(range1, range2){
        return this.between(range1.a, range2) || this.between(range1.b, range2);
    },

    /**
    * @class
    * @param {Number} config.a
    * @param {Number} config.b
    */
    Range: function(config){
        var temp;
        if(config.a > config.b){
            temp = config.b;
            config.b = config.a;
            config.a = temp;
        }
        anim.extend(this, config);
    },

    /**
    * Find intersection of two lines.
    * @param {Line} line1
    * @param {Line} line2
    * @return {Point} null if there is no intersection
    */
    getIntersection: function(line1, line2){
        console.log('find intersection', line1, line2);

        if(line1.m === line2.m){
            return null;
        }

        var x1, y1,
            x2, y2;

        x1 = 0;
        y1 = line1.getY(x1);
        x2 = line2.getX(y1);

        


        // y = mx + b
        // y[1] = m[1] * x[1] + b[1]
        // intersection y[1] = y[2]

        // m[1] * x[1] + b[1] = m[2] * x[2] + b[2]
        // y[1] = m[2] * x[2] + b[2]

        // http://www.mathopenref.com/coordintersection.html

        debugger;
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

    /**
    * Set the canvas and context used for animation.
    */
    setCanvas: function(canvas){
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    },

    /**
    * @class Actor
    */
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
                this.width = config.radius * 2;
                this.height = this.width;
                this.draw = function(context){
                    context.beginPath();
                    context.arc(0 + this.radius, 0 + this.radius, this.radius, 0, anim.getRad(360) );
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
                // TODO This should be moved to the prototype once Actor types are split out.
                this.draw = function(context){
                    if(!this.image.width){
                        return;
                    }

                    // Change the image frame, if it's time.
                    this.sinceFrameChange++;
                    if(this.sinceFrameChange === this.changeFrameEvery){
                        this.nextFrame();
                        this.sinceFrameChange = 0;
                    }

                    // Draw image
                    context.drawImage(
                        this.image,
                        this.width * this.frame, 0, // source offset
                        this.width, this.height,    // image dimensions
                        0, 0,                       // position on canvas
                        this.width, this.height     // scaling
                    );
                }
                break;
            default:
                if(!this.draw){
                    console.error('need a draw method');
                }
        }
    },

    /**
    * @class Point
    * @param {Number} config.x
    * @param {Number} config.y
    */
    Point: function(config){
        this.x = config.x;
        this.y = config.y;
    },

    /**
    * @class Line
    * @param {Object} config either the slope elements (m, x, b) or two points (p1, p2)
    */
    Line: function(config){
        var y, m, x, b, p1, p2;

        if(config.hasOwnProperty('m')){
            // y = config.m * config.x + config.b;
            m = config.m;
            b = config.b;
        } else {
            // determine line from two points
            p1 = config.p1;
            p2 = config.p2;
            m = (p2.y - p1.y) / (p2.x - p1.x);

            // find y-intercept
            b = p1.y - (m * p1.x);
        }

        anim.extend(this, {
            m: m,
            b: b
        });
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
    * Remove an actor from the stage.
    * @param {Actor/Number} actor Actor or Actor's id.
    * @return {Actor}
    */
    removeActor: function(actor){
        var index;

        if(typeof actor === 'number'){
            // Find actor by id.
            for(var i = 0; i < this.actors.length; i++){
                if(this.actors[i].id === actor){
                    index = i;
                    break;
                }
            }
        } else {
            index = this.actors.indexOf(actor);
        }

        return this.actors.splice(index, 1);
    },

    /**
    * Start the animation.
    * @param {Number} [frames] Stop after this many frames.  Run continuously if -1.
    * @param {function} updateActors
    */
    play: function(frames, updateActors){
        var me = this;
        
        if(!this.canvas){
            console.error('no canvas applied');
            return;
        }
        
        // register the context
        this.setCanvas(this.canvas);

        // Add click listeners.
        me.clicks = [];
        $(this.canvas).click(function(event){
            me.clicks.push(event);
        });

        this.framesLeft = frames;

        this.updateActors = updateActors;

        this.animate();
    },

    /**
    * Stop the animation loop.
    */
    stop: function(){
        this.framesLeft = 0;
    },

    /**
    * Render the next frame, make updates.
    */
    animate: function(){
        var me = this,
            actor;

        // clear the canvas
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        // Process the clicks.
        this.processClicks();

        // update each actor
        if(typeof this.updateActors === 'function'){
            this.updateActors(this.actors);
        }

        for(var i = 0, max = this.actors.length; i < max; i++){
            actor = this.actors[i];
            if(actor && typeof actor.onFrame === 'function'){
                actor.onFrame();
            }
        }

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

        // process collisions
        this.processCollisions();

        // prepare for the next loop
        if(this.framesLeft > 0 || this.framesLeft === -1){
            if(this.framesLeft > 0){
                this.framesLeft--;  
            }

            setTimeout(function(){
                // requestAnimationFrame(this.animate.bind(this));
                requestAnimationFrame(me.animate.bind(me));
            }, 1000/me.fps );
        } else {
            console.log('done animating');
        }
    },

    /**
    * Execute all the click handlers.  See if any Actors were clicked on.
    */
    processClicks: function(){
        var x, y, actor, point;

        for(var j = 0; j < this.clicks.length; j++){
            x = this.clicks[j].offsetX;
            y = this.clicks[j].offsetY;
            point = new this.Point({x: x, y: y});

            // Any actors clicked on?
            for(var i = 0, max = this.actors.length; i < max; i++){
                actor = this.actors[i];
                if(x >= actor.x && x <= actor.x + actor.width &&
                    y >= actor.y && y <= actor.y + actor.height){
                    if(typeof actor.onClick === 'function'){
                        actor.onClick();
                    }
                }
            }

            // Execute click handlers.
            for(var i = 0; i < this.clickHandlers.length; i++){
                this.clickHandlers[i](point);
            }
        }
        this.clicks = [];
    },

    /**
    * Identify collisions and process all collision handlers for each actor.
    */
    processCollisions: function(){
        var actor,
            otherActor,
            collisionsToProcess = [],
            collision;

        for(var i = 0, max = this.actors.length; i < max; i++){
            actor = this.actors[i];
            // TODO maybe cache this in the Actor and invalidate when moved/resized
            // actorBB = actor.getBoundingBox();

            if(typeof actor.onCollision === 'function'){
                for(var j = 0; j < max; j++){
                    otherActor = this.actors[j];
                    if(actor === otherActor){
                        continue;
                    }
                    
                    if(actor.overlaps(otherActor)){
                        collisionsToProcess.push({
                            actor: actor,
                            collidedWith: otherActor
                        });
                    }
                }   
            }
        } 

        while(collisionsToProcess.length){
            collision = collisionsToProcess.shift();
            if(collision.actor && collision.collidedWith){
                collision.actor.onCollision(collision.collidedWith);
            }
        }
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
        console.warn('wrong');
        // degrees = radians * (180/pi)
        return radians / (Math.PI/180);
    },

    /**
    * Get a random color.
    */
    getColor: function(){
        var r = this.rand(0, 255),
            g = this.rand(0, 255),
            b = r + g > 400 ? 0 : r + g < 100 ? 255: this.rand(0, 255);

        return 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
        // return 'rgba(' + this.rand(0, 255) + ', ' + this.rand(0, 255) + ', ' + this.rand(0, 255) + ', ' + this.rand(5, 10) / 10 + ')'
    },

    /**
    * Add an onclick handler to the canvas.  Each handler is passed a {Point} where the click happened.
    * @param {function} handler
    */
    onClick: function(handler){
        this.clickHandlers.push(handler);
    },

    /**
    * Storage for unprocessed clicks
    * @type {Array}
    */
    clicks: [],

    /**
    * Collisions during this frame
    * @type {Array}
    */
    collisions: []
};

anim.extend(anim.Actor.prototype, {

    /**
    * @type {Number}
    */
    frame: 0,

    /**
    * Advance this image's frame every x animation frames.
    * @type {Number}
    */
    changeFrameEvery: 0,

    /**
    * How many animation frames ago this image's frame was changed.
    * @type {Number}
    */
    sinceFrameChange: 0,

    /**
    * @type {Point}
    */
    lastPosition: undefined,

    /**
    * Pixels moved per frame.
    */
    speed: 0,

    /**
    * How much the direction changes per frame.
    * @type {Number}
    */
    turnRate: 0,

    /**
    * {Number} opacity between 0 and 1 (inclusive)
    */
    opacity: 1,

    /**
    * {String} fillStyle
    */
    fillStyle: undefined,

    /**
    * Flag used to note that this Actor was given instructions to move to a position.
    */
    isMovingToPosition: false,

    /**
    * x,y coords for position moving to
    */
    movingTo: {},

    /**
    * Number of frames left for isMovingToPosition to complete.
    */
    moveToFrames: 0,

    /**
    * Callback run when this Actor is clicked on.
    */
    onClick: undefined,

    /**
    * Callback run when this Actor collides with another Actor.
    * @param {Actor} actor collided with
    */
    onCollision: undefined,

    /**
    * Callback run on each frame.
    */
    onFrame: undefined,

    /**
    * Move to the next Image frame.
    * @return {Actor} this
    */
    nextFrame: function(){
        this.frame = (this.frame + 1) % (this.image.width / this.width);
        return this;
    },

    /**
    * Move to the previous Image frame.
    * @return {Actor} this
    */
    prevFrame: function(){
        this.frame = this.frame - 1;
        if(this.frame < 0){
            this.frame = (this.image.width / this.width) - 1;
        }
        return this;
    },

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
    * Skip ahead x pixels in the current direction
    * @param {Number} pixels
    */
    skipAhead: function(pixels){

    },

    /**
    * Move the a new position.
    * @param {Number} x
    * @param {Number} y
    * @param {Number} [seconds] If provided, move to that position over the next seconds.
    * Otherwise, use the current speed.  If speed is 0, move instantly.
    */
    moveTo: function(x, y, seconds){
        var xChange,
            yChange,
            distance,
            degrees,
            frames;

        // move immediately
        if(!seconds || !this.speed){
            this.x = x;
            this.y = y;
            return;
        }

        xChange = x - this.x;
        yChange = y - this.y;
        degrees = 180 - anim.getDeg( Math.atan2(xChange, yChange) ),
        this.direction = (270 + degrees)%360;
        distance = Math.sqrt( xChange * xChange + yChange * yChange);

        if(!seconds){
            // use the current speed
            frames = distance / this.speed;
        } else {
            // calculate a new speed
            frames = anim.fps * seconds;
            this.speed = distance/frames;
        }   
        
        this.isMovingToPosition = true;
        this.movingTo = {
            x: x,
            y: y
        };
        this.moveToFrames = frames;
    },

    // get the next x and y based on speed and direction
    setNextPosition: function(context){

        var canvas = context.canvas,
            nextPoint;

        // update the speed
        this.accelerate(this.acceleration);

        if(this.isMovingToPosition){
            if(--this.moveToFrames <= 0){
                this.x = this.movingTo.x;
                this.y = this.movingTo.y;
                this.isMovingToPosition = false;
                this.speed = 0;
            }
        }

        // this.lastPosition = anim.create('Point', {x: this.x, y: this.y});
        this.lastPosition = new anim.Point({x: this.x, y: this.y});

        // update the rotation
        this.rotate(this.spin);

        // update the direction
        this.direction += this.turnRate;

        nextPoint = this.getNextPosition();
        this.moveTo(nextPoint.x, nextPoint.y, 0);

        // this.x += this.speed * Math.cos(anim.getRad(this.direction));
        // this.y += this.speed * Math.sin(anim.getRad(this.direction));
        if(this.x + this.width > canvas.width || this.x < 0){
            this.direction = 180 - this.direction;
        }

        if(this.y + this.height > canvas.height || this.y < 0){
            this.direction *= -1;
        }
    },

    /**
    * Get next position based on current speed and direction.
    * @param {Number} [frames] If provided, get the next position after this many frames.
    * @return {Point}
    */
    getNextPosition: function(frames){
        var x, y, frames = frames || 1;
        x = this.x + this.speed * frames * Math.cos(anim.getRad(this.direction));
        y = this.y + this.speed * frames * Math.sin(anim.getRad(this.direction));
        return new anim.Point({
            x: x,
            y: y
        });
    },

    /**
    * Move the the next position based on current velocity.
    * @param {Number} [frames] If provided, get the next position after this many frames.
    * @return {Actor}
    */
    nextPosition: function(frames){
        var position = this.getNextPosition(frames);
        this.x = position.x;
        this.y = position.y;
        return this;
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
    * Change direction a number of degrees.
    * @param {Number} degrees
    * @return {Actor}
    */
    turn: function(degrees){
        this.setDirection(this.direction + degrees);
        return this;
    },

    /**
    * Set direction.  If < 0 || > 360, corrects it.
    * @param {Number} degrees
    */
    setDirection: function(degrees){
        this.direction = degrees%360;
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
    },

    /**
    * Get the 4 points that describe the space this Actor exists in.
    * @return {Object}
    */
    getBoundingBox: function(){
        return {
            x1: this.x,
            x2: this.x + this.width,
            y1: this.y,
            y2: this.y + this.height
        };
    },

    /**
    * Test if this Actor's bounding box overlaps another bounding box.
    * @param {Actor} actor
    */
    overlaps: function(actor){
        var thisBox = this.getBoundingBox(),
            otherBox = actor.getBoundingBox(),
            range1,
            range2;

        // check x axis
        range1 = anim.create('Range', {a: thisBox.x1, b:thisBox.x2});
        range2 = anim.create('Range', {a: otherBox.x1, b:otherBox.x2});
        if(!anim.rangesOverlap(range1, range2)){
            return false;
        }

        // check y axis
        range1 = anim.create('Range', {a: thisBox.y1, b:thisBox.y2});
        range2 = anim.create('Range', {a: otherBox.y1, b:otherBox.y2});
        if(!anim.rangesOverlap(range1, range2)){
            return false;
        }

        return true;
    }
});

anim.extend(anim.Line.prototype, {
    getY: function(x){
        return this.m * x + this.b;
    },
    getX: function(y){
        return (y - this.b) / this.m;
    }
});

var actor;

$(function(){
    var canvas = $('#canvas')[0];

    anim.config({
        canvas: canvas,
        fps: 100
    });


    actor = anim.addActor({
        type: 'Image',
        src: 'img/face.png',
        changeFrameEvery: 10,
        width: 100,
        height: 100,
        x: 200,
        y: 0,
        direction: 222,
        speed: 3
    });

    anim.play(-1, function(actors){
    });

    $('body').keydown(function(event){
        switch(event.which){
            // down
            case 40:
                actor.speed--;
                // actor.direction = 90;
                // actor.spin++;

                break;
            // up
            case 38:
                actor.speed++;
                // actor.direction = 270;
                // actor.spin--;
                break;
            // left
            case 37:
                // actor.direction = 180;
                // actor.spin++;
                actor.turnRate--;
                break;
            // right
            case 39:
                actor.turnRate++;
                // actor.direction = 0;
                // actor.spin--;
                break;
        }
    });
});