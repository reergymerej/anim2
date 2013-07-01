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
    * @return an instance of the class specified
    */
    create: function(cls){
        if(this.hasOwnProperty(cls)){
            return new this[cls]();
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

    Actor: function(config){

    }
};


anim.extend(anim.Actor.prototype, {
    test: function(){
        console.log('test');
    },
    donkey: function(){
        console.log('donkey');
    }
});


var a = anim.create('Actor');


$(function(){
    var canvas = $('#canvas')[0],
        context = canvas.getContext('2d'),
        actors = [];

    function render(){
        var actor;

        // clear the canvas
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        // draw each actor
        for(var i = 0, max = actors.length; i < max; i++){
            actor = actors[i];
            context.fillStyle = (actor.fillStyle);
            context.fillRect(actor.x, actor.y, actor.width, actor.height);
        }
    }

    actors.push({
        fillStyle: 'rgba(0, 0, 200, 0.5)',
        // fillRect: [30, 30, 55, 50],
        x: 30,
        y: 30,
        width: 55,
        height: 50
    });

    // actors.push({
    //     fillStyle: 'rgba(16, 250, 13, 0.5)',
    //     fillRect: [60, 60, 85, 80]
    // });



    render();
});

// var a1 = new anim.actor.Actor({
//     config: 'object'
// });

// console.log(a1, a1.getInfo());