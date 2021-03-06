/*
* The MIT License (MIT)
* 
* Copyright (c) 2014 Richard Backhouse
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/
define([
		'jquery', 
		'backbone',
		'underscore', 
		'./BaseView',
		'../models/SongSearchList',
		'../uiconfig',
		'../mpd/MPDClient',
		'text!templates/SongSearch.html'], 
function($, Backbone, _, BaseView, SongSearchList, config, MPDClient, template){
	var View = BaseView.extend({
		events: function() {
		    return _.extend({}, BaseView.prototype.events, {
				"click #openType" : function() {
					$("#"+this.searchType).prop( "checked", true ).checkboxradio( "refresh" );
					$( "#searchType" ).popup("open", {transition: "flow"}).trigger("create");
				},
				"change input[name='searchType']" : function(event) {
					this.searchType = event.target.id;
				},
				"click #songSearchList li" : function(evt) {
					var id = evt.target.id;
					if (id === "") {
						id = evt.target.parentNode.id;
					}
					if (id !== "") {
						var song = id.substring(5);
						$.mobile.loading("show", { textVisible: false });
						if (config.isDirect()) {
							MPDClient.addSongToPlayList(decodeURIComponent(atob(song)), function() {
								$.mobile.loading("hide");
							});
						} else {
							$.ajax({
								url: config.getBaseUrl()+"/music/playlist/song/"+song,
								type: "PUT",
								contentTypeString: "application/x-www-form-urlencoded; charset=utf-8",
								dataType: "text",
								success: function(data, textStatus, jqXHR) {
									$.mobile.loading("hide");
								},
								error: function(jqXHR, textStatus, errorThrown) {
									$.mobile.loading("hide");
									console.log("addsong failed :"+errorThrown);
								}
							});
						}
					}					
				}				
		    });	
		},
		initialize: function(options) {
			this.songSearchList = new SongSearchList({});
			this.searchType = "title";
			options.header = {
				title: "Song Search",
				backLink: false
			};
			this.constructor.__super__.initialize.apply(this, [options]);
			this.template = _.template( template) ( {total: 0} );
			$.mobile.document.one("filterablecreate", "#songSearchList", function() {
				$("#songSearchList").on( "filterablebeforefilter", function(e, data) { 
					e.preventDefault();
		            var $input = $( data.input );
		            var value = $input.val();
		            if (value && value.length > 2) {
						this.songSearchList.searchValue = value;
						this.songSearchList.searchType = this.searchType;
			            this.load();
		            } else {
						this.songSearchList.searchValue = undefined;
						$("#songSearchList li").remove();
						$("#songSearchList").listview('refresh');
						$("#total").text("0");
		            }
				}.bind(this));
				$("#songSearchList").filterable("option", "filterCallback", function( index, searchValue ) {
		            return false;
				});
				$("#songsearchFilterForm").submit( function( evt ) {
					evt.preventDefault();
					$("#songsearchFilter").blur();
				});
			}.bind(this));
		},
		render: function(){
			$(this.el).html( this.headerTemplate + this.template + this.footerTemplate + this.menuTemplate + this.playingTemplate );
		},
		load: function() {
			$.mobile.loading("show", { textVisible: false });
			this.songSearchList.fetch({
				success: function(collection, response, options) {
					$.mobile.loading("hide");
					$("#songSearchList li").remove();
					collection.each(function(song) {
						if (config.isSongToPlaylist()) {
							$("#songSearchList").append("<li data-icon=\"plus\"><a href='#playlist/song/"+song.get("b64file")+"'><p style=\"white-space:normal\">"+song.get("title")+" : " + song.get("artist") + " : "+song.get("album")+"</p></a></li>");
						} else {
							$("#songSearchList").append("<li data-icon=\"plus\"><a id='song_"+song.get("b64file")+"'><p style=\"white-space:normal\">"+song.get("title")+" : " + song.get("artist") + " : "+song.get("album")+"</p></a></li>");
						}	
					});
					$("#songSearchList").listview('refresh');
					$("#total").text(collection.length);
				}.bind(this),
				error: function(collection, xhr, options) {
					$.mobile.loading("hide");
					console.log("search song failed :"+xhr.status);
				}
			});
		}
	});
	
	return View;
});
