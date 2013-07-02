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

    Actor: function(config){

        var me = this;

        // Create getters/setters for each attribute.
        anim.eachOwn(config, function(prop, value){
            me[prop] = value;
        });
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
            actor.draw(context);
        }

        requestAnimationFrame(render);
    }

    // actors.push(anim.create('Actor', {
    //     x: 0,
    //     y: 0,
    //     width: 100,
    //     height: 100,
    //     fillStyle: 'rgba(100, 0, 200, 0.5)',
    //     move: { x: 3, y: 1 }
    // }));

    // actors.push(anim.create('Actor', {
    //     x: 0,
    //     y: 0,
    //     width: 50,
    //     height: 50,
    //     fillStyle: 'rgba(255, 0, 15, 0.5)',
    //     move: { x: 1, y: 2 }
    // }));

    // actors.push(anim.create('Actor', {
    //     x: 0,
    //     y: 0,
    //     width: 30,
    //     height: 80,
    //     fillStyle: 'rgba(100, 100, 0, 0.5)',
    //     move: { x: 2.5, y: 2 }
    // }));

    // actors.push(anim.create('Actor', {
    //     x: 0,
    //     y: 0,
    //     width: 40,
    //     height: 50,
    //     fillStyle: 'rgba(0, 250, 0, 0.5)',
    //     move: { x: 4, y: 3 }
    // }));



    for(var i = 0; i < 10; i++){
        actors.push(anim.create('Actor', {
            x: 0,
            y: 0,
            width: i * 5 + 10,
            height: i * 5 + 10,
            fillStyle: 'rgba(' + anim.rand(0, 255) + ', ' + anim.rand(0, 255) + ', ' + anim.rand(0, 255) + ', ' + anim.rand(5, 10) / 10 + ')',
            move: {
                x: 1.2,
                y: i * .01 + .1
            }
        }));
    }


    // var loops = 0,
    //     interval = setInterval(function(){
    //         if(loops >= 100){
    //             clearInterval(interval);
    //             return;
    //         }
    //         loops++;
    //         render();
    //     }, 0); 

    render();
});