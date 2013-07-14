/**
* @for Actor
*/
util.extend(anim.Actor.prototype, {

    /**
    * @property frame
    * @type {Number}
    * @default 0
    */
    frame: 0,

    /**
    * Advance this image's frame every x animation frames.
    * @property changeFrameEvery
    * @type {Number}
    * @default 0
    */
    changeFrameEvery: 0,

    /**
    * How many animation frames ago this image's frame was changed.
    * @property sinceFrameChange
    * @type {Number}
    * @default 0
    */
    sinceFrameChange: 0,

    /**
    * @property oldPositions
    * @type {Point[]}
    */
    oldPositions: [],

    /**
    * Pixels moved per frame.
    * @property speed
    * @type {Number}
    */
    speed: 0,

    /**
    * How much the direction changes per frame.
    * @property turnRate
    * @type {Number}
    */
    turnRate: 0,

    /**
    * opacity between 0 and 1 (inclusive)
    * @property opacity
    * @type {Number} 
    * @default 1
    */
    opacity: 1,

    /**
    * fillStyle
    * @property fillStyle
    * @type {String} 
    */
    fillStyle: undefined,

    /**
    * Flag used to note that this Actor was given instructions to move to a position.
    * @property isMovingToPosition
    * @type {Boolean}
    */
    isMovingToPosition: false,

    /**
    * x,y coords for position moving to
    * @property movingTo
    * @type {Object} x, y coords
    */
    movingTo: {},

    /**
    * Number of frames left for isMovingToPosition to complete.
    * @property moveToFrames
    * @type {Number}
    */
    moveToFrames: 0,

    /**
    * Vector representing this Actor's speed/direction.
    * @property vector
    * @type {Vector}
    */
    vector: undefined,

    /**
    * Callback run when this Actor is clicked on.
    * @property onClick
    * @type {function}
    */
    onClick: undefined,

    /**
    * Callback run when this Actor collides with another Actor, passed actor collided with
    * @property onCollision
    * @type {function}
    */
    onCollision: undefined,

    /**
    * Callback run on each frame.
    * @property onFrame
    * @type {function}
    */
    onFrame: undefined,

    /**
    * Move to the next Image frame.
    * @method nextFrame
    * @return {Actor} this
    */
    nextFrame: function(){
        this.frame = (this.frame + 1) % (this.image.width / this.width);
        return this;
    },

    /**
    * Move to the previous Image frame.
    * @method prevFrame
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
    * @method move
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
    * @method skipAhead
    * @param {Number} pixels
    */
    skipAhead: function(pixels){

    },

    /**
    * Move the a new position.
    * @method moveTo
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
        degrees = anim.getDeg( Math.atan2(yChange, xChange) ),
        this.direction = degrees;
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

    /**
    * get the next x and y based on speed and direction
    * @method setNextPosition
    * @param {context} context
    */
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

        this.oldPositions.push(new geo.Point(this.x, this.y));

        // Only keep x oldPositions.
        if(this.oldPositions.length > 20){
            this.oldPositions.splice(0, this.oldPositions.length - 20);
        }

        // Mark each of the old positions.
        // for(var i = 0; i < this.oldPositions.length; i++){
        //     anim.drawCircle({
        //         point: this.oldPositions[i],
        //         radius: 2
        //     });
        //     if(i > 0){
        //         anim.drawLine( this.oldPositions[i - 1], this.oldPositions[i] );
        //     }
        // }

        // update the rotation
        this.rotate(this.spin);

        // update the direction
        // TODO account for turnRate
        // this.direction += this.turnRate;
        // this.vector.setDirection(this.direction);

        nextPoint = this.getNextPosition();

        // TODO merge these border checks
        // update later to account for adjusted center of Actors (not top left)
        // bounce right wall
        if(nextPoint.x > canvas.width - this.width/2){
            nextPoint.x += -1 * ( 2 * (nextPoint.x - (canvas.width - this.width/2)) );
            this.vector.reverseX();
        }

        // bounce left wall
        if(nextPoint.x < this.width/2){
            nextPoint.x += 1 * ( 2 * (this.width/2 - nextPoint.x) );
            this.vector.reverseX();
        }

        // bounce bottom wall
        if(nextPoint.y > canvas.height - this.height/2){
            nextPoint.y += -1 * (2 * (nextPoint.y - (canvas.height - this.height/2)));
            this.vector.reverseY();
        }

        // bounce top wall
        if(nextPoint.y < this.height/2){
            nextPoint.y += 1 * (2 * (this.height/2 - nextPoint.y));
            this.vector.reverseY();
        }

        this.moveTo(nextPoint.x, nextPoint.y, 0);
    },

    /**
    * Get next position based on current speed and direction.
    * @method getNextPosition
    * @param {Number} [frames=1] If provided, get the next position after this many frames.
    * @return {Point}
    */
    getNextPosition: function(frames){
        var frames = frames || 1;
        return new geo.Point({
            x: this.x + this.vector.x * frames,
            y: this.y + this.vector.y * frames
        });
    },

    /**
    * Move the the next position based on current velocity.
    * @method nextPosition
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
    * @method setRotation
    * @param {Number} degrees
    */
    setRotation: function(degrees){
        this.rotation = degrees;
    },

    /**
    * Rotate.
    * @method rotate
    * @param {Number} degrees
    */
    rotate: function(degrees){
        degrees = degrees || 0;
        this.rotation += degrees;
    },

    /**
    * Change direction a number of degrees.
    * @method turn
    * @param {Number} degrees
    * @return {Actor}
    */
    turn: function(degrees){
        this.setDirection(this.direction + degrees);
        this.vector.setDirection(this.vector.direction + degrees);
        return this;
    },

    /**
    * Set direction.  If < 0 || > 360, corrects it.
    * @method setDirection
    * @param {Number} degrees
    */
    setDirection: function(degrees){
        this.direction = degrees%360;
    },

    /**
    * Set new speed.
    * @param {Number} speed
    */
    setSpeed: function(speed){
        this.vector.setMagnitude(speed);
    },

    /**
    * Change speed based on a rate of acceleration.
    * @method accelerate
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
    * @method accelerateTo
    * @param {Number} speed Desired speed.
    * @param {Number} frames Frames to get to desired speed.
    */
    accelerateTo: function(speed, frames){
        this.isAccelerating = speed;
        this.setAcceleration(speed / frames);
    },

    /**
    * Set the acceleration rate.
    * @method setAcceleration
    * @param {Number} acceleration
    */
    setAcceleration: function(acceleration){
        this.acceleration = acceleration;
    },

    /**
    * Get the 4 points that describe the space this Actor exists in.
    * @method getBoundingBox
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
    * @method overlaps
    * @param {Actor} actor
    * @return {boolean}
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
    },

    /**
    * Draw the bounding box around this Actor.
    * @param {Object} context
    */
    drawBoundingBox: function(context){
        anim.drawBox({
            context: context,
            origin: new geo.Point(-this.width/2, -this.height/2),
            width: this.width
        });
    },

    /**
    * Draw the bounding box for the next position this Actor
    * will have based on current speed and direction.
    * @param context
    */
    boxNextPosition: function(context){
        debugger;    
    },

    /**
    * Draw a mark on the origin of the Actor.
    * @param c context
    */
    drawOrigin: function(c){
        var LENGTH = 10;

        c.beginPath();
        c.strokeStyle = 'rgb(0, 0, 0)';
        c.lineWidth = 1;
        c.moveTo(-LENGTH, 0);
        c.lineTo(LENGTH, 0);
        c.stroke();
        c.moveTo(0, -LENGTH);
        c.lineTo(0, LENGTH);
        c.stroke();
        c.closePath();
    }
});