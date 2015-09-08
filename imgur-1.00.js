var sgx = sgx || {};
sgx.lib = sgx.lib || {};

sgx.lib.imgur = function(authorizationKey) {
	var auth = authorizationKey;

	function imgurUpload(placeholderURL, fromCanvas, cbfn) {
	   var canvas = document.getElementById(fromCanvas);
	   imgurUploadCanvas(placeholderURL, canvas, cbfn);
	 }

	function imgurUploadCanvas(placeholderURL, canvas, cbfn) {

		var win = placeholderURL ? window.open(placeholderURL,'_blank') : null;

		try {
			var img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
		} catch(e) {
			var img = canvas.toDataURL().split(',')[1];
		}

		$.ajax({
			url: 'https://api.imgur.com/3/image',
			type: 'post',
			headers: {
				Authorization: auth
			},
			data: {
				type: 'base64',
				name: 'canvas.jpg',
				title: 'Image',
				description: 'From the imgur uploader code, written by the Marquis de Geek!',
				image: img
			},
			dataType: 'json',
			success: function(response) {
				if(response.success) {
					var url = response.data.link;

					if (win) {
						win.location.replace(url);
					}
					
					if (cbfn) {
						cbfn(url);
					}
				} else {
					alert("Sorry - I could not upload the image");
				}
			}
		});

	}

	
	return {
		uploadElement : function(placeholderURL, fromCanvas, cbfn) { return imgurUpload(placeholderURL, fromCanvas, cbfn); },
		uploadCanvas : function(placeholderURL, canvas, cbfn) { return imgurUploadCanvas(placeholderURL, canvas, cbfn); }
	};
}
