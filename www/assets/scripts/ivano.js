
$(window).bind('load', function(){

	$('#preloader').addClass('off');
	window.setTimeout(function(){
		$('#preloader').remove();
	}, 1500);

	 //Verifico si existe la URL de acceso al BackOffice
	 var url_backoffice = window.localStorage.getItem("url_backoffice");

	 // Si hay datos localmente
	 if(url_backoffice != null){
		var url_accesso = url_backoffice;
	}else{ // Si no existe, preseteo uno
		//var url_accesso = "http://expoagro.neomedia.com.ar/expoagro";
		var url_accesso = "http://planahorromb.neomedia.com.ar/cms";
	}

	// Analizo los parametros del Cotizador
	if(window.location.pathname.search("/cotizacion.html") != -1){

		mostrarDatosCotizacion('cotizador');

		// Actulizacion de las imagenes del Pie
		$("#cotizador_img1_cotizador").attr("src","images/vehicles/450x270-"+getParameters("obj")+"1.jpg");
		$("#cotizador_img2_cotizador").attr("src","images/vehicles/450x270-"+getParameters("obj")+"2.jpg");
	}

	// Analizo los parametros del Formulario de Cotizador
	if(window.location.pathname.search("/formulario.html") != -1){
		mostrarDatosCotizacion('form');

		// Si es el caso de Plan 84, agrego un clase para ocultar encabezado
		if(getParameters("obj") == "pickup"){
			$("#encabezado_formulario").addClass( "no-info" );

		}else{ // Saco la clase no-info
			$("#encabezado_formulario").removeClass( "no-info" );
		}

	}

});

$(window).on('scroll', function(e){

});

jQuery(document).ready(function() {

	actualizarContadorContactosPendientes();


	// ============================================ SET URL BACKOFFICE ======================================================

	$( "#btn_backoffice" ).click(function() {


		var url_ingresada = prompt("Ingrese la URL del BackOffice", url_accesso);

		if (url_ingresada != null) {

			// Guardo los datos
			window.localStorage.setItem("url_backoffice", url_ingresada);
			url_accesso = url_ingresada;
		}

	});

	// ======================================= SINCRONIZAR CONTACTOS ======================================================

	$( "#btn_contactos_pendientes" ).click(function() {

		var contadorAux = 0;

		 //Si tengo datos guardados localmente, los consulto directamente desde ahi
		 var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

		 // Si no estoy conectado a Internet, cancelo
		 if(isConnected){

			 // Si hay datos localmente
			 if(datos_guardados != null && datos_guardados.length != 0){
				contadorAux = datos_guardados.length;

				if (confirm('¿Desea sincronizar los contactos locales?')) {
					sincronizarContactosPendientes();
				}
			 }else{
				 alert('No hay contactos para sincronizar.')
			 }
		 }else{
			 alert('No se puede iniciar la sincronización porque no hay conexión a Internet.')
		 }

	});


	// ======================================== ENVIAR_COTIZACION_FINAL ====================================================

	$( "#btn_enviar_cotizacion_final" ).click(function() {
		event.preventDefault();

		// Valido que el formulario no este vacio
		if($("#nombre").val() != "" && $("#apellido").val() != "" && $("#email").val() != "" && $("#telefono").val() != "" && $("#provincia").val() != "" && $("#ciudad").val() != ""){

			// Cargo Loading...
			$( "#btn_enviar_cotizacion_final" ).html("Enviando...");

			var arrayGeneral =  [];
			arrayGeneral = eval('array'+getParameters("obj"));

			var Registro =  [];
			Registro = jQuery.grep(arrayGeneral[getParameters("linea")], function( n, i ) {
				return n["modelo"] == unescape(getParameters("modelo")) && n["plan"] == unescape(getParameters("plan"));
			});

			var RegistroGuardar = new Array();

			// Obtengo los datos de la cotización
			RegistroGuardar["0"] = getParameters("cuotas");
			RegistroGuardar["1"] = Registro[0]["cuotaMensual"].replace(/,/g, "|");
			RegistroGuardar["2"] = Registro[0]["precioPublico"].replace(/,/g, "|");
			RegistroGuardar["3"] = Registro[0]["plan"];
			RegistroGuardar["4"] = Registro[0]["cuotaPura"].replace(/,/g, "|");
			RegistroGuardar["5"] = Registro[0]["cargaAdminSuscripcion"].replace(/,/g, "|");
			RegistroGuardar["6"] = Registro[0]["iva21"].replace(/,/g, "|");
			RegistroGuardar["7"] = Registro[0]["pagoAdjudicacion30"].replace(/,/g, "|");
			RegistroGuardar["8"] = Registro[0]["modelo"];
			RegistroGuardar["9"] = Registro[0]["plan"];
			RegistroGuardar["16"] = getParameters("linea");
			RegistroGuardar["17"] = getParameters("obj");

			// Obtengo los datos del Formulario
			RegistroGuardar["10"] = $("#nombre").val();
			RegistroGuardar["11"] = $("#apellido").val();
			RegistroGuardar["12"] = $("#email").val();
			RegistroGuardar["13"] = $("#telefono").val();
			RegistroGuardar["14"] = $("#provincia").val();
			RegistroGuardar["15"] = $("#ciudad").val();


			 // Si estoy conectado a Internet, guardo los datos en BD
			 if(isConnected){

					// Si falla el envio, lo guardo localmente
				enviarRegistro(RegistroGuardar)
					.fail(function(result,RegistroGuardar) {
						guardarDatosLocalmente(RegistroGuardar);

						// Saco Loading...
						$( "#btn_enviar_cotizacion_final" ).html("Enviar cotización");


					}).done(function(result,RegistroGuardar) {

						// Saco Loading...
						$( "#btn_enviar_cotizacion_final" ).html("Enviar cotización");
					});


			 }else{ // Si no estoy conectado a Internet, guardo los datos localmente para sync posteriormente

				guardarDatosLocalmente(RegistroGuardar);
			 }

		}else{
			alert('Se debe completar el formulario antes de enviarlo...');
		}


	});

	// ============================================ ENVIAR_COTIZACION ======================================================

	$( "#btn_enviar_cotizacion" ).click(function() {

		var arrayGeneral =  [];
		arrayGeneral = eval('array'+getParameters("obj"));

		var Registro =  [];
		Registro = jQuery.grep(arrayGeneral[getParameters("linea")], function( n, i ) {
			return n["modelo"] == unescape(getParameters("modelo")) && n["plan"] == unescape(getParameters("plan"));
		});


		var linea = getParameters("linea");
		var modelo = Registro[0]["modelo"];
		var plan = Registro[0]["plan"];
		var cuotas = Registro[0]["cuotas"];


		// Armo la URL del Formulario Cotizador
		var urlParameter = '';

		if(linea != '' && modelo != '' && plan != '' && cuotas != ''){
			urlParameter = 'obj='+escape(getParameters("obj"))+'&linea='+escape(linea)+'&modelo='+escape(modelo)+'&plan='+escape(plan)+'&cuotas='+escape(cuotas);

			window.location.href = "formulario.html?"+urlParameter;
		}else{
			alert('Faltan elegir opciones para la cotización');
		}

	});

	// ============================================ BUSES ======================================================

	$('#bus_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'bus');
	});

	$('#bus_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes( $('#bus_linea').val(),$(this).val(), 'bus');
	});

	$('#bus_plan').on('changed.bs.select', function (e) {
		actualizarCuotas( $('#bus_linea').val(), $('#bus_modelos').val(), $(this).val(), 'bus');
	});

	// ============================================ CAMIONES ======================================================

	$('#camiones_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'camiones');
	});

	$('#camiones_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes( $('#camiones_linea').val(),$(this).val(), 'camiones');
	});

	$('#camiones_plan').on('changed.bs.select', function (e) {
		actualizarCuotas( $('#camiones_linea').val(), $('#camiones_modelos').val(), $(this).val(), 'camiones');
	});

	// ============================================ VANS ======================================================

	$('#vans_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'vans');
	});

	$('#vans_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes( $('#vans_linea').val(),$(this).val(), 'vans');
	});

	$('#vans_plan').on('changed.bs.select', function (e) {
		actualizarCuotas( $('#vans_linea').val(), $('#vans_modelos').val(), $(this).val(), 'vans');
	});

	// ============================================ PICKUP ======================================================

	$('#pickup_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'pickup');
	});

	$('#pickup_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes( $('#pickup_linea').val(),$(this).val(), 'pickup');
	});

	$('#pickup_plan').on('changed.bs.select', function (e) {
		actualizarCuotas( $('#pickup_linea').val(), $('#pickup_modelos').val(), $(this).val(), 'pickup');
	});

	// ============================================ SMART ======================================================

	//$('#smart_linea').on('changed.bs.select', function (e) {
	//	actualizarModelos($(this).val(), 'smart');
	//});

	//$('#smart_modelos').on('changed.bs.select', function (e) {
	//	actualizarPlanes( $('#smart_linea').val(),$(this).val(), 'smart');
	//});

	//$('#smart_plan').on('changed.bs.select', function (e) {
	//	actualizarCuotas( $('#smart_linea').val(), $('#smart_modelos').val(), $(this).val(), 'smart');
	//});
});


