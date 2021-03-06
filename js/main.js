/**
* @module anim
*/
var anim = {

    /**
    * @for anim
    * @property RIGHT
    * @type {Number}
    * @default 0
    * @final
    */
    RIGHT: 0,

    /**
    * @property DOWN
    * @type {Number}
    * @default 90
    * @final
    */
    DOWN: 90,

    /**
    * @property LEFT
    * @type {Number}
    * @default 180
    * @final
    */
    LEFT: 180,

    /**
    * @property UP
    * @type {Number}
    * @default 270
    * @final
    */
    UP: 270,

    /**
    * Set configuration properties.
    * @method config
    * @param {Object} props
    */
    config: function(props){
        util.extend(this, props, true);

        // register the context
        this.setCanvas(this.canvas);
    },

    /**
    * Draw each actor's bounding box.
    * @property [boundingBoxes=false]
    */
    boundingBoxes: false,

    /**
    * @property framerate
    * @type {Number}
    * @default 30
    */
    fps: 30,

    /**
    * Check if a range overlaps another range.
    * @method rangesOverlap
    * @param {Range} range1
    * @param {Range} range2
    * @return {boolean}
    */
    rangesOverlap: function(range1, range2){
        return util.between(range1.a, range2) || util.between(range1.b, range2);
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
    * If defined, draw a grid on the canvas.
    */
    canvasGrid: undefined,

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
    * @param {Object} config
    * @return {anim.Actor}
    */
    addActor: function(config){
        var actor;

        util.extend(config, {
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
    * Draw a grid on the canvas.
    * @param {Number} interval
    */
    drawGrid: function(interval){
        this.context.lineWidth = .25;
        // vertical
        for(var i = 0; i < this.canvas.width; i += interval){
            this.context.beginPath();
            if(i % (5 * interval) === 0){
                this.context.strokeStyle = 'rgb(0, 0, 245)';
            } else {
                this.context.strokeStyle = 'rgb(0, 255, 245)';
            }
            this.context.moveTo(i, 0);
            this.context.lineTo(i, this.canvas.height);
            this.context.stroke();
        }
        // horizontal
        for(var i = 0; i < this.canvas.height; i += interval){
            this.context.beginPath();
            if(i % (5 * interval) === 0){
                this.context.strokeStyle = 'rgb(0, 0, 245)';
            } else {
                this.context.strokeStyle = 'rgb(0, 255, 245)';
            }
            this.context.moveTo(0, i);
            this.context.lineTo(this.canvas.width, i);
            this.context.stroke();
        }
    },

    /**
    * Clear the canvas.
    */
    clear: function(){
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
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
        this.clear();        

        // Draw grid, if needed.
        if(this.canvasGrid){
            this.drawGrid(this.canvasGrid);
        }

        // Process the clicks.
        this.processClicks();

        // update each actor
        if(typeof this.updateActors === 'function'){
            this.updateActors(this.actors);
        }

        // Handle onframe callbacks.
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

            // TODO Remove the x/y usage after all Actors are using position.
            if(actor.position){
                this.context.translate(actor.position.x, actor.position.y);
            } else {
                this.context.translate(actor.x, actor.y);
            }
            this.context.rotate(anim.getRad(actor.rotation));
            actor.draw(this.context);

            if(this.boundingBoxes){
                actor.drawBoundingBox(this.context);
                this.drawBox({
                    context: this.context,
                    fill: true,
                    origin: (function(){
                        var nextPoint = new geo.Point(actor.getNextPosition());
                        nextPoint.x -= (actor.x + actor.width/2);
                        nextPoint.y -= (actor.y + actor.height/2);
                        return nextPoint;
                    })(),
                    width: actor.width
                });
            }

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
            point = new geo.Point({x: x, y: y});

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
                    
                    // if(actor.overlaps(otherActor)){
                    //     collisionsToProcess.push({
                    //         actor: actor,
                    //         collidedWith: otherActor
                    //     });
                    // }
                    if(actor.intersects(otherActor)){
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

        return 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';
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
    * Draw a box.
    * @param config.context
    * @param config.origin starting point
    * @param config.width
    * @param [config.height] If blank, assume this is a square.
    */
    drawBox: function(config){
        var ctx = config.context,
            x = config.origin.x,
            y = config.origin.y,
            height = config.height || config.width;
        
        ctx.beginPath();
        ctx.lineWidth = .25;
        ctx.strokeStyle = 'rbg(0, 0, 0)';
        ctx.moveTo(x, y);
        ctx.lineTo(x + config.width, y);
        ctx.lineTo(x + config.width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y);
        if(config.fill){
            ctx.fillStyle = config.fillStyle || 'rgba( 255, 0, 0, 0.25)';
            ctx.fill();
        }
        // ctx.stroke();
    },

    /**
    * Draw a line segment between two Points.
    * @param {Point/LineSegment} p1 If a LineSegment is provided, there 
    * is no need to specify points.
    * @param {Point} [p2]
    */
    drawLine: function(p1, p2){
        var c = this.context;

        // LineSegment provided instead of points
        if(arguments.length === 1){
            p2 = p1.point2;
            p1 = p1.point1;
        }

        c.beginPath();
        c.lineWidth = 1;
        c.strokeStyle = '#000000';
        c.moveTo(p1.x, p1.y);
        c.lineTo(p2.x, p2.y);
        c.stroke();
    },

    /**
    * Draw a solid circle, centered on a Point.
    * @param {Point} config.point
    * @param {Number} config.radius
    * @param {String} [config.fillStyle]
    */
    drawCircle: function(config){
        var c = this.context,
            p = config.point;

        c.beginPath();
        c.arc(p.x, p.y, config.radius, 0, geo.getRad(360) );
        c.fillStyle = config.fillStyle || 'rgba(0, 0, 0, 0.5)';
        c.fill();
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
    collisions: [],



    /**
    * @class Range
    * @constructor
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
        util.extend(this, config);
    },

    /**
    * Anything on the canvas is an Actor.
    * @class Actor
    * @constructor
    * @param {Number} width
    * @param {Number} [direction]
    * @param {Number} [speed]
    */
    Actor: function(config){

        var me = this,
            position = config.position || new geo.Point(0, 0);

        // Set defaults.
        util.extend(config, {
            width: 50,
            height: 50,
            x: 0,
            y: 0,
            position: position,
            speed: 0,
            direction: 10,
            rotation: 0,
            spin: 0,
            fillStyle: anim.getColor()
        });

        // Create getters/setters for each attribute.
        util.eachOwn(config, function(prop, value){
            me[prop] = value;
        });

        // TODO Break these types into their own classes.
        switch(config.type){
            
            case 'Line':
                this.line = new geo.Line({point1: this.point1, point2: this.point2});

                this.draw = function(context){
                    anim.drawLine(this.line);
                }
                break;
            case 'Circle':
                this.radius = this.width /2;
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
            case 'Rectangle':
            default:

                this.draw = function(context){
                    this.drawOrigin(context);
                    context.fillStyle = this.fillStyle;
                    context.fillRect(-this.width/2, -this.height/2, this.width, this.height);
                }
        }

        this.vector = new geo.Vector({
            direction: this.direction,
            magnitude: this.speed
        });
    }
};


var actor, target;

var line1, lineSeg, lineSeg2;

$(function(){
    var canvas = $('#canvas')[0];

    anim.config({
        canvas: canvas,
        fps: 30,
        boundingBoxes: false,
        canvasGrid: 10
    });

    // actor = anim.addActor({
    //     // type: 'Image',
    //     // src: 'img/face.png',
    //     // changeFrameEvery: 10,
    //     type: 'Rectangle',
    //     width: 10,
    //     height: 10,
    //     x: 599,
    //     y: 0,
    //     direction: 30,
    //     speed: 10
    // });

    // $('body').keydown(function(event){

    //     var turnRate = 10;

    //     switch(event.which){
    //         // down
    //         case 40:
    //             util.doForAll(anim.actors, function(a){
    //                 a.vector.setXY(a.vector.x - 5, a.vector.y - 5);
    //             });
    //             break;
    //         // up
    //         case 38:
    //             util.doForAll(anim.actors, function(a){
    //                 a.vector.setXY(a.vector.x + 5, a.vector.y + 5);
    //             });
    //             // newActors();
    //             break;
    //         // left
    //         case 37:
    //             util.doForAll(anim.actors, function(a){
    //                 a.turn(-turnRate);
    //             });
    //             break;
    //         // right
    //         case 39:
    //             playFrame();
    //             // util.doForAll(anim.actors, function(a){
    //             //     a.turn(turnRate);
    //             // });
    //             break;
    //     }
    // });

    // Intersection test.
    // actor = new geo.LineSegment( new geo.Point(0, 0), new geo.Point(10, 10) );
    // lineSeg2 = new geo.LineSegment( new geo.Point(200, 100), new geo.Point(100, 200) ); 

    $('canvas').mousemove(function(event){
        var x = event.offsetX,
            y = event.offsetY,
            intersection;
            
        // actor.changePoints({point2: new geo.Point(x, y)});

        // anim.clear();
        // anim.drawGrid(10);
        // anim.drawLine(lineSeg2);
        // anim.drawLine(actor);
        // intersection = actor.getSegmentIntersection(lineSeg2);
        // if(intersection){
        //     anim.drawCircle({
        //         point: intersection,
        //         radius: 20
        //     });
        // }

        // target.moveTo(x, y, 0);
    });

    target = anim.addActor({
        type: 'Rectangle',
        width: 100,
        height: 100,
        position: new geo.Point(300, 300)
    });


    function onColl(collidedWith){
        collidedWith.rotate(this.vector.magnitude/2);
    }

    for(var i = 0; i < 6; i++){
        actor = anim.addActor({
            type: 'Rectangle',
            // fillStyle: 'rgba(200, 0, 255, .5)',
            width: 50,
            height: 50,
            position: new geo.Point(0, 0),
            x: 0,
            y: 0,
            direction: (i + 1) * 25,
            speed: 5 + i,
            onCollision: onColl
        });
    }


    anim.play(-1/*, function(){
        if(actor.intersects(target)){
            console.log('woop!');
        }
    }*/);
});