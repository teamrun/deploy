var fs = require('fs');
var path = require('path');

var util = {
    getCmdParam: function(){
        var param = {};
        process.argv.forEach(function(arg, i){
            // 不去处理cmd和file
            if( i>1 ){
                // 去掉前两个--
                var argContent = arg.substr(2);
                var arr = argContent.split('=');
                // 处理 --key=value 和 --key=
                if(arr.length > 1){
                    param[arr[0]] = arr[1]
                }
                // 处理 --hasProp
                else{
                    param[arr[0]] = true;
                }
            }
        })
        return param;
    },
    shallowExtend: function(){
        var args = Array.prototype.slice.call(arguments);
        var result = {};
        args.forEach(function(obj, index){
            for(var key in obj){
                result[key] = obj[key];
            }
        });
        return result;
    },
    // e 暂不支持coffee
    requireIfExits: function(absPath){
        var extname = path.extname(absPath);
        absPath = ( extname == '.js')? absPath : absPath + '.js';
        // console.log(absPath);
        var exists = fs.existsSync(absPath);
        if(!exists){
            return {
                exists: false
            };
        }
        else{
            var m = require(absPath);
            return {
                exists: true,
                m: m
            };
        }
    }
};


String.prototype.startWith = function(substr){
    return this.indexOf(substr) === 0;
}


// console.log( util.getCmdParam() );



module.exports = util;