// VARIABLES

// PICKUP

var arraypickup =  [];
arraypickup[1] = [];
arraypickup[1][0] = [];

arraypickup[1][0] = cargarMatriz("84","Pickup","Plan","0.00","0.00","0.00","0.00","0.00","0.00","0.00","0.00","0.00","0.00","84 meses");


// SMART

//var arraysmart =  [];
//arraysmart[1] = [];
//arraysmart[1][0] = [];
//arraysmart[1][1] = [];
//arraysmart[1][2] = [];
//arraysmart[1][3] = [];
//arraysmart[1][4] = [];
//arraysmart[1][5] = [];
//
//// Cargo el arreglo
//arraysmart[1][0] = cargarMatriz("72","smart","smart forfour passion automatico","450,075.00","315,052.50","6,301.05","1,323.22","7,624.27","4,375.73","525.09","110.27","5,011.09","135,022.50","Plan 70/30");
//arraysmart[1][1] = cargarMatriz("72","smart","smart fortwo play","494,200.00","345,940.00","6,918.80","1,452.95","8,371.75","4,804.72","576.57","121.08","5,502.37","148,260.00","Plan 70/30");
//arraysmart[1][2] = cargarMatriz("72","smart","smart forfour play","503,025.00","352,117.50","7,042.35","1,478.89","8,521.24","4,890.52","586.86","123.24","5,600.62","150,907.50","Plan 70/30");
//arraysmart[1][3] = cargarMatriz("72","smart","smart forfour passion automatico","448290","448290","8965.8","1882.818","10848.618","6226.25","747.15","156.9015","7130.3015","","Plan 100%");
//arraysmart[1][4] = cargarMatriz("72","smart","smart fortwo play","492240","492240","9844.8","2067.408","11912.208","6836.666667","820.4","172.284","7829.350667","", "Plan 100%");
//arraysmart[1][5] = cargarMatriz("72","smart","smart forfour play","501030","501030","10020.6","2104.326","12124.926","6958.75","835.05","175.3605","7969.1605","", "Plan 100%");


// BUSES

var arraybus =  [];
arraybus[1] = [];
arraybus[2] = [];
arraybus[3] = [];
arraybus[4] = [];

arraybus[1][0] = [];
arraybus[1][1] = [];
arraybus[1][2] = [];
arraybus[1][3] = [];
arraybus[2][0] = [];
arraybus[3][0] = [];
arraybus[4][0] = [];
arraybus[4][1] = [];

// Cargo el arreglo
arraybus[1][0] = cargarMatriz("72", "Interurbanos", "OF 1519-52 Euro V", "2.219.283,04", "2.219.283,04", "44.385,66", "9.320,99", "53.706,65", "30.823,38", "3.698,81", "776,75", "35.298,93", "-", "Plan 100%");
arraybus[1][1] = cargarMatriz("72", "Interurbanos", "OF 1721-59 Euro V", "2.375.432,04", "2.375.432,04", "47.508,64", "9.976,81", "57.485,46", "32.992,11", "3.959,05", "831,40", "37.782,57", "-", "Plan 100%");
arraybus[1][2] = cargarMatriz("72", "Interurbanos", "O500 M 1826 Euro V", "2.879.535,11", "2.879.535,11", "57.590,70", "12.094,05", "69.684,75", "39.993,54", "4.799,23", "1.007,84", "45.800,61", "-", "Plan 100%");
arraybus[1][3] = cargarMatriz("72", "Interurbanos", "O500 U 1826 Euro V", "2.950.847,25", "2.950.847,25", "59.016,95", "12.393,56", "71.410,50", "40.983,99", "4.918,08", "1.032,80", "46.934,86", "-", "Plan 100%");

arraybus[2][0] = cargarMatriz("72", "Midibus", "LO 916-45 Euro V", "1.381.980,13", "1.381.980,13", "27.639,60", "5.804,32", "33.443,92", "19.194,17", "2.303,30", "483,69", "21.981,16", "-", "Plan 100%");

arraybus[3][0] = cargarMatriz("72", "Plataformas con motor electrónico", "O500 RSD 2436 Euro V", "3.767.248,32", "3.767.248,32", "75.344,97", "15.822,44", "91.167,41", "52.322,89", "6.278,75", "1.318,54", "59.920,18", "-", "Plan 100%");

arraybus[4][0] = cargarMatriz("72", "Urbanos", "OH 1621/55 Euro V", "2.604.122,70", "2.604.122,70", "52.082,45", "10.937,32", "63.019,77", "36.168,37", "4.340,20", "911,44", "41.420,02", "-", "Plan 100%");
arraybus[4][1] = cargarMatriz("72", "Urbanos", "OH 1721/62 Euro V", "2.650.844,45", "2.650.844,45", "53.016,89", "11.133,55", "64.150,44", "36.817,28", "4.418,07", "927,80", "42.163,15", "-", "Plan 100%");


// CAMIONES
var arraycamiones =  [];
arraycamiones[1] = [];
arraycamiones[2] = [];
arraycamiones[3] = [];
arraycamiones[4] = [];
arraycamiones[5] = [];

arraycamiones[1][0] = [];
arraycamiones[1][1] = [];
arraycamiones[2][0] = [];
arraycamiones[2][1] = [];
arraycamiones[3][0] = [];
arraycamiones[3][1] = [];
arraycamiones[3][2] = [];
arraycamiones[3][3] = [];
arraycamiones[3][4] = [];
arraycamiones[3][5] = [];
arraycamiones[3][6] = [];
arraycamiones[3][7] = [];
arraycamiones[3][8] = [];
arraycamiones[3][9] = [];
arraycamiones[3][10] = [];
arraycamiones[3][11] = [];
arraycamiones[3][12] = [];
arraycamiones[4][0] = [];
arraycamiones[4][1] = [];
arraycamiones[4][2] = [];
arraycamiones[4][3] = [];
arraycamiones[4][4] = [];
arraycamiones[4][5] = [];
arraycamiones[4][6] = [];
arraycamiones[4][7] = [];
arraycamiones[4][8] = [];
arraycamiones[4][9] = [];
arraycamiones[4][10] = [];
arraycamiones[4][11] = [];
arraycamiones[4][12] = [];
arraycamiones[4][13] = [];
arraycamiones[4][14] = [];
arraycamiones[4][15] = [];
arraycamiones[4][16] = [];
arraycamiones[4][17] = [];
arraycamiones[4][18] = [];
arraycamiones[4][19] = [];
arraycamiones[4][20] = [];
arraycamiones[4][21] = [];
arraycamiones[4][22] = [];
arraycamiones[4][23] = [];
arraycamiones[4][24] = [];
arraycamiones[4][25] = [];
arraycamiones[4][26] = [];
arraycamiones[4][27] = [];
arraycamiones[4][28] = [];
arraycamiones[4][29] = [];
arraycamiones[4][30] = [];
arraycamiones[5][0] = [];
arraycamiones[5][1] = [];
arraycamiones[5][2] = [];
arraycamiones[5][3] = [];
arraycamiones[5][4] = [];
arraycamiones[5][5] = [];
arraycamiones[5][6] = [];
arraycamiones[5][7] = [];
arraycamiones[5][8] = [];
arraycamiones[5][9] = [];
arraycamiones[5][10] = [];
arraycamiones[5][11] = [];
arraycamiones[5][12] = [];
arraycamiones[5][13] = [];
arraycamiones[5][14] = [];
arraycamiones[5][15] = [];
arraycamiones[5][16] = [];
arraycamiones[5][17] = [];

