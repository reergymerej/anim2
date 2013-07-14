var util = {
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
	* Add the properties of one object to another.
	* @method extend
	* @param {object} obj1 destination object
	* @param {object} obj2 object to add from
	* @param {boolean} [overwrite=false]
	*/
	extend: function(obj1, obj2, overwrite){
	    overwrite = !!overwrite;

	    util.eachOwn(obj2, function(prop, val){
	        var hasProp = obj1.hasOwnProperty(prop);
	        if(!hasProp || hasProp === overwrite){
	            obj1[prop] = val;
	        }
	    });
	},

	/**
	* Perform a function for each item in an array
	* @param {Array} collection
	* @param {Function} fn
	*/
	doForAll: function(collection, fn){
        for(var i = 0, max = collection.length; i < max; i++){
            fn(collection[i]);
        }
    },

    /**
    * Check if a value is between two others, inclusive.
    * @method between
    * @param {Number} x the value to test
    * @param {Range} range
    * @return {boolean}
    */
    between: function(x, range){
        return x >= range.a && x <= range.b;
    }
};