var Promise = Promise || Q.promise;
var sgx = sgx || {};
sgx.lib = sgx.lib || {};

sgx.lib.pusher = function(settings) {

	var clientUnique = function (){
			// TODO: get a truly unique hash for this browser
			// e.g. http://browserspy.dk/
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c=='x' ? r : (r&0x3|0x8)).toString(16);
			});
			return uuid;
		}();
	var settings;
	var pusher;
	var channel;
	var cbOnMessage;

	init(settings);
	
	function init(pusherSettings) {
		settings = pusherSettings;

		pusher = new Pusher(settings.key);

		Pusher.log = function(message) {
			// if (window.console && window.console.log) window.console.log(message);
		};
	}
	
	function connect() {
		//return new Promise(function (fulfill, reject){
	
		channel = pusher.subscribe(settings.channel);
	
		channel.bind('spe', function(data) {
			var messageObject = JSON.parse(data['message']);
			var messageSender = data['sender'];
			
			if (messageSender !== clientUnique) {
				if (cbOnMessage) {
					cbOnMessage(messageSender, messageObject);
				}
			}
		});
		
		// Q. TODO: send promise, and pickup 'on connected' event, or whatever it is?
	}
	
	function sendData(obj) {

		return new Promise(function (fulfill, reject){
			try {			
				$.ajax({
					type: "POST",
					url: settings.url,
					data : { sender: clientUnique, message : JSON.stringify(obj) },
					success: function(data, result, xhr) {
						if (result === 'success') {
							var r = data;
							try {
								r = JSON.parse(data);
							} catch (e) {
								// nop
							}
							fulfill(r);
						} else {
							reject(result);
						}
					},
					dataType: 'html'
				});
				
			} catch (ex) {
				reject(ex);
			}
		  
		});
	}
	
	return {
		connect: function() { connect(); },
		send: function(obj)     { return sendData(obj); },
		setMessageHandler: function(fn)     { cbOnMessage = fn; },
	}
	
}


sgx.lib.pusherSettings = function(key, url, channel) {
	this.key = key;
	this.url = url;
	this.channel = channel;
};