// Cargo el arreglo

arraycamiones[1][0] = cargarMatriz("84", "Livianos ", "Accelo 815/37", "1.166.040,20", "816.228,14", "0,00", "0,00", "0,00", "9.717,00", "971,70", "204,06", "10.892,76", "349.812,06", "Plan 70/30");
arraycamiones[1][1] = cargarMatriz("84", "Livianos  ", "Accelo 1016/37", "1.269.479,25", "888.635,48", "0,00", "0,00", "0,00", "10.578,99", "1.057,90", "222,16", "11.859,05", "380.843,78", "Plan 70/30");

arraycamiones[2][0] = cargarMatriz("72", "Medianos", "Atego 1419/48", "1.582.846,20", "1.107.992,34", "22.159,85", "4.653,57", "26.813,42", "15.388,78", "1.846,65", "387,80", "17.623,23", "474.853,86", "Plan 70/30");
arraycamiones[2][1] = cargarMatriz("72", "Medianos", "Atego 1419/48", "1.582.846,20", "1.582.846,20", "31.656,92", "6.647,95", "38.304,87", "21.983,98", "2.638,08", "554,00", "25.176,06", "---", "Plan 100%");

arraycamiones[3][0] = cargarMatriz("72", "Pesados Off Road ", "Axor 3131 B/36", "3.180.687,25", "2.226.481,08", "44.529,62", "9.351,22", "53.880,84", "30.923,35", "3.710,80", "779,27", "35.413,42", "954.206,18", "Plan 70/30");
arraycamiones[3][1] = cargarMatriz("72", "Pesados Off Road ", "Axor 3131 K/36", "3.133.669,50", "2.193.568,65", "43.871,37", "9.212,99", "53.084,36", "30.466,23", "3.655,95", "767,75", "34.889,93", "940.100,85", "Plan 70/30");
arraycamiones[3][2] = cargarMatriz("72", "Pesados Off Road ", "Axor 3131/48 6x4 Cab Ext", "3.141.802,30", "2.199.261,61", "43.985,23", "9.236,90", "53.222,13", "30.545,30", "3.665,44", "769,74", "34.980,48", "942.540,69", "Plan 70/30");
arraycamiones[3][3] = cargarMatriz("72", "Pesados Off Road ", "Arocs 3342 K/36 Cabina M - Toma de fuerza en caja", "3.847.831,00", "2.693.481,70", "53.869,63", "11.312,62", "65.182,25", "37.409,47", "4.489,14", "942,72", "42.841,33", "1.154.349,30", "Plan 70/30");
arraycamiones[3][4] = cargarMatriz("72", "Pesados Off Road ", "Arocs 4136 B/42 8x4 Cabina M -Toma de fuerza en motor en caja", "4.105.284,95", "2.873.699,47", "57.473,99", "12.069,54", "69.543,53", "39.912,49", "4.789,50", "1.005,80", "45.707,79", "1.231.585,49", "Plan 70/30");
arraycamiones[3][5] = cargarMatriz("72", "Pesados Off Road ", "Arocs 4845 K/48 8x4 Cabina M - Toma de fuerza en caja", "4.439.238,05", "3.107.466,64", "62.149,33", "13.051,36", "75.200,69", "43.159,26", "5.179,11", "1.087,61", "49.425,98", "1.331.771,42", "Plan 70/30");
arraycamiones[3][6] = cargarMatriz("72", "Pesados Off Road", "Nuevo Actros 3342 S/36 6x4 Cabina M - Toma de fuerza en caja", "3.854.947,20", "3.854.947,20", "77.098,94", "16.190,78", "93.289,72", "53.540,93", "6.424,91", "1.349,23", "61.315,07", "---", "Plan 100%");
arraycamiones[3][7] = cargarMatriz("72", "Pesados Off Road", "Arocs 3342 K/36 Cabina M - Toma de fuerza en caja", "3.847.831,00", "3.847.831,00", "76.956,62", "16.160,89", "93.117,51", "53.442,10", "6.413,05", "1.346,74", "61.201,89", "---", "Plan 100%");
arraycamiones[3][8] = cargarMatriz("72", "Pesados Off Road", "Arocs 4136 B/42 8x4 Cabina M -Toma de fuerza en motor en caja", "4.105.284,95", "4.105.284,95", "82.105,70", "17.242,20", "99.347,90", "57.017,85", "6.842,14", "1.436,85", "65.296,84", "---", "Plan 100%");
arraycamiones[3][9] = cargarMatriz("72", "Pesados Off Road", "Arocs 4845 K/48 8x4 Cabina M - Toma de fuerza en caja", "4.439.238,05", "4.439.238,05", "88.784,76", "18.644,80", "107.429,56", "61.656,08", "7.398,73", "1.553,73", "70.608,54", "---", "Plan 100%");
arraycamiones[3][10] = cargarMatriz("72", "Pesados Off Road", "Axor 3131 B/36", "3.180.687,25", "3.180.687,25", "63.613,75", "13.358,89", "76.972,64", "44.176,21", "5.301,15", "1.113,24", "50.590,60", "---", "Plan 100%");
arraycamiones[3][11] = cargarMatriz("72", "Pesados Off Road", "Axor 3131 K/36", "3.133.669,50", "3.133.669,50", "62.673,39", "13.161,41", "75.834,80", "43.523,19", "5.222,78", "1.096,78", "49.842,75", "---", "Plan 100%");
arraycamiones[3][12] = cargarMatriz("72", "Pesados Off Road", "Axor 3131/48 6x4 Cab Ext", "3.141.802,30", "3.141.802,30", "62.836,05", "13.195,57", "76.031,62", "43.636,14", "5.236,34", "1.099,63", "49.972,11", "---", "Plan 100%");

