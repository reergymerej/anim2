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
    * @class LineSegment
    * @extends Line
    * @constructor
    * @param {Point} point1
    * @param {Point} point2
    */
    LineSegment: function(point1, point2){
        this.init({
            point1: point1,
            point2: point2
        });
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
    },

    /**
    * @class Range
    * @constructor
    * @param {Number} a
    * @param {Number} b
    */
    Range: function(a, b){
        var temp;
        if(a > b){
            temp = b;
            b = a;
            a = temp;
        }
        this.a = a;
        this.b = b;
    },

    /**
    * @class Box
    * @constructor
    * @param {Point} tl The top left position.
    * @param {Number} width
    * @param {Number} height
    */
    Box: function(tl, width, height){
        // this.tl = tl;
        // this.tr = new geo.Point(tl.x + width, tl.y);
        // this.bl = new geo.Point(tl.x, tl.y + height);
        // this.br = new geo.Point(tl.x + width, tl.y + height);
        this.xRange = new geo.Range(tl.x, tl.x + width);
        this.yRange = new geo.Range(tl.y, tl.y + height);
    }
};


/**
* @class Box
*/
geo.Box.prototype = {
    /**
    * Test if this Box intersects with another Box.
    * @param {Box} box
    * @return {Booolean}
    */
    intersects: function(box){
        return this.xRange.intersects(box.yRange)
            && this.yRange.intersects(box.xRange);
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
    util.extend(config, {
        point1: this.point1,
        point2: this.point2
    });
    this.init(config);
};

geo.LineSegment.prototype = geo.Line.prototype;

/**
* Get a range (x or y) for this LineSegment.
* @param {String} axis x or y
* @return {Range}
*/
geo.LineSegment.prototype.getRange = function(axis) {
    return new geo.Range(this.point1[axis], this.point2[axis]);
};

/**
* Get the intersection for this LineSegment and another.
* @param {LineSegment} lineseg
* @return {Point}
*/
geo.LineSegment.prototype.getSegmentIntersection = function(lineseg) {
    var intersection = this.getIntersection(lineSeg2);
    
    if( util.between(intersection.x, this.getRange('x')) 
        && util.between(intersection.x, lineseg.getRange('x')) 
        && util.between(intersection.y, this.getRange('y'))
        && util.between(intersection.y, lineseg.getRange('y')) ){
        return intersection;
    }
};

/**
* Find out if this Range intersects with another.
* @param {Range} range
* @return {Boolean}
*/
geo.Range.prototype.intersects = function(range){
    return (this.a >= range.a && this.a <= range.b)
        || (this.b >= range.a && this.b <= range.b)
        || (range.a >= this.a && range.a <= this.b)
        || (range.b >= this.a && range.b <= this.b);
};