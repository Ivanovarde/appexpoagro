/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	 // Application Constructor
	 initialize: function() {
		  document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

		  // Detecto si estoy online o offline
		  document.addEventListener("offline", estoyConectado , false);
		  document.addEventListener("online", estoyConectado , false);
	 },

	 // deviceready Event Handler
	 //
	 // Bind any cordova events here. Common events are:
	 // 'pause', 'resume', etc.
	 onDeviceReady: function() {
		  this.receivedEvent('deviceready');
	 },

	 // Update DOM on a Received Event
	 receivedEvent: function(id) {
/*
		  var parentElement = document.getElementById(id);
		  var listeningElement = parentElement.querySelector('.listening');
		  var receivedElement = parentElement.querySelector('.received');

		  listeningElement.setAttribute('style', 'display:none;');
		  receivedElement.setAttribute('style', 'display:block;');

		  console.log('Received Event: ' + id);
*/
	 }
};

app.initialize();

// Declaro las variables globales
//var url_accesso = "http://expoagro.neomedia.com.ar/expoagro";
var url_accesso = "http://planahorromb.neomedia.com.ar/cms";
var isConnected = false;


function estoyConectado(){
	 var networkState = navigator.connection.type;

	 var states = {};
	 states[Connection.UNKNOWN]  = 'Unknown connection';
	 states[Connection.ETHERNET] = 'Ethernet connection';
	 states[Connection.WIFI]     = 'WiFi connection';
	 states[Connection.CELL_2G]  = 'Cell 2G connection';
	 states[Connection.CELL_3G]  = 'Cell 3G connection';
	 states[Connection.CELL_4G]  = 'Cell 4G connection';
	 states[Connection.NONE]     = 'No network connection';

	 if(networkState == Connection.NONE){
		  isConnected = false;
	 }else{
		  isConnected = true;
	 }
}