arraycamiones[4][0] = cargarMatriz("72", "Pesados On Road", "Atron 1735S/45", "2.770.027,81", "1.939.019,47", "38.780,39", "8.143,88", "46.924,27", "26.930,83", "3.231,70", "678,66", "30.841,18", "831.008,34", "Plan 70/30");
arraycamiones[4][1] = cargarMatriz("72", "Pesados On Road", "Atron 1735/51", "2.731.449,50", "1.912.014,65", "38.240,29", "8.030,46", "46.270,75", "26.555,76", "3.186,69", "669,21", "30.411,66", "819.434,85", "Plan 70/30");
arraycamiones[4][2] = cargarMatriz("72", "Pesados On Road", "Axor 1933 S/36 CD Techo Bajo", "2.800.470,56", "1.960.329,39", "39.206,59", "8.233,38", "47.439,97", "27.226,80", "3.267,22", "686,12", "31.180,13", "840.141,17", "Plan 70/30");
arraycamiones[4][3] = cargarMatriz("72", "Pesados On Road", "Axor 2036 S/36 CD Techo Elevado", "3.237.166,56", "2.266.016,59", "45.320,33", "9.517,27", "54.837,60", "31.472,45", "3.776,69", "793,11", "36.042,25", "971.149,97", "Plan 70/30");
arraycamiones[4][4] = cargarMatriz("72", "Pesados On Road", "Axor 2041 S/36 CD Techo Elevado", "3.381.507,19", "2.367.055,03", "47.341,10", "9.941,63", "57.282,73", "32.875,76", "3.945,09", "828,47", "37.649,33", "1.014.452,16", "Plan 70/30");
arraycamiones[4][5] = cargarMatriz("72", "Pesados On Road", "Actros 1841 LS/36 4x2 Cabina L Dormitorio", "3.571.249,50", "2.499.874,65", "49.997,49", "10.499,47", "60.496,97", "34.720,48", "4.166,46", "874,96", "39.761,90", "1.071.374,85", "Plan 70/30");
arraycamiones[4][6] = cargarMatriz("72", "Pesados On Road", "Actros 2041 S/36 4x2 Cabina L Dormitorio", "3.498.029,44", "2.448.620,61", "48.972,41", "10.284,21", "59.256,62", "34.008,62", "4.081,03", "857,02", "38.946,67", "1.049.408,83", "Plan 70/30");
arraycamiones[4][7] = cargarMatriz("72", "Pesados On Road", "Actros 2041/45 4x2 Cabina L Dormitorio", "3.493.043,13", "2.445.130,19", "48.902,60", "10.269,55", "59.172,15", "33.960,14", "4.075,22", "855,80", "38.891,15", "1.047.912,94", "Plan 70/30");
arraycamiones[4][8] = cargarMatriz("72", "Pesados On Road", "Actros 2636 LS/33 6x2 Cabina L Dormitorio Techo Bajo (Combustible)", "3.558.914,94", "2.491.240,46", "49.824,81", "10.463,21", "60.288,02", "34.600,56", "4.152,07", "871,93", "39.624,56", "1.067.674,48", "Plan 70/30");
arraycamiones[4][9] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 LS/37 4x2", "3.642.632,50", "2.549.842,75", "50.996,86", "10.709,34", "61.706,19", "35.414,48", "4.249,74", "892,44", "40.556,67", "1.092.789,75", "Plan 70/30");
arraycamiones[4][10] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 L/46 4x2", "3.562.851,50", "2.493.996,05", "49.879,92", "10.474,78", "60.354,70", "34.638,83", "4.156,66", "872,90", "39.668,39", "1.068.855,45", "Plan 70/30");
arraycamiones[4][11] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2048 LS/37 4x2", "3.943.385,88", "2.760.370,11", "55.207,40", "11.593,55", "66.800,96", "38.338,47", "4.600,62", "966,13", "43.905,22", "1.183.015,76", "Plan 70/30");
arraycamiones[4][12] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2636 LS/33 6x2 (liviano combustible CMT 50Tn)", "3.630.035,50", "2.541.024,85", "50.820,50", "10.672,30", "61.492,80", "35.292,01", "4.235,04", "889,36", "40.416,41", "1.089.010,65", "Plan 70/30");
arraycamiones[4][13] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2645 LS/33 6x2 (55tN / Briten 60Tn)", "3.902.445,63", "2.731.711,94", "54.634,24", "11.473,19", "66.107,43", "37.940,44", "4.552,85", "956,10", "43.449,40", "1.170.733,69", "Plan 70/30");
arraycamiones[4][14] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2651 LS/40 6x4 (Bitren 75 Tn)", "4.377.719,94", "3.064.403,96", "61.288,08", "12.870,50", "74.158,58", "42.561,17", "5.107,34", "1.072,54", "48.741,05", "1.313.315,98", "Plan 70/30");
arraycamiones[4][15] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 3342 S/36 6x4 Cabina M - Toma de fuerza en caja", "3.980.652,00", "2.786.456,40", "55.729,13", "11.703,12", "67.432,24", "38.700,78", "4.644,09", "975,26", "44.320,14", "1.194.195,60", "Plan 70/30");
arraycamiones[4][16] = cargarMatriz("72", "Pesados On Road", "Atron 1735S/45", "2.770.027,81", "2.770.027,81", "55.400,56", "11.634,12", "67.034,67", "38.472,61", "4.616,71", "969,51", "44.058,83", "-", "Plan 100%");
arraycamiones[4][17] = cargarMatriz("72", "Pesados On Road", "Atron 1735/51", "2.731.449,50", "2.731.449,50", "54.628,99", "11.472,09", "66.101,08", "37.936,80", "4.552,42", "956,01", "43.445,22", "-", "Plan 100%");
arraycamiones[4][18] = cargarMatriz("72", "Pesados On Road", "Axor 1933 S/36 CD Techo Bajo", "2.800.470,56", "2.800.470,56", "56.009,41", "11.761,98", "67.771,39", "38.895,42", "4.667,45", "980,16", "44.543,04", "-", "Plan 100%");
arraycamiones[4][19] = cargarMatriz("72", "Pesados On Road", "Axor 2036 S/36 CD Techo Elevado", "3.237.166,56", "3.237.166,56", "64.743,33", "13.596,10", "78.339,43", "44.960,65", "5.395,28", "1.133,01", "51.488,93", "-", "Plan 100%");
arraycamiones[4][20] = cargarMatriz("72", "Pesados On Road", "Axor 2041 S/36 CD Techo Elevado", "3.381.507,19", "3.381.507,19", "67.630,14", "14.202,33", "81.832,47", "46.965,38", "5.635,85", "1.183,53", "53.784,75", "-", "Plan 100%");
arraycamiones[4][21] = cargarMatriz("72", "Pesados On Road", "Actros 1841 LS/36 4x2 Cabina L Dormitorio", "3.571.249,50", "3.571.249,50", "71.424,99", "14.999,25", "86.424,24", "49.600,69", "5.952,08", "1.249,94", "56.802,71", "-", "Plan 100%");
arraycamiones[4][22] = cargarMatriz("72", "Pesados On Road", "Actros 2041 S/36 4x2 Cabina L Dormitorio", "3.498.029,44", "3.498.029,44", "69.960,59", "14.691,72", "84.652,31", "48.583,74", "5.830,05", "1.224,31", "55.638,10", "-", "Plan 100%");
arraycamiones[4][23] = cargarMatriz("72", "Pesados On Road", "Actros 2041/45 4x2 Cabina L Dormitorio", "3.493.043,13", "3.493.043,13", "69.860,86", "14.670,78", "84.531,64", "48.514,49", "5.821,74", "1.222,57", "55.558,79", "-", "Plan 100%");
arraycamiones[4][24] = cargarMatriz("72", "Pesados On Road", "Actros 2636 LS/33 6x2 Cabina L Dormitorio Techo Bajo (Combustible)", "3.558.914,94", "3.558.914,94", "71.178,30", "14.947,44", "86.125,74", "49.429,37", "5.931,52", "1.245,62", "56.606,52", "-", "Plan 100%");
arraycamiones[4][25] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 LS/37 4x2", "3.642.632,50", "3.642.632,50", "72.852,65", "15.299,06", "88.151,71", "50.592,12", "6.071,05", "1.274,92", "57.938,09", "-", "Plan 100%");
arraycamiones[4][26] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 L/46 4x2", "3.562.851,50", "3.562.851,50", "71.257,03", "14.963,98", "86.221,01", "49.484,05", "5.938,09", "1.247,00", "56.669,13", "-", "Plan 100%");
arraycamiones[4][27] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2048 LS/37 4x2", "3.943.385,88", "3.943.385,88", "78.867,72", "16.562,22", "95.429,94", "54.769,25", "6.572,31", "1.380,19", "62.721,74", "-", "Plan 100%");
arraycamiones[4][28] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2636 LS/33 6x2 (liviano combustible CMT 50Tn)", "3.630.035,50", "3.630.035,50", "72.600,71", "15.246,15", "87.846,86", "50.417,16", "6.050,06", "1.270,51", "57.737,73", "-", "Plan 100%");
arraycamiones[4][29] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2645 LS/33 6x2 (55tN / Briten 60Tn)", "3.902.445,63", "3.902.445,63", "78.048,91", "16.390,27", "94.439,18", "54.200,63", "6.504,08", "1.365,86", "62.070,57", "-", "Plan 100%");
arraycamiones[4][30] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2651 LS/40 6x4 (Bitren 75 Tn)", "4.377.719,94", "4.377.719,94", "87.554,40", "18.386,42", "105.940,82", "60.801,67", "7.296,20", "1.532,20", "69.630,07", "-", "Plan 100%");

