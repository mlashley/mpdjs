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
		'../routers/routes',
		'../mpd/MPDClient',
		'text!templates/Menu.html',
		'text!templates/Header.html'
		], 
function($, Backbone, _, routes, MPDClient, menuTemplate, headerTemplate){
	var View = Backbone.View.extend({
		events: {
			"click #menu" : function() {
				$( "#menuPanel" ).panel().panel( "open" );
			},
			"click #back" : function() {
				window.history.back();
			}
		},
		initialize: function(options) {
			this.headerTemplate = _.template( headerTemplate ) ( {header: options.header } );
			this.menuTemplate = _.template( menuTemplate) ( {menuItems: routes.getMenuItems()} );
		},
		updateMenu: function() {
			$("#mpdjsmenu li").remove();
			if (window.cordova && MPDClient.isConnected() == false) {
				$("#mpdjsmenu").append('<li><a href="#'+routes.getConnectionsMenuItem().href+'">'+routes.getConnectionsMenuItem().label+'</a></li>');
			} else {
				routes.getMenuItems().forEach(function(menuItem) {
					$("#mpdjsmenu").append('<li><a href="#'+menuItem.href+'">'+menuItem.label+'</a></li>');
				});
			}
			$("#mpdjsmenu").listview('refresh');
		}
	});
	
	return View;
});
