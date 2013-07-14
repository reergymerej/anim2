/**
* @module geo
*/
var geo = {

    /**
    * Get a hypotenuse length given opposite and adjacent lengths.
    * @for geo
    * @method getHypotenuse
    * @param {Number} opposite
    * @param {Number} adjacent
    * @return {Number}
    */
    getHypotenuse: function(opposite, adjacent){
        return Math.sqrt(opposite * opposite + adjacent * adjacent);
    },

    /**
    * Get radians from degrees.
    * @method getRad
    * @param {Number} degrees
    * @return {Number} radians
    */
    getRad: function(degrees){
        return degrees * (Math.PI/180);
    },

    /**
    * Get degrees from radians.
    * @method getDeg
    * @param {Number} radians
    * @return {Number} degrees
    */
    getDeg: function(radians){
        return radians * (180/Math.PI);
    },

    /**
    * @class Point
    * @constructor
    * Accepts a config object or just x, y.
    * @param {Number} config.x
    * @param {Number} config.y
    */
    Point: function(config){
        if(arguments.length > 1){
            this.x = arguments[0];
            this.y = arguments[1];
        } else {
            this.x = config.x;
            this.y = config.y;
        }
    },

    /**
    * @class Line
    * @constructor
    * @param {Object} config
    * @param {Point} config.point1
    * @param {Point} config.point2
    */
    Line: function(config){
        this.init(config);
    },


    /**
    * @class Vector
    * @constructor
    * @param {Number} config.direction
    * @param {Number} config.magnitude
    */
    Vector: function(config){
        this.magnitude = config.magnitude;
        this.direction = config.direction;
        this.setDirection(config.direction);
    }
};

/**
* @class Vector
*/
geo.Vector.prototype = {

    /**
    * Set the direction, update the x and y.  Ensures direction < 360.
    * @method setDirection
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
    * @method reverse
    * @return {Vector} this
    */
    reverse: function(){
        this.setDirection(this.direction + 180);
        return this;
    },

    /**
    * Add another vector to this one.
    * @method add
    * @param {Vector} vector
    * @return {Vector} this
    */
    add: function(vector){
        this.x += vector.x;
        this.y += vector.y;
        this.updateDirection();
        return this;
    },

    /**
    * Reverse the x of this vector.  Updates direction.
    * @method reverseX
    * @return {Vector} this
    */
    reverseX: function(){
        this.x *= -1;
        this.updateDirection();
    },

    /**
    * Reverse the y of this vector.  Updates direction.
    * @method reverseY
    * @return {Vector} this
    */
    reverseY: function(){
        this.y *= -1;
        this.updateDirection();
    },

    /**
    * Update direction based on current x and y changes.
    * @method updateDirection
    * @private
    */
    updateDirection: function(){
        this.direction = this.getDirection(this.x, this.y);
    },

    /**
    * Get the direction from x and y changes.
    * @method getDirection
    * @param {Number} x
    * @param {Number} y
    * @return {Number} 0 - 360
    */
    getDirection: function(x, y){
        return geo.getDeg( Math.atan2( y, x ) );  
    },

    /**
    * Change the magnitude.  Updates x and y distances.
    * @param {Number} magnitude
    */
    setMagnitude: function(magnitude){
        this.magnitude = magnitude;
        this.setDirection(this.direction);
    },

    /**
    * Set the x and y distances.  Updates magnitude and direction.
    * @param {Number} x
    * @param {Number} y
    */
    setXY: function(x, y){
        this.x = x;
        this.y = y;
        this.magnitude = geo.getHypotenuse(x, y);
        this.updateDirection();
    }
};

/**
* @class Line
*/
/**
* Find the slope of a line.s
* @return {Number}
*/
geo.Line.prototype.getSlope = function() {
    return (this.point2.y - this.point1.y) / (this.point2.x - this.point1.x);
};

/**
* Find y-intercept.
* @return {Number}
*/
geo.Line.prototype.getB = function() {
    return this.point1.y - this.m * this.point1.x;
};

/**
* Get y for an x value.
* @param {Number} x
* @return {Number} y
*/
geo.Line.prototype.getY = function(x) {
    // y = mx + b
    return this.m * x + this.b;
};

/**
* Find intersection with another line.
* @param {Line} line
* @return {Point} null if no intersection
*/
geo.Line.prototype.getIntersection = function(line) {
    var x, y;

    x = (this.b - line.b) / (line.m - this.m);

    if(!isFinite(x)){
        return null;
    }

    y = this.getY(x);

    return new geo.Point(x, y);
};

/**
* Change the points that define this Line
* @param {Object} config
* @param {Point} config.point1
* @param {Point} config.point2
* @private
*/
geo.Line.prototype.init = function(config) {
    this.point1 = config.point1;
    this.point2 = config.point2;
    this.m = this.getSlope();
    this.b = this.getB();
};

/**
* Change one or both of the points for this line.
* @param {Object} config
* @param {Object} [config.point1]
* @param {Object} [config.point2]
*/
geo.Line.prototype.changePoints = function(config) {
    anim.extend(config, {
        point1: this.point1,
        point2: this.point2
    });
    this.init(config);
};