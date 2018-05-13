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
		var url_accesso = "http://expoagro.neomedia.com.ar/expoagro";
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
arraybus[1][0] = cargarMatriz("72", "Interurbanos", "OF 1519-52 Euro V", "2.149.200,41", "2.149.200,41", "42.984,01", "9.026,64", "52.010,65", "29.850,01", "3.582,00", "752,22", "34.184,23", "---", "Plan 100%");
arraybus[1][1] = cargarMatriz("72", "Interurbanos", "OF 1721-59 Euro V", "2.300.418,39", "2.300.418,39", "46.008,37", "9.661,76", "55.670,13", "31.950,26", "3.834,03", "805,15", "36.589,44", "---", "Plan 100%");
arraybus[1][2] = cargarMatriz("72", "Interurbanos", "O500 M 1826 Euro V", "2.788.602,42", "2.788.602,42", "55.772,05", "11.712,13", "67.484,18", "38.730,59", "4.647,67", "976,01", "44.354,27", "---", "Plan 100%");
arraybus[1][3] = cargarMatriz("72", "Interurbanos", "O500 U 1826 Euro V", "2.857.662,60", "2.857.662,60", "57.153,25", "12.002,18", "69.155,43", "39.689,76", "4.762,77", "1.000,18", "45.452,71", "---", "Plan 100%");

arraybus[2][0] = cargarMatriz("72", "Midibus", "LO 916-45 Euro V", "1.338.338,65", "1.338.338,65", "26.766,77", "5.621,02", "32.387,79", "18.588,04", "2.230,56", "468,42", "21.287,02", "---", "Plan 100%");

arraybus[3][0] = cargarMatriz("72", "Plataformas con motor electrónico", "O500 RSD 2436 Euro V", "3.648.282,59", "3.648.282,59", "72.965,65", "15.322,79", "88.288,44", "50.670,59", "6.080,47", "1.276,90", "58.027,96", "---", "Plan 100%");

arraybus[4][0] = cargarMatriz("72", "Urbanos", "OH 1621/55 Euro V", "2.521.887,24", "2.521.887,24", "50.437,74", "10.591,93", "61.029,67", "35.026,21", "4.203,15", "882,66", "40.112,02", "---", "Plan 100%");
arraybus[4][1] = cargarMatriz("72", "Urbanos", "OH 1721/62 Euro V", "2.567.133,57", "2.567.133,57", "51.342,67", "10.781,96", "62.124,63", "35.654,63", "4.278,56", "898,50", "40.831,69", "---", "Plan 100%");


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

