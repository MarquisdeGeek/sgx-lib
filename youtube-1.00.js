//
// Youtube video controller
//
// Docs from:  https://developers.google.com/youtube/
// https://developers.google.com/youtube/iframe_api_reference
// (using the iframe guide)
//
var Promise = Promise || Q.promise;
var sgx = sgx || {};
sgx.lib = sgx.lib || {};

sgx.lib.youtube = function() {

	var videoplayer = null;
	var loopStart = null;
	var loopEnd = null;
	var playbackrates = [1];
 
	function initialize(divtag, url) {
		videoplayer = new YT.Player(divtag, {
			videoId: url,
			  events: {
				'onReady': function(e) {
					startVideo();
					playVideo();
					updateState();
				},
				
				'onError': function(e) {
				alert(e);
				}
			}
		});	
	}
	
	function startVideo() {
		// internal prep anything for videoplayer.playVideo();
		loopStart = null;
		loopEnd = null;
		playbackrates = videoplayer.getAvailablePlaybackRates();
	}
		
	function playVideo() {
		if (videoplayer) {
			videoplayer.playVideo();
		}
	}
		
	function pauseVideo() {
		if (videoplayer) {
			videoplayer.pauseVideo();
		}
	}
		
	function togglePlay() {
		if (videoplayer) {
			var state = videoplayer.getPlayerState();
			switch(state) {
				case 0:// end
				videoplayer.seek(0);
				videoplayer.playVideo();
				break;
				
				case 1://playing
				videoplayer.pauseVideo();
				break;
				
				case 2://paused
				videoplayer.playVideo();
				break;
			}
		}
	}
		
	function stopVideo() {
		if (videoplayer) {
			videoplayer.stopVideo();
		}
	}
		
	function startLoopMarker(t) {
		if (videoplayer) {
			loopStart = t ? t : videoplayer.getCurrentTime();
		}
	}
		
	function endLoopMarker(t) {
		if (videoplayer) {
			loopEnd = t ? t : videoplayer.getCurrentTime();
		}
	}
		
	function setPlaybackRate(f) {
		if (videoplayer) {
			// Find closest rate, to what's supported
			var closestRate = 1;
			var closestDelta = 1;
			var delta;
			for(var i=0;i<playbackrates.length;++i) {
				delta = Math.abs(playbackrates[i] - f);
				if (delta < closestDelta) {
					closestDelta = delta;
					closestRate = playbackrates[i];
				}
			}
			
			videoplayer.setPlaybackRate(closestRate);
		}
	}
	
	function clearLoopMarker() {
		loopStart = loopEnd = null;
	}

	
	function stepBack() {
		if (videoplayer) {
			var frame = 1/24;
			seekTo(getCurrentTime() - frame);
		}
	}
	
	function stepForward() {
		if (videoplayer) {
			var frame = 1/24;
			seekTo(getCurrentTime() + frame);
		}
	}
	
	function seekTo(t) {
		if (videoplayer) {
			videoplayer.seekTo(t);
		}
	}
	
	function getPlaybackRates(t) {
		if (videoplayer) {
			return videoplayer.getAvailablePlaybackRates();
		}
		return [ 0.1, 0.2, 1, 2];
	}
		
	function getCurrentTime() {
		if (videoplayer && videoplayer.getCurrentTime) {
			return videoplayer.getCurrentTime();
		}
		return 0;
	}
	
	function update() {
		setTimeout(update, 1);
		
		if (!videoplayer || !videoplayer.getCurrentTime) {
			return;
		}
		
		var t = videoplayer.getCurrentTime();
		if (loopEnd && t > loopEnd) {
			seekTo(loopStart);
		}
	}
	
	
	setTimeout(update, 1);
	
	return {
		init: function(divtag, url)  { return initialize(divtag, url); },
		start: function()      { return startVideo(); },
		play:  function()      { return playVideo(); },
		pause: function()      { return pauseVideo(); },
		stop: function()       { return stopVideo(); },
		togglePlay: function() { return togglePlay(); },

		stepBack: function()   { return stepBack(); },
		stepForward: function(){ return stepForward(); },
		
		loopStart: function(t) { return startLoopMarker(t); },
		loopEnd:   function(t) { return endLoopMarker(t); },
		loopClear: function()  { return clearLoopMarker(); },
		getPlaybackTime: function(){ return getCurrentTime(); },
		setPlaybackRate: function(f) { setPlaybackRate(f); },
		getPlaybackRates: function(f) { return getPlaybackRates(); },
		
		getLoopState: function(){ return { start: loopStart, end: loopEnd }; }
	};

 };
 