define([
		'jquery', 
		'backbone',
		'underscore',
		'models/PlayList',
		'jquerymobile',
		'text!templates/PlayList.html'], 
function($, Backbone, _, PlayList, mobile, template){
	var View = Backbone.View.extend({
		events: {
			"click #previous" : function() {
				this.sendControlCmd("previous");
			},
			"click #next" : function() {
				this.sendControlCmd("next");
			},
			"click #playPause" : function() {
				if (this.state === "play") {
					this.sendControlCmd("pause");
				} else {
					this.sendControlCmd("play");
				}
			},
			"click #stop" : function() {
				this.sendControlCmd("stop");
			},
			"click #editButton" : "editPlayList",
			"click #randomButton" : "randomPlayList",
			"click #clearButton" : "clearPlayList",
			"click #playingList li" : "removeSong",
			"change #volume" : "changeVolume"
		},
		initialize: function(options) {
			this.playlist = options.playlist;
			this.template = _.template( template, { playlist: options.playlist.toJSON() } );
        	$.ajax({
        		url: "./music/status",
        		type: "GET",
	        	contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
	        	dataType: "text",
	        	success: function(data, textStatus, jqXHR) {
		        	this.showStatus(data, true);
	        	}.bind(this),
	        	error: function(jqXHR, textStatus, errorThrown) {
					console.log("status error : "+textStatus);
	        	}
        	});
		},
		render: function(){
			$(this.el).html( this.template );
		},
		editPlayList: function() {
			$("#playingList li").remove();
			if (this.editing) {
				this.editing = undefined;
				$("#editButton .ui-btn-text").html("Edit");
				this.playlist.each(function(song) {
					$("#playingList").append('<li>'+song.get("artist")+' : '+song.get("title")+'</li>');	
				});
			} else {
				this.editing = true;
				$("#editButton .ui-btn-text").html("Done");
				this.playlist.each(function(song) {
					//$("#playingList").append('<li id="'+song.get("id")+'"><img src="images/minus.png" alt="Delete" class="ui-li-icon">'+song.get("artist")+' : '+song.get("title")+'</li>');	
					$("#playingList").append('<li data-icon="minusIcon"><a href="#playlist" id="'+song.get("id")+'">'+song.get("artist")+' : '+song.get("title")+'</a></li>');	
					//$("#playingList").append('<li><a href="#playlist" id="'+song.get("id")+'"><img src="images/minus.png" alt="Delete" class="ui-li-icon">'+song.get("artist")+' : '+song.get("title")+'</a></li>');	
				});
			}
			$("#playingList").listview('refresh');
		},
		randomPlayList: function() {
        	$.ajax({
        		url: "./music/playlist/random",
        		type: "PUT",
				headers: { "cache-control": "no-cache" },
	        	contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
	        	dataType: "text",
	        	success: function(data, textStatus, jqXHR) {
		        	this.showStatus(data, true);
		        	this.fetchPlayList();
	        	}.bind(this),
	        	error: function(jqXHR, textStatus, errorThrown) {
					console.log("random playlist error : "+textStatus);
	        	}
        	});
		},
		clearPlayList: function() {
        	$.ajax({
        		url: "./music/playlist",
        		type: "DELETE",
				headers: { "cache-control": "no-cache" },
	        	contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
	        	dataType: "text",
	        	success: function(data, textStatus, jqXHR) {
		        	this.showStatus(data, true);
		        	this.fetchPlayList();
	        	}.bind(this),
	        	error: function(jqXHR, textStatus, errorThrown) {
					console.log("clear playlist error : "+textStatus);
	        	}
        	});
		},
		removeSong: function(evt) {
			if (this.editing) {			
				$.ajax({
					url: "./music/playlist/"+evt.target.id,
					type: "DELETE",
					headers: { "cache-control": "no-cache" },
					contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
					dataType: "text",
					success: function(data, textStatus, jqXHR) {
		        		this.showStatus(data, true);
						this.fetchPlayList();
					}.bind(this),
					error: function(jqXHR, textStatus, errorThrown) {
						console.log("remove song error : "+textStatus);
					}
				});
			}
		},
		fetchPlayList: function() {
			this.playlist.fetch({
				success: function(collection, response, options) {
					this.playlist.reset(collection.toJSON());
					$("#playingList li").remove();
					this.playlist.each(function(song) {
						if (this.editing) {
							//$("#playingList").append('<li id="'+song.get("id")+'"><img src="images/minus.png" alt="Delete" class="ui-li-icon">'+song.get("artist")+' : '+song.get("title")+'</li>');	
							$("#playingList").append('<li data-icon="minusIcon"><a href="#playlist" id="'+song.get("id")+'">'+song.get("artist")+' : '+song.get("title")+'</a></li>');	
							//$("#playingList").append('<li><a href="#playlist" id="'+song.get("id")+'"><img src="images/minus.png" alt="Delete" class="ui-li-icon">'+song.get("artist")+' : '+song.get("title")+'</a></li>');	
						} else {
							$("#playingList").append('<li>'+song.get("artist")+' : '+song.get("title")+'</li>');	
						}
					}.bind(this));
					$("#playingList").listview('refresh');
				}.bind(this),
				error: function(jqXHR, textStatus, errorThrown) {
					console.log("fetch playlist error : "+textStatus);
				}
			});
		},
		changeVolume: function() {
        	$.ajax({
        		url: "./music/volume/"+$("#volume").val(),
        		type: "POST",
				headers: { "cache-control": "no-cache" },
	        	contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
	        	dataType: "text",
	        	success: function(data, textStatus, jqXHR) {
	        		this.showStatus(data);
	        	}.bind(this),
	        	error: function(jqXHR, textStatus, errorThrown) {
	        		console.log("change volume error: "+textStatus);
	        	}
        	});
		},
		sendControlCmd: function(type) {
        	console.log("type = "+type);
        	$.ajax({
        		url: "./music/"+type,
        		type: "POST",
				headers: { "cache-control": "no-cache" },
	        	contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
	        	dataType: "text",
	        	success: function(data, textStatus, jqXHR) {
	        		this.showStatus(data, true);
	        	}.bind(this),
	        	error: function(jqXHR, textStatus, errorThrown) {
	        		console.log("control cmd error: "+textStatus);
	        	}
        	});
		},
		showStatus: function(data, refreshVolume) {
			var status = JSON.parse(data);
			this.state = status.state;
			console.log("state:"+status.state);
			if (status.state === "play") {
				//$("#playPause .ui-btn-text").html("Pause");
				$("#playPause").buttonMarkup({icon : "pauseIcon" });
			} else {
				//$("#playPause .ui-btn-text").html("Play");
				$("#playPause").buttonMarkup({icon : "playIcon" });
			}
			if (refreshVolume) {
			var volume = parseInt(status.volume);
				if (volume > -1) {
					$("#volume").val(status.volume);
				} else {
					$("#volume").val("0");
				}
				$("#volume").slider('refresh');
			}
			if (status.currentsong && status.state === "play") {
				$("#currentlyPlaying").text("Playing ["+status.currentsong+"]");
			} else {
				$("#currentlyPlaying").text("Playing []");
			}
		}
	});
	
	return View;
});
