message = [];
var fs = null;
var isNodejs = false;

if (typeof(require)=="function")
{
	fs = require('fs');
	isNodejs = true;
}


function open(){
	if (isNodejs)
	{
        replay = getUrlParam('replay');
        if (replay == null)
            replay = 'replay.txt';
		var fd = fs.openSync('../../server/'+replay,'r'); 
		return fd;
	}
	else
	{
		initialize();
	}
	return null;
}

function close(fd){
	if (isNodejs)
	{
		fs.closeSync(fd);
	}
}

function readMessage(data){
	var buf_message_lenth = new String(5);
	var message_lenth = 0;
	var message_lenth_offset = 0;
	var position = 0;

	var buff_message = new  String(65535);
	var message_offset = 0;
	
	while (data.length > position)
	{
		if  (message_lenth == 0)
		{
            buf_message_lenth = data.slice(position, position+5);
			message_lenth = parseInt(buf_message_lenth.toString('ascii'),10);
			message_lenth_offset = 0;
			position += 5;
		}
		else
		{
			buff_message = data.slice(position, position+message_lenth);
			message.push(eval("("+buff_message.toString('ascii',0,message_lenth) +")"))
			//console.log( "the " + message.length + " message'length is " + message_lenth);
			position += message_lenth;
			message_lenth = 0;
			message_offset = 0
		}
	}
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]);
    return null; 
}


function initialize() {
    replay = getUrlParam('replay');
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	if (replay != null) {
		xmlhttp.open("GET", "../../game_replay/"+replay+".replay?d="+Math.random(), false);
	} else {
		xmlhttp.open("GET", "replay.txt", false);
	}
	xmlhttp.send();
	readMessage(xmlhttp.responseText);

}


function start(fd){
	if (!isNodejs)
	{
		return;
	}
	var buf_message_lenth = new Buffer(5);
	var message_lenth = 0;
	var message_lenth_offset = 0;
	var position = 0;

	var buff_message = new  Buffer(65535);
	var message_offset = 0;

	var timer = setInterval( function(){
		var stat = fs.fstatSync(fd)
		if (stat.size > position)
		{
			if  (message_lenth == 0)
			{
				var len = fs.readSync(fd, buf_message_lenth, message_lenth_offset, 5 - message_lenth_offset, position);
				message_lenth_offset += len;
				if (message_lenth_offset == 5){
					message_lenth = parseInt(buf_message_lenth.toString('ascii'),10);
					//console.assert(message_lenth == NaN);
					//console.log(buf_message_lenth.toString('ascii'));
					//console.log("message length is " + message_lenth + "  position is " + position);
					message_lenth_offset = 0;
				}
				position += len;
			}
			else
			{
				var len = fs.readSync(fd, buff_message, message_lenth_offset, message_lenth - message_offset, position);
				message_offset += len;
				if (message_offset == message_lenth){
					message.push(eval("("+buff_message.toString('ascii',0,message_lenth) +")"))
					//console.log( "the " + message.length + " message'length is " + message_lenth);
					message_lenth = 0;
					message_offset = 0
				}
				position += len;
			}
		}
	},100);

	return timer;
}

function stop(timer, fd){
	if (!isNodejs)
	{
		return;
	}
	clearInterval(timer)
	close(fd)
}