arraycamiones[4][0] = cargarMatriz("72", "Pesados On Road", "Atron 1735S/45", "2.682.553,25", "1.877.787,28", "37.555,75", "7.886,71", "45.442,46", "26.080,38", "3.129,65", "657,23", "29.867,26", "804.765,98", "Plan 70/30");
arraycamiones[4][1] = cargarMatriz("72", "Pesados On Road", "Atron 1735/51", "2.645.193,20", "1.851.635,24", "37.032,70", "7.776,87", "44.809,57", "25.717,16", "3.086,06", "648,07", "29.451,29", "793.557,96", "Plan 70/30");
arraycamiones[4][2] = cargarMatriz("72", "Pesados On Road", "Axor 1933 S/36 CD Techo Bajo", "2.712.034,65", "1.898.424,26", "37.968,49", "7.973,38", "45.941,87", "26.367,00", "3.164,04", "664,45", "30.195,49", "813.610,40", "Plan 70/30");
arraycamiones[4][3] = cargarMatriz("72", "Pesados On Road", "Axor 2036 S/36 CD Techo Elevado", "3.134.940,25", "2.194.458,18", "43.889,16", "9.216,72", "53.105,88", "30.478,59", "3.657,43", "768,06", "34.904,08", "940.482,08", "Plan 70/30");
arraycamiones[4][4] = cargarMatriz("72", "Pesados On Road", "Axor 2041 S/36 CD Techo Elevado", "3.274.722,75", "2.292.305,93", "45.846,12", "9.627,69", "55.473,81", "31.837,58", "3.820,51", "802,31", "36.460,40", "982.416,83", "Plan 70/30");
arraycamiones[4][5] = cargarMatriz("72", "Pesados On Road", "Actros 1841 LS/36 4x2 Cabina L Dormitorio", "3.458.473,20", "2.420.931,24", "48.418,62", "10.167,91", "58.586,53", "33.624,05", "4.034,89", "847,33", "38.506,27", "1.037.541,96", "Plan 70/30");
arraycamiones[4][6] = cargarMatriz("72", "Pesados On Road", "Actros 2041 S/36 4x2 Cabina L Dormitorio", "3.387.565,35", "2.371.295,75", "47.425,91", "9.959,44", "57.385,35", "32.934,66", "3.952,16", "829,95", "37.716,77", "1.016.269,61", "Plan 70/30");
arraycamiones[4][7] = cargarMatriz("72", "Pesados On Road", "Actros 2041/45 4x2 Cabina L Dormitorio", "3.382.736,50", "2.367.915,55", "47.358,31", "9.945,25", "57.303,56", "32.887,72", "3.946,53", "828,77", "37.663,02", "1.014.820,95", "Plan 70/30");
arraycamiones[4][8] = cargarMatriz("72", "Pesados On Road", "Actros 2636 LS/33 6x2 Cabina L Dormitorio Techo Bajo (Combustible)", "3.446.528,15", "2.412.569,71", "48.251,39", "10.132,79", "58.384,18", "33.507,91", "4.020,95", "844,40", "38.373,26", "1.033.958,45", "Plan 70/30");
arraycamiones[4][9] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 LS/37 4x2", "3.527.602,00", "2.469.321,40", "49.386,43", "10.371,15", "59.757,58", "34.296,13", "4.115,54", "864,26", "39.275,93", "1.058.280,60", "Plan 70/30");
arraycamiones[4][10] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 L/46 4x2", "3.450.340,40", "2.415.238,28", "48.304,77", "10.144,00", "58.448,77", "33.544,98", "4.025,40", "845,33", "38.415,71", "1.035.102,12", "Plan 70/30");
arraycamiones[4][11] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2048 LS/37 4x2", "3.818.857,90", "2.673.200,53", "53.464,01", "11.227,44", "64.691,45", "37.127,79", "4.455,33", "935,62", "42.518,74", "1.145.657,37", "Plan 70/30");
arraycamiones[4][12] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2636 LS/33 6x2 (liviano combustible CMT 50Tn)", "3.515.402,80", "2.460.781,96", "49.215,64", "10.335,28", "59.550,92", "34.177,53", "4.101,30", "861,27", "39.140,10", "1.054.620,84", "Plan 70/30");
arraycamiones[4][13] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2645 LS/33 6x2 (55tN / Briten 60Tn)", "3.779.210,50", "2.645.447,35", "52.908,95", "11.110,88", "64.019,83", "36.742,32", "4.409,08", "925,91", "42.077,31", "1.133.763,15", "Plan 70/30");
arraycamiones[4][14] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2651 LS/40 6x4 (Bitren 75 Tn)", "4.239.476,15", "2.967.633,31", "59.352,67", "12.464,06", "71.816,73", "41.217,13", "4.946,06", "1.038,67", "47.201,86", "1.271.842,85", "Plan 70/30");
arraycamiones[4][15] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 3342 S/36 6x4 Cabina M - Toma de fuerza en caja", "3.854.947,20", "2.698.463,04", "53.969,26", "11.333,54", "65.302,80", "37.478,65", "4.497,44", "944,46", "42.920,55", "1.156.484,16", "Plan 70/30");
arraycamiones[4][16] = cargarMatriz("72", "Pesados On Road", "Atron 1735S/45", "2.682.553,25", "2.682.553,25", "53.651,07", "11.266,72", "64.917,79", "37.257,68", "4.470,92", "938,89", "42.667,49", "---", "Plan 100%");
arraycamiones[4][17] = cargarMatriz("72", "Pesados On Road", "Atron 1735/51", "2.645.193,20", "2.645.193,20", "52.903,86", "11.109,81", "64.013,67", "36.738,79", "4.408,65", "925,82", "42.073,26", "---", "Plan 100%");
arraycamiones[4][18] = cargarMatriz("72", "Pesados On Road", "Axor 1933 S/36 CD Techo Bajo", "2.712.034,65", "2.712.034,65", "54.240,69", "11.390,54", "65.631,23", "37.667,15", "4.520,06", "949,21", "43.136,42", "---", "Plan 100%");
arraycamiones[4][19] = cargarMatriz("72", "Pesados On Road", "Axor 2036 S/36 CD Techo Elevado", "3.134.940,25", "3.134.940,25", "62.698,81", "13.166,75", "75.865,56", "43.540,84", "5.224,90", "1.097,23", "49.862,97", "---", "Plan 100%");
arraycamiones[4][20] = cargarMatriz("72", "Pesados On Road", "Axor 2041 S/36 CD Techo Elevado", "3.274.722,75", "3.274.722,75", "65.494,46", "13.753,84", "79.248,30", "45.482,26", "5.457,87", "1.146,15", "52.086,28", "---", "Plan 100%");
arraycamiones[4][21] = cargarMatriz("72", "Pesados On Road", "Actros 1841 LS/36 4x2 Cabina L Dormitorio", "3.458.473,20", "3.458.473,20", "69.169,46", "14.525,59", "83.695,05", "48.034,35", "5.764,12", "1.210,47", "55.008,94", "---", "Plan 100%");
arraycamiones[4][22] = cargarMatriz("72", "Pesados On Road", "Actros 2041 S/36 4x2 Cabina L Dormitorio", "3.387.565,35", "3.387.565,35", "67.751,31", "14.227,78", "81.979,09", "47.049,52", "5.645,94", "1.185,65", "53.881,11", "---", "Plan 100%");
arraycamiones[4][23] = cargarMatriz("72", "Pesados On Road", "Actros 2041/45 4x2 Cabina L Dormitorio", "3.382.736,50", "3.382.736,50", "67.654,73", "14.207,49", "81.862,22", "46.982,45", "5.637,89", "1.183,96", "53.804,30", "---", "Plan 100%");
arraycamiones[4][24] = cargarMatriz("72", "Pesados On Road", "Actros 2636 LS/33 6x2 Cabina L Dormitorio Techo Bajo (Combustible)", "3.446.528,15", "3.446.528,15", "68.930,56", "14.475,42", "83.405,98", "47.868,45", "5.744,21", "1.206,28", "54.818,94", "---", "Plan 100%");
arraycamiones[4][25] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 LS/37 4x2", "3.527.602,00", "3.527.602,00", "70.552,04", "14.815,93", "85.367,97", "48.994,47", "5.879,34", "1.234,66", "56.108,47", "---", "Plan 100%");
arraycamiones[4][26] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 L/46 4x2", "3.450.340,40", "3.450.340,40", "69.006,81", "14.491,43", "83.498,24", "47.921,39", "5.750,57", "1.207,62", "54.879,58", "---", "Plan 100%");
arraycamiones[4][27] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2048 LS/37 4x2", "3.818.857,90", "3.818.857,90", "76.377,16", "16.039,20", "92.416,36", "53.039,69", "6.364,76", "1.336,60", "60.741,05", "---", "Plan 100%");
arraycamiones[4][28] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2636 LS/33 6x2 (liviano combustible CMT 50Tn)", "3.515.402,80", "3.515.402,80", "70.308,06", "14.764,69", "85.072,75", "48.825,04", "5.859,00", "1.230,39", "55.914,43", "---", "Plan 100%");
arraycamiones[4][29] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2645 LS/33 6x2 (55tN / Briten 60Tn)", "3.779.210,50", "3.779.210,50", "75.584,21", "15.872,68", "91.456,89", "52.489,03", "6.298,68", "1.322,72", "60.110,43", "---", "Plan 100%");
arraycamiones[4][30] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2651 LS/40 6x4 (Bitren 75 Tn)", "4.239.476,15", "4.239.476,15", "84.789,52", "17.805,80", "102.595,32", "58.881,61", "7.065,79", "1.483,82", "67.431,22", "---", "Plan 100%");

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
arraycamiones[5][17] = cargarMatriz("72", "Semipesados", "Atego 1726 A/42 4x4 Cab Ext Versión Civil •", "2.745.582,45", "2.745.582,45", "54.911,65", "11.531,45", "66.443,10", "38.133,09", "4.575,97", "960,95", "43.670,01", "---", "Plan 100%");






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


