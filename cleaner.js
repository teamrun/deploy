// used for move extra folders from ./current to ./backup
// and keep ./backup not so many sub folders

var fs = require('fs');
var path = require('path');

var fse = require('fs-extra');
var EP = require('eventproxy');

var util = require('./util');

var param = util.getCmdParam();
var appFolder = {
    current: path.resolve(param.appPath, 'current'),
    backup: path.resolve(param.appPath, 'backup')
}

var CURRENT_REMAIN = 3;
var BACKUP_REMAIN = 5;

function getChildrenByOrder(parent, order){
    // 文件夹也是file
    var folders = fs.readdirSync(parent);
    if(folders){
        // 过滤掉.开头的隐藏文件夹
        var folders = folders.filter(function(f){
            return !f.startWith('.');
        });
        folders = folders.map(function(f){
            return path.join(parent, f);
        });
        // 字母排序
        folders.sort();
        if( order == 'desc' ){
            folders.reverse();
        }
        return folders;
    }
    else{
        return false;
    }
}

function moveToBackup(folder, remainCount, dest, callback){
    // console.log(arguments)
    var needToMove = folder.splice(remainCount);
    var ep = new EP();
    ep.after('move', needToMove.length, function(){
        callback();
    });
    needToMove.forEach( function(f){
        fse.move(f, path.join(dest, path.basename(f)), {clobber: true},function(err){
            // console.log(err);
            ep.emit('move');
        });
    } );
}

function removeSpareFolder(folders, remainCount){
    var needRemove = folders.splice(remainCount);
    try{
        needRemove.forEach(function(f){
            fse.removeSync(f);
        });
        return true;
    }
    catch(e){
        console.log(e);
        return false;
    }
}


// 程序逻辑
// 读current, 只保留N个 其余的转移到backup中
// 读backup, 只保留N个, 其余删除

var folderInCurrent = getChildrenByOrder( appFolder.current, 'desc');

moveToBackup(folderInCurrent, CURRENT_REMAIN, appFolder.backup, function(){
    console.log('move to backup done...');

    var folderInBackup = getChildrenByOrder( appFolder.backup, 'desc');
    var res = removeSpareFolder(folderInBackup, BACKUP_REMAIN);
    if( !res ){
        process.exit(101);
    }
    else{
        console.log('done~~');
    }
});