arraycamiones[5][0] = cargarMatriz("72", "Semipesados ", "Atego 1720/36 CN", "1.652.483,30", "1.156.738,31", "23.134,77", "4.858,30", "27.993,07", "16.065,81", "1.927,90", "404,86", "18.398,57", "495.744,99", "Plan 70/30");
arraycamiones[5][1] = cargarMatriz("72", "Semipesados ", "Atego 1720/48 CN", "1.667.478,15", "1.167.234,71", "23.344,69", "4.902,38", "28.247,07", "16.211,59", "1.945,39", "408,53", "18.565,51", "500.243,45", "Plan 70/30");
arraycamiones[5][2] = cargarMatriz("72", "Semipesados ", "Atego 1726 S/36 CN con ABS", "1.892.909,20", "1.325.036,44", "26.500,73", "5.565,15", "32.065,88", "18.403,28", "2.208,39", "463,76", "21.075,43", "567.872,76", "Plan 70/30");
arraycamiones[5][3] = cargarMatriz("72", "Semipesados ", "Atego 1726 S/36 CD con ABS", "1.972.966,45", "1.381.076,52", "27.621,53", "5.800,52", "33.422,05", "19.181,62", "2.301,79", "483,38", "21.966,79", "591.889,94", "Plan 70/30");
arraycamiones[5][4] = cargarMatriz("72", "Semipesados ", "Atego 1726/42 CN", "1.860.886,30", "1.302.620,41", "26.052,41", "5.471,01", "31.523,42", "18.091,95", "2.171,03", "455,92", "20.718,90", "558.265,89", "Plan 70/30");
arraycamiones[5][5] = cargarMatriz("72", "Semipesados ", "Atego 1726/42 CD", "1.941.960,15", "1.359.372,11", "27.187,44", "5.709,36", "32.896,80", "18.880,17", "2.265,62", "475,78", "21.621,57", "582.588,05", "Plan 70/30");
arraycamiones[5][6] = cargarMatriz("72", "Semipesados ", "Atego 1726/48 CN", "1.880.964,15", "1.316.674,91", "26.333,50", "5.530,04", "31.863,54", "18.287,15", "2.194,46", "460,84", "20.942,45", "564.289,25", "Plan 70/30");
arraycamiones[5][7] = cargarMatriz("72", "Semipesados ", "Atego 2426/48", "2.092.416,95", "1.464.691,87", "29.293,84", "6.151,71", "35.445,55", "20.342,94", "2.441,15", "512,64", "23.296,73", "627.725,09", "Plan 70/30");
arraycamiones[5][8] = cargarMatriz("72", "Semipesados ", "Atego 1726 A/42 4x4 Cab Ext Versión Civil", "2.745.582,45", "1.921.907,72", "38.438,15", "8.072,01", "46.510,16", "26.693,16", "3.203,18", "672,67", "30.569,01", "823.674,74", "Plan 70/30");
arraycamiones[5][9] = cargarMatriz("72", "Semipesados", "Atego 1720/36 CN", "1.652.483,30", "1.652.483,30", "33.049,67", "6.940,43", "39.990,10", "22.951,16", "2.754,14", "578,37", "26.283,67", "---", "Plan 100%");
arraycamiones[5][10] = cargarMatriz("72", "Semipesados", "Atego 1720/48 CN", "1.667.478,15", "1.667.478,15", "33.349,56", "7.003,41", "40.352,97", "23.159,42", "2.779,13", "583,62", "26.522,17", "---", "Plan 100%");
arraycamiones[5][11] = cargarMatriz("72", "Semipesados", "Atego 1726 S/36 CN con ABS", "1.892.909,20", "1.892.909,20", "37.858,18", "7.950,22", "45.808,40", "26.290,41", "3.154,85", "662,52", "30.107,78", "---", "Plan 100%");
arraycamiones[5][12] = cargarMatriz("72", "Semipesados", "Atego 1726 S/36 CD con ABS", "1.972.966,45", "1.972.966,45", "39.459,33", "8.286,46", "47.745,79", "27.402,31", "3.288,28", "690,54", "31.381,13", "---", "Plan 100%");
arraycamiones[5][13] = cargarMatriz("72", "Semipesados", "Atego 1726/42 CN", "1.860.886,30", "1.860.886,30", "37.217,73", "7.815,72", "45.033,45", "25.845,64", "3.101,48", "651,31", "29.598,43", "---", "Plan 100%");
arraycamiones[5][14] = cargarMatriz("72", "Semipesados", "Atego 1726/42 CD", "1.941.960,15", "1.941.960,15", "38.839,20", "8.156,23", "46.995,43", "26.971,67", "3.236,60", "679,69", "30.887,96", "---", "Plan 100%");
arraycamiones[5][15] = cargarMatriz("72", "Semipesados", "Atego 1726/48 CN", "1.880.964,15", "1.880.964,15", "37.619,28", "7.900,05", "45.519,33", "26.124,50", "3.134,94", "658,34", "29.917,78", "---", "Plan 100%");
arraycamiones[5][16] = cargarMatriz("72", "Semipesados", "Atego 2426/48", "2.092.416,95", "2.092.416,95", "41.848,34", "8.788,15", "50.636,49", "29.061,35", "3.487,36", "732,35", "33.281,06", "---", "Plan 100%");
arraycamiones[5][17] = cargarMatriz("72", "Semipesados", "Atego 1726 A/42 4x4 Cab Ext Versión Civil", "2.745.582,45", "2.745.582,45", "54.911,65", "11.531,45", "66.443,10", "38.133,09", "4.575,97", "960,95", "43.670,01", "---", "Plan 100%");






// VANS

var arrayvans =  [];
arrayvans[1] = [];
arrayvans[2] = [];
arrayvans[3] = [];
arrayvans[4] = [];

arrayvans[1][0] = [];
arrayvans[1][1] = [];
arrayvans[1][2] = [];
arrayvans[1][3] = [];
arrayvans[2][0] = [];
arrayvans[2][1] = [];
arrayvans[2][2] = [];
arrayvans[2][3] = [];
arrayvans[2][4] = [];
arrayvans[2][5] = [];
arrayvans[3][0] = [];
arrayvans[3][1] = [];
arrayvans[3][2] = [];
arrayvans[3][3] = [];
arrayvans[3][4] = [];
arrayvans[3][5] = [];
arrayvans[3][6] = [];
arrayvans[3][7] = [];
arrayvans[3][8] = [];
arrayvans[3][9] = [];
arrayvans[3][10] = [];
arrayvans[3][11] = [];
arrayvans[3][12] = [];
arrayvans[3][13] = [];
arrayvans[3][14] = [];
arrayvans[3][15] = [];
arrayvans[3][16] = [];
arrayvans[3][17] = [];
arrayvans[3][18] = [];
arrayvans[3][19] = [];
arrayvans[3][20] = [];
arrayvans[3][21] = [];
arrayvans[3][22] = [];
arrayvans[3][23] = [];
arrayvans[3][24] = [];
arrayvans[3][25] = [];
arrayvans[3][26] = [];
arrayvans[3][27] = [];
arrayvans[3][28] = [];
arrayvans[3][29] = [];
arrayvans[3][30] = [];
arrayvans[3][31] = [];
arrayvans[3][32] = [];
arrayvans[3][33] = [];
arrayvans[4][0] = [];
arrayvans[4][1] = [];
arrayvans[4][2] = [];