arrayvans[1][0] = cargarMatriz("72", "Chasis Cabina", "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado", "937.480,00", "656.236,00", "13.124,72", "2.756,19", "15.880,91", "9.114,39", "1.093,73", "229,68", "10.437,80", "281.244,00", "Plan 70/30");
arrayvans[1][1] = cargarMatriz("72", "Chasis Cabina", "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado", "1.024.650,00", "717.255,00", "14.345,10", "3.012,47", "17.357,57", "9.961,88", "1.195,43", "251,04", "11.408,35", "307.395,00", "Plan 70/30");
arrayvans[1][2] = cargarMatriz("72", "Chasis Cabina", "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado", "937.480,00", "937.480,00", "18.749,60", "3.937,42", "22.687,02", "13.020,56", "1.562,47", "328,12", "14.911,15", "---", "Plan 100%");
arrayvans[1][3] = cargarMatriz("72", "Chasis Cabina", "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado", "1.024.650,00", "1.024.650,00", "20.493,00", "4.303,53", "24.796,53", "14.231,25", "1.707,75", "358,63", "16.297,63", "---", "Plan 100%");

arrayvans[2][0] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 9+1 TN", "1.429.910,00", "1.000.937,00", "20.018,74", "4.203,94", "24.222,68", "13.901,90", "1.668,23", "350,33", "15.920,46", "428.973,00", "Plan 70/30");
arrayvans[2][1] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 15+1 TE", "1.408.750,00", "986.125,00", "19.722,50", "4.141,73", "23.864,23", "13.696,18", "1.643,54", "345,14", "15.684,86", "422.625,00", "Plan 70/30");
arrayvans[2][2] = cargarMatriz("72", "Combi", "Sprinter 515 CDI Combi 4325 19+1", "1.735.810,00", "1.215.067,00", "24.301,34", "5.103,28", "29.404,62", "16.875,93", "2.025,11", "425,27", "19.326,31", "520.743,00", "Plan 70/30");
arrayvans[2][3] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 9+1 TN", "1.429.910,00", "1.429.910,00", "28.598,20", "6.005,62", "34.603,82", "19.859,86", "2.383,18", "500,47", "22.743,51", "---", "Plan 100%");
arrayvans[2][4] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 15+1 TE", "1.408.750,00", "1.408.750,00", "28.175,00", "5.916,75", "34.091,75", "19.565,97", "2.347,92", "493,06", "22.406,95", "---", "Plan 100%");
arrayvans[2][5] = cargarMatriz("72", "Combi", "Sprinter 515 CDI Combi 4325 19+1", "1.735.810,00", "1.735.810,00", "34.716,20", "7.290,40", "42.006,60", "24.108,47", "2.893,02", "607,53", "27.609,02", "---", "Plan 100%");

