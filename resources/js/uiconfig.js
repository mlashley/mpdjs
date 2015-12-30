define(function() {
	var connections = [];
	var randomPlaylistConfig = {};
	var selectedIndex = 0;
	var isDirect = false;
	if (window.cordova) {
		var connectionsStr = localStorage["mpdjs.connections"];
		if (connectionsStr) {
			var connectionsData = JSON.parse(connectionsStr);
			connections = connectionsData.connections;
			connections.forEach(function(connection) {
				if (!connection.streamingport) {
					connection.streamingport = "";
				}
			});
			selectedIndex = connectionsData.selectedIndex;
		}
		isDirect = true;
	} else {
		connections[0] = {
			host: ".",
			port: "0"
		}
	}
	var randomPlaylistConfigStr = localStorage["mpdjs.randomPlaylistConfig"];
	if (randomPlaylistConfigStr) {
		randomPlaylistConfig = JSON.parse(randomPlaylistConfigStr);
	} else {
		randomPlaylistConfig = {
			enabled: false,
			type: "",
			typevalue: ""
		};
	}

	return {
		getBaseUrl: function() {
			if (connections[0].host === ".") {
				return ".";
			} else {
				return "http://"+connections[0].host +":"+connections[0].port;
			}
		},
		getWSUrl: function() {
			if (connections[0].host === ".") {
				return 'ws://' + window.location.host;
			} else {
				return 'ws://'+connections[0].host +":"+connections[0].port;
			}
		},
		getConnection: function() {
			return connections[selectedIndex];
		},
		promptForConnection: function() {
			return window.cordova && connections.length === 0 ? true : false;
		},
		isDirect: function() {
			return isDirect;
		},
		getConnections: function() {
			return connections;
		},
		addConnection: function(host, port, streamingport) {
			var connection = {
				host: host,
				port: port,
				streamingport: streamingport
			}
			var index = connections.push(connection) - 1;
			var connectionsStr = JSON.stringify({ connections: connections, selectedIndex: selectedIndex });
			localStorage["mpdjs.connections"] = connectionsStr;
			return index;
		},
		removeConnection: function(index) {
			connections.splice(index, 1);
			if (index === selectedIndex) {
				selectedIndex = 0;
			}
			var connectionsStr = JSON.stringify({ connections: connections, selectedIndex: selectedIndex });
			localStorage["mpdjs.connections"] = connectionsStr;
		},
		getSelectedIndex: function() {
			return selectedIndex;
		},
		setSelectedIndex: function(index) {
			selectedIndex = index;
			var connectionsStr = JSON.stringify({ connections: connections, selectedIndex: selectedIndex });
			localStorage["mpdjs.connections"] = connectionsStr;
		},
		getRandomPlaylistConfig: function() {
			return randomPlaylistConfig;
		},
		setRandomPlaylistConfig: function(newRandomPlaylistConfig) {
			randomPlaylistConfig = newRandomPlaylistConfig;
			var randomPlaylistConfigStr = JSON.stringify(newRandomPlaylistConfig);
			localStorage["mpdjs.randomPlaylistConfig"] = randomPlaylistConfigStr;
		},
		getStartPage: function() {
			var startPage = localStorage["mpdjs.startPage"];
			if (!startPage) {
				if (window.cordova) {
					startPage = "connections";
				} else {
					startPage = "playlist";
				}
				this.setStartPage(startPage);
			}
			return startPage;
		},
		setStartPage: function(startPage) {
			localStorage["mpdjs.startPage"] = startPage;
		},
		getVersionNumber: function() {
			return "1.8";
		},
		setSongToPlaylist: function(songToPlaylist) {
			localStorage["mpdjs.songToPlaylist"] = songToPlaylist;
		},
		isSongToPlaylist: function() {
			var songToPlaylist = localStorage["mpdjs.songToPlaylist"];
			if (!songToPlaylist) {
				songToPlaylist = "true";
				this.setSongToPlaylist(songToPlaylist);
			}
			return songToPlaylist === "true" ? true : false;
		}
	}
});