arrayvans[1][0] = cargarMatriz("72", "Chasis Cabina", "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado", "968.050,00", "677.635,00", "13.552,70", "2.846,07", "16.398,77", "9.411,60", "1.129,39", "237,17", "10.778,16", "290.415,00", "Plan 70/30");
arrayvans[1][1] = cargarMatriz("72", "Chasis Cabina", "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado", "1.058.062,50", "740.643,75", "14.812,88", "3.110,70", "17.923,58", "10.286,72", "1.234,41", "259,23", "11.780,35", "317.418,75", "Plan 70/30");
arrayvans[1][2] = cargarMatriz("72", "Chasis Cabina", "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado", "968.050,00", "968.050,00", "19.361,00", "4.065,81", "23.426,81", "13.445,14", "1.613,42", "338,82", "15.397,37", "-", "Plan 100%");
arrayvans[1][3] = cargarMatriz("72", "Chasis Cabina", "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado", "1.058.062,50", "1.058.062,50", "21.161,25", "4.443,86", "25.605,11", "14.695,31", "1.763,44", "370,32", "16.829,07", "-", "Plan 100%");

arrayvans[2][0] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 9+1 TN", "1.476.537,50", "1.033.576,25", "20.671,53", "4.341,02", "25.012,55", "14.355,23", "1.722,63", "361,75", "16.439,60", "442.961,25", "Plan 70/30");
arrayvans[2][1] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 15+1 TE", "1.454.687,50", "1.018.281,25", "20.365,63", "4.276,78", "24.642,41", "14.142,80", "1.697,14", "356,40", "16.196,33", "436.406,25", "Plan 70/30");
arrayvans[2][2] = cargarMatriz("72", "Combi", "Sprinter 515 CDI Combi 4325 19+1", "1.792.412,50", "1.254.688,75", "25.093,78", "5.269,69", "30.363,47", "17.426,23", "2.091,15", "439,14", "19.956,52", "537.723,75", "Plan 70/30");
arrayvans[2][3] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 9+1 TN", "1.476.537,50", "1.476.537,50", "29.530,75", "6.201,46", "35.732,21", "20.507,47", "2.460,90", "516,79", "23.485,15", "-", "Plan 100%");
arrayvans[2][4] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 15+1 TE", "1.454.687,50", "1.454.687,50", "29.093,75", "6.109,69", "35.203,44", "20.203,99", "2.424,48", "509,14", "23.137,61", "-", "Plan 100%");
arrayvans[2][5] = cargarMatriz("72", "Combi", "Sprinter 515 CDI Combi 4325 19+1", "1.792.412,50", "1.792.412,50", "35.848,25", "7.528,13", "43.376,38", "24.894,62", "2.987,35", "627,34", "28.509,32", "-", "Plan 100%");

arrayvans[3][0] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado", "938.125,00", "656.687,50", "13.133,75", "2.758,09", "15.891,84", "9.120,66", "1.094,48", "229,84", "10.444,98", "281.437,50", "Plan 70/30");
arrayvans[3][1] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado", "949.050,00", "664.335,00", "13.286,70", "2.790,21", "16.076,91", "9.226,88", "1.107,23", "232,52", "10.566,62", "284.715,00", "Plan 70/30");
arrayvans[3][2] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado", "1.095.587,50", "766.911,25", "15.338,23", "3.221,03", "18.559,25", "10.651,55", "1.278,19", "268,42", "12.198,15", "328.676,25", "Plan 70/30");
arrayvans[3][3] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado", "1.119.337,50", "783.536,25", "15.670,73", "3.290,85", "18.961,58", "10.882,45", "1.305,89", "274,24", "12.462,58", "335.801,25", "Plan 70/30");
arrayvans[3][4] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado", "1.108.887,50", "776.221,25", "15.524,43", "3.260,13", "18.784,55", "10.780,85", "1.293,70", "271,68", "12.346,23", "332.666,25", "Plan 70/30");
arrayvans[3][5] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado", "1.174.437,50", "822.106,25", "16.442,13", "3.452,85", "19.894,97", "11.418,14", "1.370,18", "287,74", "13.076,06", "352.331,25", "Plan 70/30");
arrayvans[3][6] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado", "1.207.450,00", "845.215,00", "16.904,30", "3.549,90", "20.454,20", "11.739,10", "1.408,69", "295,83", "13.443,61", "362.235,00", "Plan 70/30");
arrayvans[3][7] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado", "1.187.025,00", "830.917,50", "16.618,35", "3.489,85", "20.108,20", "11.540,52", "1.384,86", "290,82", "13.216,20", "356.107,50", "Plan 70/30");
arrayvans[3][8] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado", "1.199.850,00", "839.895,00", "16.797,90", "3.527,56", "20.325,46", "11.665,21", "1.399,83", "293,96", "13.359,00", "359.955,00", "Plan 70/30");
arrayvans[3][9] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado", "1.233.100,00", "863.170,00", "17.263,40", "3.625,31", "20.888,71", "11.988,47", "1.438,62", "302,11", "13.729,20", "369.930,00", "Plan 70/30");
arrayvans[3][10] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado", "1.210.062,50", "847.043,75", "16.940,88", "3.557,58", "20.498,46", "11.764,50", "1.411,74", "296,47", "13.472,70", "363.018,75", "Plan 70/30");
arrayvans[3][11] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.352.087,50", "946.461,25", "18.929,23", "3.975,14", "22.904,36", "13.145,30", "1.577,44", "331,26", "15.053,99", "405.626,25", "Plan 70/30");
arrayvans[3][12] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.399.825,00", "979.877,50", "19.597,55", "4.115,49", "23.713,04", "13.609,41", "1.633,13", "342,96", "15.585,50", "419.947,50", "Plan 70/30");
arrayvans[3][13] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado", "1.434.025,00", "1.003.817,50", "20.076,35", "4.216,03", "24.292,38", "13.941,91", "1.673,03", "351,34", "15.966,28", "430.207,50", "Plan 70/30");
arrayvans[3][14] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado", "938.125,00", "938.125,00", "18.762,50", "3.940,13", "22.702,63", "13.029,51", "1.563,54", "328,34", "14.921,40", "-", "Plan 100%");
arrayvans[3][15] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado", "949.050,00", "949.050,00", "18.981,00", "3.986,01", "22.967,01", "13.181,25", "1.581,75", "332,17", "15.095,17", "-", "Plan 100%");
arrayvans[3][16] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado", "1.095.587,50", "1.095.587,50", "21.911,75", "4.601,47", "26.513,22", "15.216,49", "1.825,98", "383,46", "17.425,93", "-", "Plan 100%");
arrayvans[3][17] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado", "1.119.337,50", "1.119.337,50", "22.386,75", "4.701,22", "27.087,97", "15.546,35", "1.865,56", "391,77", "17.803,68", "-", "Plan 100%");
arrayvans[3][18] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado", "1.108.887,50", "1.108.887,50", "22.177,75", "4.657,33", "26.835,08", "15.401,22", "1.848,15", "388,11", "17.637,47", "-", "Plan 100%");
arrayvans[3][19] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado", "1.174.437,50", "1.174.437,50", "23.488,75", "4.932,64", "28.421,39", "16.311,63", "1.957,40", "411,05", "18.680,08", "-", "Plan 100%");
arrayvans[3][20] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado", "1.207.450,00", "1.207.450,00", "24.149,00", "5.071,29", "29.220,29", "16.770,14", "2.012,42", "422,61", "19.205,16", "-", "Plan 100%");
arrayvans[3][21] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado", "1.187.025,00", "1.187.025,00", "23.740,50", "4.985,51", "28.726,01", "16.486,46", "1.978,38", "415,46", "18.880,29", "-", "Plan 100%");
arrayvans[3][22] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado", "1.199.850,00", "1.199.850,00", "23.997,00", "5.039,37", "29.036,37", "16.664,58", "1.999,75", "419,95", "19.084,28", "-", "Plan 100%");
arrayvans[3][23] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado", "1.233.100,00", "1.233.100,00", "24.662,00", "5.179,02", "29.841,02", "17.126,39", "2.055,17", "431,59", "19.613,14", "-", "Plan 100%");
arrayvans[3][24] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado", "1.210.062,50", "1.210.062,50", "24.201,25", "5.082,26", "29.283,51", "16.806,42", "2.016,77", "423,52", "19.246,72", "-", "Plan 100%");
arrayvans[3][25] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.352.087,50", "1.352.087,50", "27.041,75", "5.678,77", "32.720,52", "18.778,99", "2.253,48", "473,23", "21.505,70", "-", "Plan 100%");
arrayvans[3][26] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.399.825,00", "1.399.825,00", "27.996,50", "5.879,27", "33.875,77", "19.442,01", "2.333,04", "489,94", "22.264,99", "-", "Plan 100%");
arrayvans[3][27] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado", "1.434.025,00", "1.434.025,00", "28.680,50", "6.022,91", "34.703,41", "19.917,01", "2.390,04", "501,91", "22.808,96", "-", "Plan 100%");
arrayvans[3][28] = cargarMatriz("84", "Furgón", "CDI Furgón Versión 1 con aire acondicionado", "795.624,95", "556.937,46", "0,00", "0,00", "0,00", "6.630,21", "663,02", "139,23", "7.432,46", "238.687,48", "Plan 70/30");
arrayvans[3][29] = cargarMatriz("84", "Furgón", "CDI Furgón Versión 2 con aire acondicionado", "806.312,45", "564.418,72", "0,00", "0,00", "0,00", "6.719,27", "671,93", "141,10", "7.532,30", "241.893,74", "Plan 70/30");
arrayvans[3][30] = cargarMatriz("84", "Furgón", "CDI Furgón Mixto con aire acondicionado - PEA2", "838.137,50", "586.696,25", "11.733,93", "2.464,12", "14.198,05", "6.984,48", "838,14", "176,01", "7.998,63", "251.441,25", "Plan 70/30");
arrayvans[3][31] = cargarMatriz("84", "Furgón", "CDI Furgón Mixto con aire acondicionado", "838.137,50", "586.696,25", "0,00", "0,00", "0,00", "6.984,48", "698,45", "146,67", "7.829,60", "251.441,25", "Plan 70/30");
arrayvans[3][32] = cargarMatriz("84", "Furgón", "CDI Furgón Mixto X con aire acondicionado", "878.750,00", "615.125,00", "0,00", "0,00", "0,00", "7.322,92", "732,29", "153,78", "8.208,99", "263.625,00", "Plan 70/30");
arrayvans[3][33] = cargarMatriz("84", "Furgón", "CDI Furgón Plus con aire acondicionado", "923.875,00", "646.712,50", "0,00", "0,00", "0,00", "7.698,96", "769,90", "161,68", "8.630,53", "277.162,50", "Plan 70/30");