arrayvans[3][0] = cargarMatriz("84", "Furgon", "Vito CDI Furgón Versión 1 con aire acondicionado", "770.499,95", "539.349,96", "0,00", "0,00", "0,00", "6.420,83", "642,08", "134,84", "7.197,75", "231.149,98", "Plan 70/30");
arrayvans[3][1] = cargarMatriz("84", "Furgon", "Vito CDI Furgón Versión 2 con aire acondicionado", "780.849,95", "546.594,97", "0,00", "0,00", "0,00", "6.507,08", "650,71", "136,65", "7.294,44", "234.254,99", "Plan 70/30");
arrayvans[3][2] = cargarMatriz("84", "Furgon", "Vito CDI Furgón Mixto con aire acondicionado - PEA2", "811.670,00", "568.169,00", "11.363,38", "2.386,31", "13.749,69", "6.763,92", "811,67", "170,45", "7.746,04", "243.501,00", "Plan 70/30");
arrayvans[3][3] = cargarMatriz("84", "Furgon", "Vito CDI Furgón Mixto con aire acondicionado", "811.670,00", "568.169,00", "0,00", "0,00", "0,00", "6.763,92", "676,39", "142,04", "7.582,35", "243.501,00", "Plan 70/30");
arrayvans[3][4] = cargarMatriz("84", "Furgon", "Vito CDI Furgón Mixto X con aire acondicionado", "851.000,00", "595.700,00", "0,00", "0,00", "0,00", "7.091,67", "709,17", "148,93", "7.949,77", "255.300,00", "Plan 70/30");
arrayvans[3][5] = cargarMatriz("84", "Furgon", "Vito CDI Furgón Plus con aire acondicionado", "894.700,00", "626.290,00", "0,00", "0,00", "0,00", "7.455,83", "745,58", "156,57", "8.357,98", "268.410,00", "Plan 70/30");
arrayvans[3][6] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado", "908.500,00", "635.950,00", "12.719,00", "2.670,99", "15.389,99", "8.832,64", "1.059,92", "222,58", "10.115,14", "272.550,00", "Plan 70/30");
arrayvans[3][7] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado", "919.080,00", "643.356,00", "12.867,12", "2.702,10", "15.569,22", "8.935,50", "1.072,26", "225,17", "10.232,93", "275.724,00", "Plan 70/30");
arrayvans[3][8] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado", "1.060.990,00", "742.693,00", "14.853,86", "3.119,31", "17.973,17", "10.315,18", "1.237,82", "259,94", "11.812,94", "318.297,00", "Plan 70/30");
arrayvans[3][9] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado", "1.083.990,00", "758.793,00", "15.175,86", "3.186,93", "18.362,79", "10.538,79", "1.264,65", "265,58", "12.069,02", "325.197,00", "Plan 70/30");
arrayvans[3][10] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado", "1.073.870,00", "751.709,00", "15.034,18", "3.157,18", "18.191,36", "10.440,40", "1.252,85", "263,10", "11.956,35", "322.161,00", "Plan 70/30");
arrayvans[3][11] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado", "1.137.350,00", "796.145,00", "15.922,90", "3.343,81", "19.266,71", "11.057,57", "1.326,91", "278,65", "12.663,13", "341.205,00", "Plan 70/30");
arrayvans[3][12] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado", "1.169.320,00", "818.524,00", "16.370,48", "3.437,80", "19.808,28", "11.368,39", "1.364,21", "286,48", "13.019,08", "350.796,00", "Plan 70/30");
arrayvans[3][13] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado", "1.149.540,00", "804.678,00", "16.093,56", "3.379,65", "19.473,21", "11.176,08", "1.341,13", "281,64", "12.798,85", "344.862,00", "Plan 70/30");
arrayvans[3][14] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado", "1.161.960,00", "813.372,00", "16.267,44", "3.416,16", "19.683,60", "11.296,83", "1.355,62", "284,68", "12.937,13", "348.588,00", "Plan 70/30");
arrayvans[3][15] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado", "1.194.160,00", "835.912,00", "16.718,24", "3.510,83", "20.229,07", "11.609,89", "1.393,19", "292,57", "13.295,65", "358.248,00", "Plan 70/30");
arrayvans[3][16] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado", "1.171.850,00", "820.295,00", "16.405,90", "3.445,24", "19.851,14", "11.392,99", "1.367,16", "287,10", "13.047,25", "351.555,00", "Plan 70/30");
arrayvans[3][17] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.309.390,00", "916.573,00", "18.331,46", "3.849,61", "22.181,07", "12.730,18", "1.527,62", "320,80", "14.578,60", "392.817,00", "Plan 70/30");
arrayvans[3][18] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.355.620,00", "948.934,00", "18.978,68", "3.985,52", "22.964,20", "13.179,64", "1.581,56", "332,13", "15.093,33", "406.686,00", "Plan 70/30");
arrayvans[3][19] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado", "1.388.740,00", "972.118,00", "19.442,36", "4.082,90", "23.525,26", "13.501,64", "1.620,20", "340,24", "15.462,08", "416.622,00", "Plan 70/30");
arrayvans[3][20] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado", "908.500,00", "908.500,00", "18.170,00", "3.815,70", "21.985,70", "12.618,06", "1.514,17", "317,98", "14.450,21", "---", "Plan 100%");
arrayvans[3][21] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado", "919.080,00", "919.080,00", "18.381,60", "3.860,14", "22.241,74", "12.765,00", "1.531,80", "321,68", "14.618,48", "---", "Plan 100%");
arrayvans[3][22] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado", "1.060.990,00", "1.060.990,00", "21.219,80", "4.456,16", "25.675,96", "14.735,97", "1.768,32", "371,35", "16.875,64", "---", "Plan 100%");
arrayvans[3][23] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado", "1.083.990,00", "1.083.990,00", "21.679,80", "4.552,76", "26.232,56", "15.055,42", "1.806,65", "379,40", "17.241,47", "---", "Plan 100%");
arrayvans[3][24] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado", "1.073.870,00", "1.073.870,00", "21.477,40", "4.510,25", "25.987,65", "14.914,86", "1.789,78", "375,85", "17.080,49", "---", "Plan 100%");
arrayvans[3][25] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado", "1.137.350,00", "1.137.350,00", "22.747,00", "4.776,87", "27.523,87", "15.796,53", "1.895,58", "398,07", "18.090,18", "---", "Plan 100%");
arrayvans[3][26] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado", "1.169.320,00", "1.169.320,00", "23.386,40", "4.911,14", "28.297,54", "16.240,56", "1.948,87", "409,26", "18.598,69", "---", "Plan 100%");
arrayvans[3][27] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado", "1.149.540,00", "1.149.540,00", "22.990,80", "4.828,07", "27.818,87", "15.965,83", "1.915,90", "402,34", "18.284,07", "---", "Plan 100%");
arrayvans[3][28] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado", "1.161.960,00", "1.161.960,00", "23.239,20", "4.880,23", "28.119,43", "16.138,33", "1.936,60", "406,69", "18.481,62", "---", "Plan 100%");
arrayvans[3][29] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado", "1.194.160,00", "1.194.160,00", "23.883,20", "5.015,47", "28.898,67", "16.585,56", "1.990,27", "417,96", "18.993,79", "---", "Plan 100%");
arrayvans[3][30] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado", "1.171.850,00", "1.171.850,00", "23.437,00", "4.921,77", "28.358,77", "16.275,69", "1.953,08", "410,15", "18.638,92", "---", "Plan 100%");
arrayvans[3][31] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.309.390,00", "1.309.390,00", "26.187,80", "5.499,44", "31.687,24", "18.185,97", "2.182,32", "458,29", "20.826,58", "---", "Plan 100%");
arrayvans[3][32] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.355.620,00", "1.355.620,00", "27.112,40", "5.693,60", "32.806,00", "18.828,06", "2.259,37", "474,47", "21.561,90", "---", "Plan 100%");
arrayvans[3][33] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado", "1.388.740,00", "1.388.740,00", "27.774,80", "5.832,71", "33.607,51", "19.288,06", "2.314,57", "486,06", "22.088,69", "---", "Plan 100%");

arrayvans[4][0] = cargarMatriz("84", "Pasajeros", "Vito Combi", "917.700,00", "642.390,00", "0,00", "0,00", "0,00", "7.647,50", "764,75", "160,60", "8.572,85", "275.310,00", "Plan 70/30");
arrayvans[4][1] = cargarMatriz("84", "Pasajeros", "Vito Tourer", "1.055.700,00", "738.990,00", "0,00", "0,00", "0,00", "8.797,50", "879,75", "184,75", "9.862,00", "316.710,00", "Plan 70/30");


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