arrayvans[4][0] = cargarMatriz("84", "Pasajeros", "Vito Combi", "947.625,00", "663.337,50", "0,00", "0,00", "0,00", "7.896,88", "789,69", "165,83", "8.852,40", "284.287,50", "Plan 70/30");
arrayvans[4][1] = cargarMatriz("84", "Pasajeros", "Vito Tourer", "1.090.125,00", "763.087,50", "0,00", "0,00", "0,00", "9.084,38", "908,44", "190,77", "10.183,58", "327.037,50", "Plan 70/30");
arrayvans[4][2] = cargarMatriz("84", "Pasajeros", "Tourer AT X", "1.256.375,05", "879.462,53", "0,00", "0,00", "0,00", "10.469,79", "1.046,98", "219,87", "11.736,64", "376.912,51", "Plan 70/30");



// FUNCTIONS

function cargarMatriz(cuota, linea, modelo, precioPublico, precioPublico100, derechoSuscripcion, iva, totalSuscripcion, cuotaPura, cargaAdminSuscripcion, iva21, cuotaMensual, pagoAdjudicacion30, plan) {
	var array_aux = [];

	array_aux["modelo"] = modelo;
	array_aux["linea"] = linea;
	array_aux["plan"] = plan;
	array_aux["cuotas"]= cuota;
	array_aux["precioPublico"] = precioPublico;
	array_aux["precioPublico100"] = precioPublico100;
	array_aux["derechoSuscripcion"] = derechoSuscripcion;
	array_aux["iva"] = iva;
	array_aux["totalSuscripcion"] = totalSuscripcion;
	array_aux["cuotaPura"] = cuotaPura;
	array_aux["cargaAdminSuscripcion"] = cargaAdminSuscripcion;
	array_aux["iva21"] = iva21;
	array_aux["cuotaMensual"] = cuotaMensual;
	array_aux["pagoAdjudicacion30"] = pagoAdjudicacion30;

	//Plan 70/30
	//Plan 100%

	return array_aux;
}

function obtenerModelos(arregloGeneral, linea){

	var arregloModelos = [];

	for (var i=0; i<arregloGeneral[linea].length; i++) {
		arregloModelos.push(arregloGeneral[linea][i]);
	}

	return arregloModelos;
}

function obtenerPlanes(arregloGeneral, linea, modelo){

	var arregloPlanes = [];

	arregloPlanes = jQuery.grep(arregloGeneral[linea], function( n, i ) {
		return n["modelo"] == modelo;
	});

	return arregloPlanes;
}

function obtenerCuotas(arregloGeneral, linea, modelo, plan){

	var arregloCuotas = [];

	arregloCuotas = jQuery.grep(arregloGeneral[linea], function( n, i ) {
		return n["modelo"] == modelo && n["plan"] == plan;
	});

	return arregloCuotas;
}

function getParameters(k){
	var p={};
	location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
	return k?p[k]:p;
}

function cotizar(objeto){

	var arrayAux =  [];
	arrayAux = eval('array'+objeto);

	var linea = $('#'+objeto+'_linea').val();
	var modelo = $('#'+objeto+'_modelos').val();
	var plan = $('#'+objeto+'_plan').val();
	var cuotas = $('#'+objeto+'_cuotas').val();

	// Armo la URL del Cotizador
	var urlParameter = '';

	if(linea != '' && modelo != '' && plan != '' && cuotas != ''){
		urlParameter = 'obj='+escape(objeto)+'&linea='+escape(linea)+'&modelo='+escape(modelo)+'&plan='+escape(plan)+'&cuotas='+escape(cuotas);

		window.location.href = "cotizacion.html?"+urlParameter;
	}else{
		alert('Faltan elegir opciones para la cotización');
	}
}

function actualizarModelos(linea, objeto){

	// Vacio la lista
	$("#"+objeto+"_modelos").empty().append('<option value="" selected="">Modelo</option>');
	$("#"+objeto+"_modelos").selectpicker("refresh");
	$("#"+objeto+"_plan").empty().append('<option value="" selected="">Plan</option>');
	$("#"+objeto+"_plan").selectpicker("refresh");
	$("#"+objeto+"_cuotas").empty().append('<option value="" selected="">Cuotas</option>');
	$("#"+objeto+"_cuotas").selectpicker("refresh");

	// Obtengo los Modelos de la linea seleccionada
	var Modelos =  obtenerModelos(eval('array'+objeto), linea);

	var arregloAux = [];

	// Actualizo los modelos segun la linea elegida
	for (var i=0; i<Modelos.length; i++) {

		if( $.inArray( Modelos[i]["modelo"], arregloAux) == -1  ){

			arregloAux.push(Modelos[i]["modelo"]);

			$("#"+objeto+"_modelos").append('<option value="'+Modelos[i]["modelo"]+'" >'+Modelos[i]["modelo"]+'</option>');
			$("#"+objeto+"_modelos").selectpicker("refresh");
		}
	}

}

function actualizarPlanes(linea, modelo, objeto){

	// Vacio la lista de Planes
	$("#"+objeto+"_plan").empty().append('<option value="" selected="">Plan</option>');
	$("#"+objeto+"_plan").selectpicker("refresh");
	$("#"+objeto+"_cuotas").empty().append('<option value="" selected="">Cuotas</option>');
	$("#"+objeto+"_cuotas").selectpicker("refresh");

	// Obtengo los Planes del Modelo seleccionado
	var Planes =  obtenerPlanes(eval('array'+objeto), linea, modelo);

	// Actualizo los planes segun el modelo elejido
	for (var i=0; i<Planes.length; i++) {

		$("#"+objeto+"_plan").append('<option value="'+Planes[i]["plan"]+'" >'+Planes[i]["plan"]+'</option>');
		$("#"+objeto+"_plan").selectpicker("refresh");
	}

}

function actualizarCuotas( linea, modelo, plan, objeto){

	// Vacio la lista de Planes
	$("#"+objeto+"_cuotas").empty().append('<option value="" selected="">Cuotas</option>');

	// Obtengo las cuotas del Plan seleccionado
	var Cuotas =  obtenerCuotas(eval('array'+objeto), linea, modelo, plan);

	// Actualizo las cuotas segun el plan elejido
	for (var i=0; i<Cuotas.length; i++) {

		$("#"+objeto+"_cuotas").append('<option value="'+Cuotas[i]["cuotas"]+'" >'+Cuotas[i]["cuotas"]+'</option>');
		$("#"+objeto+"_cuotas").selectpicker("refresh");
	}
}

function actualizarContadorContactosPendientes(){

	var contadorAux = 0;

	 //Si tengo los datos guardados localmente, los consulto directamente desde ahi
	 var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

	 // Si hay datos localmente
	 if(datos_guardados != null){
		contadorAux = datos_guardados.length;
	 }

	// ACtualizo el Bubble Count de Contactos Pendientes
	$('#total_contactos_pendientes').html(contadorAux);
}

function enviarRegistro(RegistroGuardar) {

	 //check if station is alive
	 return $.ajax({
		  type: 'GET',
		  url: url_accesso + '/sync_data.php?datos_guardados='+JSON.stringify(RegistroGuardar),
		  dataType :"jsonp",
		  jsonpCallback: "expojson_sync",
		  charset: 'UTF-8',
		  success : function(data){

				// Si no hubo error
				if(String(data.error).toLowerCase() == "false"){

					 // Vacio los registros offline
					 //window.localStorage.removeItem("datos_guardados");

					 // Los datos se sincronizaron con éxito.
				alert(data.mensaje);

				 // Inicializo el Formulario
				 $('#form1').trigger("reset");
				$("#provincia").val('default');
				$("#provincia").selectpicker("refresh");

				}else{
					 alert(data.mensaje);
				}

		  },
		  beforeSend: function() {
				// This callback function will trigger before data is sent
		  },
		  complete: function() {
				// This callback function will trigger on data sent/received complete
		  },
		  error : function(httpReq,status,exception){
				console.log(status+" "+exception);
		  }
	 }).then(function (resp) {
		  return $.Deferred(function(def){
				def.resolveWith({},[resp == 1,RegistroGuardar]);
		  }).promise();
	 });
}

function guardarDatosLocalmente(RegistroGuardar){

	 var contactos = new Array();

	//Si tengo los datos guardados localmente, los consulto directamente desde ahi
	var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

	// Si hay datos localmente
	if(datos_guardados != null){
		 // Obtengo los datos de los registros previos para no perderlos
		 contactos = datos_guardados;
	}

	// Agrego el contacto actual al arreglo
	contactos.push(RegistroGuardar );

	// Guardo los datos
	window.localStorage.setItem("datos_guardados", JSON.stringify(contactos));

	 // Inicializo el Formulario
	 $('#form1').trigger("reset");
	$("#provincia").val('default');
	$("#provincia").selectpicker("refresh");

	// Alert
	alert('Los datos se guardaron localmente para posterior sincronización.');

	// Actualizo Contador
	actualizarContadorContactosPendientes();
}

function sincronizarContactosPendientes(){

	var total_contactos_pendientes = 0;
	var RegistroGuardar = new Array();

	// Para generar la cola de pensaje pendientes
	var RegistroAux = new Array();

	 //Si tengo los datos guardados localmente, los consulto directamente desde ahi
	 var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

	 // Si hay datos localmente
	 if(datos_guardados != null){


		  $.each( datos_guardados, function( key, value ) {

				total_contactos_pendientes++;

				// Si falla el envio, lo dejo en la lista de pendientes
			enviarRegistro(value).fail(function(result,value) {
				 RegistroAux.push(value );
console.log('Fallo enviarRegistro(): Result: '+result+' - Value: '+ value);
			});

		  });

		// Actualizo los datos que no fueron procesados
		window.localStorage.setItem("datos_guardados", JSON.stringify(RegistroAux));

		// Actualizo Contador
		actualizarContadorContactosPendientes();
	 }
}

function mostrarDatosCotizacion(elemento){

	var arrayGeneral =  [];
	arrayGeneral = eval('array'+getParameters("obj"));

	var Registro =  [];
	Registro = jQuery.grep(arrayGeneral[getParameters("linea")], function( n, i ) {
		return n["modelo"] == unescape(getParameters("modelo")) && n["plan"] == unescape(getParameters("plan"));
	});


	// Cargo el resultado del Cotizador
	$("#"+elemento+"_cant_cuotas").html(getParameters("cuotas"));
	$("#"+elemento+"_total_cuota_mensual").html('$'+Registro[0]["cuotaMensual"]);
	$("#"+elemento+"_precio_vehiculo_iva").html(Registro[0]["precioPublico"]);
	$("#"+elemento+"_tipo_plan").html(Registro[0]["plan"]);
	$("#"+elemento+"_cuota_pura").html(Registro[0]["cuotaPura"]);
	$("#"+elemento+"_gastos_adm_suscrip").html( ((Registro[0]["cargaAdminSuscripcion"].float())+Number(Registro[0]["iva21"])).toFixed(2) );
	$("#"+elemento+"_gastos_adm_suscrip_iva").html(Registro[0]["iva21"]);
	$("#"+elemento+"_alicuota").html(Registro[0]["pagoAdjudicacion30"]);
	$("#"+elemento+"_modelo_cotizador").html(Registro[0]["modelo"]);
	$("#"+elemento+"_nombre_plan_cotizador").html(Registro[0]["plan"]);

	// Actualizacion de la imagen principal
	$("#"+elemento+"_img_ppal").attr("src","images/vehicles/"+getParameters("obj")+"-linea"+getParameters("linea")+".jpg");
}

String.prototype.float = function() {
  return parseFloat(this.replace(',', ''));
}

/* Scroll To */
function doScroll(event){
	var el = $(event.currentTarget);
	var fullUrl = el.attr('href') !== undefined ? el.attr('href') : '';
	var parts, targetEl, trgt, targetOffset, targetTop;
	event.preventDefault();

	targetTop = 0;

	if(fullUrl){
		parts = fullUrl.split("#");
		trgt = parts[1];
		targetEl = $("#" + trgt);
		targetOffset = targetEl.offset();
		targetTop = targetOffset.top;
	}

	$('html, body').animate({scrollTop: targetTop}, 800);
}

$.fn.wait = function (time, type) {
	time = time || 1000;
	type = type || "fx";
	return this.queue(type, function () {
		var self = this;
		setTimeout(function () {
			$(self).dequeue();
		}, time);
	});
};

