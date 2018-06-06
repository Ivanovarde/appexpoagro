$(window).bind('load', function () {

	$('#preloader').addClass('off');
	window.setTimeout(function () {
		$('#preloader').remove();
	}, 1500);

	//Verifico si existe la URL de acceso al BackOffice
	var url_backoffice = window.localStorage.getItem("url_backoffice");

	// Si hay datos localmente
	if (url_backoffice != null) {
		url_accesso = url_backoffice;
	}
	//else{ // Si no existe, preseteo uno
	//	//var url_accesso = "http://expoagro.neomedia.com.ar/expoagro";
	//	url_accesso = "http://planahorromb.neomedia.com.ar/cms";
	//}

	// Analizo los parametros del Cotizador
	if (window.location.pathname.search("/cotizacion.html") != -1) {

		mostrarDatosCotizacion('cotizador');

		// Actulizacion de las imagenes del Pie
		$("#cotizador_img1_cotizador").attr("src", "images/vehicles/450x270-" + getParameters("obj") + "1.jpg");
		$("#cotizador_img2_cotizador").attr("src", "images/vehicles/450x270-" + getParameters("obj") + "2.jpg");
	}

	// Analizo los parametros del Formulario de Cotizador
	if (window.location.pathname.search("/formulario.html") != -1) {
		mostrarDatosCotizacion('form');

		// Si es el caso de Plan 84, agrego un clase para ocultar encabezado
		if (getParameters("obj") == "pickup") {
			$("#encabezado_formulario").addClass("no-info");

		} else { // Saco la clase no-info
			$("#encabezado_formulario").removeClass("no-info");
		}

	}

});

$(window).on('scroll', function (e) {

});

jQuery(document).ready(function () {

	actualizarContadorContactosPendientes();


	// ============================================ SET URL BACKOFFICE ======================================================

	$("#btn_backoffice").click(function () {


		var url_ingresada = prompt("Ingrese la URL del BackOffice", url_accesso);

		if (url_ingresada != null) {

			// Guardo los datos
			window.localStorage.setItem("url_backoffice", url_ingresada);
			url_accesso = url_ingresada;
		}

	});

	// ======================================= SINCRONIZAR CONTACTOS ======================================================

	$("#btn_contactos_pendientes").click(function () {

		var contadorAux = 0;

		//Si tengo datos guardados localmente, los consulto directamente desde ahi
		var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

		// Si no estoy conectado a Internet, cancelo
		if (isConnected) {

			// Si hay datos localmente
			if (datos_guardados != null && datos_guardados.length != 0) {
				contadorAux = datos_guardados.length;

				if (confirm('¿Desea sincronizar los contactos locales?')) {
					sincronizarContactosPendientes();
				}
			} else {
				alert('No hay contactos para sincronizar.')
			}
		} else {
			alert('No se puede iniciar la sincronización porque no hay conexión a Internet.')
		}

	});


	// ======================================== ENVIAR_COTIZACION_FINAL ====================================================

	$("#btn_enviar_cotizacion_final").click(function (event) {
		event.preventDefault();

		// Valido que el formulario no este vacio
		if ($("#nombre").val() != "" && $("#apellido").val() != "" && $("#email").val() != "" && $("#telefono").val() != "" && $("#provincia").val() != "" && $("#ciudad").val() != "") {

			// Cargo Loading...
			$("#btn_enviar_cotizacion_final").html("Enviando...");

			var arrayGeneral = [];
			arrayGeneral = eval('array' + getParameters("obj"));

			var Registro = [];
			Registro = jQuery.grep(arrayGeneral[getParameters("linea")], function (n, i) {
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
			if (isConnected) {

				// Si falla el envio, lo guardo localmente
				enviarRegistro(RegistroGuardar)
					.fail(function (result, RegistroGuardar) {
						guardarDatosLocalmente(RegistroGuardar);

						// Saco Loading...
						$("#btn_enviar_cotizacion_final").html("Enviar cotización");


					}).done(function (result, RegistroGuardar) {

						// Saco Loading...
						$("#btn_enviar_cotizacion_final").html("Enviar cotización");
					});


			} else { // Si no estoy conectado a Internet, guardo los datos localmente para sync posteriormente

				guardarDatosLocalmente(RegistroGuardar);
			}

		} else {
			alert('Se debe completar el formulario antes de enviarlo...');
		}


	});

	// ============================================ ENVIAR_COTIZACION ======================================================

	$("#btn_enviar_cotizacion").click(function () {

		var arrayGeneral = [];
		arrayGeneral = eval('array' + getParameters("obj"));

		var Registro = [];
		Registro = jQuery.grep(arrayGeneral[getParameters("linea")], function (n, i) {
			return n["modelo"] == unescape(getParameters("modelo")) && n["plan"] == unescape(getParameters("plan"));
		});


		var linea = getParameters("linea");
		var modelo = Registro[0]["modelo"];
		var plan = Registro[0]["plan"];
		var cuotas = Registro[0]["cuotas"];


		// Armo la URL del Formulario Cotizador
		var urlParameter = '';

		if (linea != '' && modelo != '' && plan != '' && cuotas != '') {
			urlParameter = 'obj=' + escape(getParameters("obj")) + '&linea=' + escape(linea) + '&modelo=' + escape(modelo) + '&plan=' + escape(plan) + '&cuotas=' + escape(cuotas);

			window.location.href = "formulario.html?" + urlParameter;
		} else {
			alert('Faltan elegir opciones para la cotización');
		}

	});

	// ============================================ BUSES ======================================================

	$('#bus_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'bus');
	});

	$('#bus_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes($('#bus_linea').val(), $(this).val(), 'bus');
	});

	$('#bus_plan').on('changed.bs.select', function (e) {
		actualizarCuotas($('#bus_linea').val(), $('#bus_modelos').val(), $(this).val(), 'bus');
	});

	// ============================================ CAMIONES ======================================================

	$('#camiones_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'camiones');
	});

	$('#camiones_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes($('#camiones_linea').val(), $(this).val(), 'camiones');
	});

	$('#camiones_plan').on('changed.bs.select', function (e) {
		actualizarCuotas($('#camiones_linea').val(), $('#camiones_modelos').val(), $(this).val(), 'camiones');
	});

	// ============================================ VANS ======================================================

	$('#vans_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'vans');
	});

	$('#vans_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes($('#vans_linea').val(), $(this).val(), 'vans');
	});

	$('#vans_plan').on('changed.bs.select', function (e) {
		actualizarCuotas($('#vans_linea').val(), $('#vans_modelos').val(), $(this).val(), 'vans');
	});

	// ============================================ PICKUP ======================================================

	$('#pickup_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'pickup');
	});

	$('#pickup_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes($('#pickup_linea').val(), $(this).val(), 'pickup');
	});

	$('#pickup_plan').on('changed.bs.select', function (e) {
		actualizarCuotas($('#pickup_linea').val(), $('#pickup_modelos').val(), $(this).val(), 'pickup');
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

var arraypickup = [];
arraypickup[1] = [];
arraypickup[1][0] = [];

arraypickup[1][0] = cargarMatriz("84", "Pickup", "Plan", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "84 meses");


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
var arraybus = [];
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
var arraycamiones = [];
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

arraycamiones[1][0] = cargarMatriz("84", "Livianos ", "Accelo 815/37", "1.265.407,10", "885.784,97", "0,00", "0,00", "0,00", "10.545,06", "1.054,51", "221,45", "11.821,01", "379.622,13", "Plan 70/30");
arraycamiones[1][1] = cargarMatriz("84", "Livianos  ", "Accelo 1016/37", "1.377.660,96", "964.362,67", "0,00", "0,00", "0,00", "11.480,51", "1.148,05", "241,09", "12.869,65", "413.298,29", "Plan 70/30");

arraycamiones[2][0] = cargarMatriz("72", "Medianos", "Atego 1419/48", "1.717.732,22", "1.202.412,56", "24.048,25", "5.050,13", "29.098,38", "16.700,17", "2.004,02", "420,84", "19.125,04", "515.319,67", "Plan 70/30");
arraycamiones[2][1] = cargarMatriz("72", "Medianos", "Atego 1419/48", "1.582.846,20", "1.582.846,20", "31.656,92", "6.647,95", "38.304,87", "21.983,98", "2.638,08", "554,00", "25.176,06", "---", "Plan 100%");

arraycamiones[3][0] = cargarMatriz("72", "Pesados Off Road ", "Arocs 3342 K/36 Cabina M - Toma de fuerza en caja", "4.175.733,12", "2.923.013,18", "58.460,26", "12.276,66", "70.736,92", "40.597,41", "4.871,69", "1.023,05", "46.492,15", "1.252.719,94", "Plan 70/30");
arraycamiones[3][1] = cargarMatriz("72", "Pesados Off Road ", "Arocs 4136 B/42 8x4 Cabina M -Toma de fuerza en motor en caja", "4.455.126,62", "3.118.588,64", "62.371,77", "13.098,07", "75.469,85", "43.313,73", "5.197,65", "1.091,51", "49.602,88", "1.336.537,99", "Plan 70/30");
arraycamiones[3][2] = cargarMatriz("72", "Pesados Off Road ", "Arocs 4845 K/48 8x4 Cabina M - Toma de fuerza en caja", "4.817.538,34", "3.372.276,84", "67.445,54", "14.163,56", "81.609,10", "46.837,18", "5.620,46", "1.180,30", "53.637,94", "1.445.261,50", "Plan 70/30");
arraycamiones[3][3] = cargarMatriz("72", "Pesados Off Road ", "Axor 3131 B/36", "3.451.737,12", "2.416.215,98", "48.324,32", "10.148,11", "58.472,43", "33.558,56", "4.027,03", "845,68", "38.431,26", "1.035.521,14", "Plan 70/30");
arraycamiones[3][4] = cargarMatriz("72", "Pesados Off Road ", "Axor 3131 K/36", "3.400.712,64", "2.380.498,85", "47.609,98", "9.998,10", "57.608,07", "33.062,48", "3.967,50", "833,17", "37.863,16", "1.020.213,79", "Plan 70/30");
arraycamiones[3][5] = cargarMatriz("72", "Pesados Off Road ", "Axor 3131/48 6x4 Cab Ext", "3.409.538,50", "2.386.676,95", "47.733,54", "10.024,04", "57.757,58", "33.148,29", "3.977,79", "835,34", "37.961,42", "1.022.861,55", "Plan 70/30");
arraycamiones[3][6] = cargarMatriz("72", "Pesados Off Road", "Nuevo Actros 3342 S/36 6x4 Cabina M - Toma de fuerza en caja", "3.854.947,20", "3.854.947,20", "77.098,94", "16.190,78", "93.289,72", "53.540,93", "6.424,91", "1.349,23", "61.315,07", "---", "Plan 100%");
arraycamiones[3][7] = cargarMatriz("72", "Pesados Off Road", "Arocs 3342 K/36 Cabina M - Toma de fuerza en caja", "3.847.831,00", "3.847.831,00", "76.956,62", "16.160,89", "93.117,51", "53.442,10", "6.413,05", "1.346,74", "61.201,89", "---", "Plan 100%");
arraycamiones[3][8] = cargarMatriz("72", "Pesados Off Road", "Arocs 4136 B/42 8x4 Cabina M -Toma de fuerza en motor en caja", "4.105.284,95", "4.105.284,95", "82.105,70", "17.242,20", "99.347,90", "57.017,85", "6.842,14", "1.436,85", "65.296,84", "---", "Plan 100%");
arraycamiones[3][9] = cargarMatriz("72", "Pesados Off Road", "Arocs 4845 K/48 8x4 Cabina M - Toma de fuerza en caja", "4.439.238,05", "4.439.238,05", "88.784,76", "18.644,80", "107.429,56", "61.656,08", "7.398,73", "1.553,73", "70.608,54", "---", "Plan 100%");
arraycamiones[3][10] = cargarMatriz("72", "Pesados Off Road", "Axor 3131 B/36", "3.180.687,25", "3.180.687,25", "63.613,75", "13.358,89", "76.972,64", "44.176,21", "5.301,15", "1.113,24", "50.590,60", "---", "Plan 100%");
arraycamiones[3][11] = cargarMatriz("72", "Pesados Off Road", "Axor 3131 K/36", "3.133.669,50", "3.133.669,50", "62.673,39", "13.161,41", "75.834,80", "43.523,19", "5.222,78", "1.096,78", "49.842,75", "---", "Plan 100%");
arraycamiones[3][12] = cargarMatriz("72", "Pesados Off Road", "Axor 3131/48 6x4 Cab Ext", "3.141.802,30", "3.141.802,30", "62.836,05", "13.195,57", "76.031,62", "43.636,14", "5.236,34", "1.099,63", "49.972,11", "---", "Plan 100%");

arraycamiones[4][0] = cargarMatriz("72", "Pesados On Road", "Atron 1735S/45", "2.911.153,44", "2.037.807,41", "40.756,15", "8.558,79", "49.314,94", "28.302,88", "3.396,35", "713,23", "32.412,46", "873.346,03", "Plan 70/30");
arraycamiones[4][1] = cargarMatriz("72", "Pesados On Road", "Atron 1735/51", "2.870.609,66", "2.009.426,76", "40.188,54", "8.439,59", "48.628,13", "27.908,71", "3.349,04", "703,30", "31.961,05", "861.182,90", "Plan 70/30");
arraycamiones[4][2] = cargarMatriz("72", "Pesados On Road", "Axor 1933 S/36 CD Techo Bajo", "2.943.147,17", "2.060.203,02", "41.204,06", "8.652,85", "49.856,91", "28.613,93", "3.433,67", "721,07", "32.768,67", "882.944,15", "Plan 70/30");
arraycamiones[4][3] = cargarMatriz("72", "Pesados On Road", "Axor 2036 S/36 CD Techo Elevado", "3.402.091,68", "2.381.464,18", "47.629,28", "10.002,15", "57.631,43", "33.075,89", "3.969,11", "833,51", "37.878,51", "1.020.627,50", "Plan 70/30");
arraycamiones[4][4] = cargarMatriz("72", "Pesados On Road", "Axor 2041 S/36 CD Techo Elevado", "3.553.786,08", "2.487.650,26", "49.753,01", "10.448,13", "60.201,14", "34.550,70", "4.146,08", "870,68", "39.567,46", "1.066.135,82", "Plan 70/30");
arraycamiones[4][5] = cargarMatriz("72", "Pesados On Road", "Actros 1841 LS/36 4x2 Cabina L Dormitorio", "3.753.195,26", "2.627.236,68", "52.544,73", "11.034,39", "63.579,13", "36.489,40", "4.378,73", "919,53", "41.787,66", "1.125.958,58", "Plan 70/30");
arraycamiones[4][6] = cargarMatriz("72", "Pesados On Road", "Actros 2041 S/36 4x2 Cabina L Dormitorio", "3.676.244,83", "2.573.371,38", "51.467,43", "10.808,16", "62.275,59", "35.741,27", "4.288,95", "900,68", "40.930,90", "1.102.873,45", "Plan 70/30");
arraycamiones[4][7] = cargarMatriz("72", "Pesados On Road", "Actros 2041/45 4x2 Cabina L Dormitorio", "3.671.004,48", "2.569.703,14", "51.394,06", "10.792,75", "62.186,82", "35.690,32", "4.282,84", "899,40", "40.872,56", "1.101.301,34", "Plan 70/30");
arraycamiones[4][8] = cargarMatriz("72", "Pesados On Road", "Actros 2636 LS/33 6x2 Cabina L Dormitorio Techo Bajo (Combustible)", "3.740.232,29", "2.618.162,60", "52.363,25", "10.996,28", "63.359,53", "36.363,37", "4.363,60", "916,36", "41.643,33", "1.122.069,69", "Plan 70/30");
arraycamiones[4][9] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 LS/37 4x2", "3.828.215,04", "2.679.750,53", "53.595,01", "11.254,95", "64.849,96", "37.218,76", "4.466,25", "937,91", "42.622,92", "1.148.464,51", "Plan 70/30");
arraycamiones[4][10] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2042 L/46 4x2", "3.744.369,41", "2.621.058,59", "52.421,17", "11.008,45", "63.429,62", "36.403,59", "4.368,43", "917,37", "41.689,39", "1.123.310,82", "Plan 70/30");
arraycamiones[4][11] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2048 LS/37 4x2", "4.144.291,01", "2.901.003,71", "58.020,07", "12.184,22", "70.204,29", "40.291,72", "4.835,01", "1.015,35", "46.142,08", "1.243.287,30", "Plan 70/30");
arraycamiones[4][12] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2636 LS/33 6x2 (liviano combustible CMT 50Tn)", "3.814.976,26", "2.670.483,38", "53.409,67", "11.216,03", "64.625,70", "37.090,05", "4.450,81", "934,67", "42.475,52", "1.144.492,88", "Plan 70/30");
arraycamiones[4][13] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2645 LS/33 6x2 (55tN / Briten 60Tn)", "4.101.264,96", "2.870.885,47", "57.417,71", "12.057,72", "69.475,43", "39.873,41", "4.784,81", "1.004,81", "45.663,03", "1.230.379,49", "Plan 70/30");
arraycamiones[4][14] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 2651 LS/40 6x4 (Bitren 75 Tn)", "4.600.753,25", "3.220.527,27", "64.410,55", "13.526,21", "77.936,76", "44.729,55", "5.367,55", "1.127,18", "51.224,28", "1.380.225,97", "Plan 70/30");
arraycamiones[4][15] = cargarMatriz("72", "Pesados On Road", "Nuevo Actros 3342 S/36 6x4 Cabina M - Toma de fuerza en caja", "4.183.455,74", "2.928.419,02", "58.568,38", "12.299,36", "70.867,74", "40.672,49", "4.880,70", "1.024,95", "46.578,13", "1.255.036,72", "Plan 70/30");

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

arraycamiones[5][0] = cargarMatriz("72", "Semipesados ", "Atego 1720/36 CN", "1.793.303,62", "1.255.312,53", "25.106,25", "5.272,31", "30.378,56", "17.434,90", "2.092,19", "439,36", "19.966,44", "537.991,08", "Plan 70/30");
arraycamiones[5][1] = cargarMatriz("72", "Semipesados ", "Atego 1720/48 CN", "1.809.576,29", "1.266.703,40", "25.334,07", "5.320,15", "30.654,22", "17.593,10", "2.111,17", "443,35", "20.147,62", "542.872,89", "Plan 70/30");
arraycamiones[5][2] = cargarMatriz("72", "Semipesados ", "Atego 1726 S/36 CN con ABS", "2.054.217,98", "1.437.952,59", "28.759,05", "6.039,40", "34.798,45", "19.971,56", "2.396,59", "503,28", "22.871,43", "616.265,40", "Plan 70/30");
arraycamiones[5][3] = cargarMatriz("72", "Semipesados ", "Atego 1726 S/36 CD con ABS", "2.141.097,50", "1.498.768,25", "29.975,37", "6.294,83", "36.270,19", "20.816,23", "2.497,95", "524,57", "23.838,74", "642.329,25", "Plan 70/30");
arraycamiones[5][4] = cargarMatriz("72", "Semipesados ", "Atego 1726/42 CN", "2.019.466,18", "1.413.626,32", "28.272,53", "5.937,23", "34.209,76", "19.633,70", "2.356,04", "494,77", "22.484,51", "605.839,85", "Plan 70/30");
arraycamiones[5][5] = cargarMatriz("72", "Semipesados ", "Atego 1726/42 CD", "2.107.448,93", "1.475.214,25", "29.504,28", "6.195,90", "35.700,18", "20.489,09", "2.458,69", "516,32", "23.464,10", "632.234,68", "Plan 70/30");
arraycamiones[5][6] = cargarMatriz("72", "Semipesados ", "Atego 1726/48 CN", "2.041.255,01", "1.428.878,51", "28.577,57", "6.001,29", "34.578,86", "19.845,53", "2.381,46", "500,11", "22.727,11", "612.376,50", "Plan 70/30");
arraycamiones[5][7] = cargarMatriz("72", "Semipesados ", "Atego 2426/48", "2.270.727,26", "1.589.509,08", "31.790,18", "6.675,94", "38.466,12", "22.076,52", "2.649,18", "556,33", "25.282,03", "681.218,18", "Plan 70/30");
arraycamiones[5][8] = cargarMatriz("72", "Semipesados ", "Atego 1726 A/42 4x4 Cab Ext Versión Civil", "2.979.553,82", "2.085.687,68", "41.713,75", "8.759,89", "50.473,64", "28.967,88", "3.476,15", "729,99", "33.174,02", "893.866,15", "Plan 70/30");
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
var arrayvans = [];
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
arrayvans[4][0] = [];
arrayvans[4][1] = [];
arrayvans[4][2] = [];


arrayvans[1][0] = cargarMatriz("72", "Chasis Cabina", "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado", "1.017.369,60", "712.158,72", "14.243,17", "2.991,07", "17.234,24", "9.891,09", "1.186,93", "249,26", "11.327,28", "305.210,88", "Plan 70/30");
arrayvans[1][1] = cargarMatriz("72", "Chasis Cabina", "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado", "1.111.968,00", "778.377,60", "15.567,55", "3.269,19", "18.836,74", "10.810,80", "1.297,30", "272,43", "12.380,53", "333.590,40", "Plan 70/30");
arrayvans[1][2] = cargarMatriz("72", "Chasis Cabina", "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado", "968.050,00", "968.050,00", "19.361,00", "4.065,81", "23.426,81", "13.445,14", "1.613,42", "338,82", "15.397,37", "-", "Plan 100%");
arrayvans[1][3] = cargarMatriz("72", "Chasis Cabina", "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado", "1.058.062,50", "1.058.062,50", "21.161,25", "4.443,86", "25.605,11", "14.695,31", "1.763,44", "370,32", "16.829,07", "-", "Plan 100%");

arrayvans[2][0] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 9+1 TN", "1.551.763,20", "1.086.234,24", "21.724,68", "4.562,18", "26.286,87", "15.086,59", "1.810,39", "380,18", "17.277,16", "465.528,96", "Plan 70/30");
arrayvans[2][1] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 15+1 TE", "1.528.800,00", "1.070.160,00", "21.403,20", "4.494,67", "25.897,87", "14.863,33", "1.783,60", "374,56", "17.021,49", "458.640,00", "Plan 70/30");
arrayvans[2][2] = cargarMatriz("72", "Combi", "Sprinter 515 CDI Combi 4325 19+1", "1.883.731,20", "1.318.611,84", "26.372,24", "5.538,17", "31.910,41", "18.314,05", "2.197,69", "461,51", "20.973,25", "565.119,36", "Plan 70/30");
arrayvans[2][3] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 9+1 TN", "1.476.537,50", "1.476.537,50", "29.530,75", "6.201,46", "35.732,21", "20.507,47", "2.460,90", "516,79", "23.485,15", "-", "Plan 100%");
arrayvans[2][4] = cargarMatriz("72", "Combi", "Sprinter 415 CDI Combi 3665 15+1 TE", "1.454.687,50", "1.454.687,50", "29.093,75", "6.109,69", "35.203,44", "20.203,99", "2.424,48", "509,14", "23.137,61", "-", "Plan 100%");
arrayvans[2][5] = cargarMatriz("72", "Combi", "Sprinter 515 CDI Combi 4325 19+1", "1.792.412,50", "1.792.412,50", "35.848,25", "7.528,13", "43.376,38", "24.894,62", "2.987,35", "627,34", "28.509,32", "-", "Plan 100%");

arrayvans[3][0] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado", "985.920,00", "690.144,00", "13.802,88", "2.898,60", "16.701,48", "9.585,33", "1.150,24", "241,55", "10.977,12", "295.776,00", "Plan 70/30");
arrayvans[3][1] = cargarMatriz("72", "Furgón", "Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado", "997.401,60", "698.181,12", "13.963,62", "2.932,36", "16.895,98", "9.696,96", "1.163,64", "244,36", "11.104,96", "299.220,48", "Plan 70/30");
arrayvans[3][2] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado", "1.151.404,80", "805.983,36", "16.119,67", "3.385,13", "19.504,80", "11.194,21", "1.343,31", "282,09", "12.819,61", "345.421,44", "Plan 70/30");
arrayvans[3][3] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado", "1.176.364,80", "823.455,36", "16.469,11", "3.458,51", "19.927,62", "11.436,88", "1.372,43", "288,21", "13.097,51", "352.909,44", "Plan 70/30");
arrayvans[3][4] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado", "1.165.382,40", "815.767,68", "16.315,35", "3.426,22", "19.741,58", "11.330,11", "1.359,61", "285,52", "12.975,24", "349.614,72", "Plan 70/30");
arrayvans[3][5] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado", "1.234.272,00", "863.990,40", "17.279,81", "3.628,76", "20.908,57", "11.999,87", "1.439,98", "302,40", "13.742,25", "370.281,60", "Plan 70/30");
arrayvans[3][6] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado", "1.268.966,40", "888.276,48", "17.765,53", "3.730,76", "21.496,29", "12.337,17", "1.480,46", "310,90", "14.128,53", "380.689,92", "Plan 70/30");
arrayvans[3][7] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado", "1.247.500,80", "873.250,56", "17.465,01", "3.667,65", "21.132,66", "12.128,48", "1.455,42", "305,64", "13.889,54", "374.250,24", "Plan 70/30");
arrayvans[3][8] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado", "1.260.979,20", "882.685,44", "17.653,71", "3.707,28", "21.360,99", "12.259,52", "1.471,14", "308,94", "14.039,60", "378.293,76", "Plan 70/30");
arrayvans[3][9] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado", "1.295.923,20", "907.146,24", "18.142,92", "3.810,01", "21.952,94", "12.599,25", "1.511,91", "317,50", "14.428,66", "388.776,96", "Plan 70/30");
arrayvans[3][10] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado", "1.271.712,00", "890.198,40", "17.803,97", "3.738,83", "21.542,80", "12.363,87", "1.483,66", "311,57", "14.159,10", "381.513,60", "Plan 70/30");
arrayvans[3][11] = cargarMatriz("72", "Furgón", "Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.420.972,80", "994.680,96", "19.893,62", "4.177,66", "24.071,28", "13.815,01", "1.657,80", "348,14", "15.820,95", "426.291,84", "Plan 70/30");
arrayvans[3][12] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado", "1.471.142,40", "1.029.799,68", "20.595,99", "4.325,16", "24.921,15", "14.302,77", "1.716,33", "360,43", "16.379,54", "441.342,72", "Plan 70/30");
arrayvans[3][13] = cargarMatriz("72", "Furgón", "Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado", "1.507.084,80", "1.054.959,36", "21.099,19", "4.430,83", "25.530,02", "14.652,21", "1.758,27", "369,24", "16.779,71", "452.125,44", "Plan 70/30");
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
arrayvans[3][28] = cargarMatriz("84", "Furgon", "CDI Furgón Versión 1 con aire acondicionado", "836.159,94", "585.311,96", "0,00", "0,00", "0,00", "6.968,00", "696,80", "146,33", "7.811,13", "250.847,98", "Plan 70/30");
arrayvans[3][29] = cargarMatriz("84", "Furgon", "CDI Furgón Versión 2 con aire acondicionado", "847.391,95", "593.174,36", "0,00", "0,00", "0,00", "7.061,60", "706,16", "148,29", "7.916,05", "254.217,58", "Plan 70/30");
arrayvans[3][30] = cargarMatriz("84", "Furgon", "CDI Furgón Mixto con aire acondicionado", "880.838,40", "616.586,88", "0,00", "0,00", "0,00", "7.340,32", "734,03", "154,15", "8.228,50", "264.251,52", "Plan 70/30");
arrayvans[3][31] = cargarMatriz("84", "Furgon", "CDI Furgón Mixto X con aire acondicionado", "950.976,00", "665.683,20", "0,00", "0,00", "0,00", "7.924,80", "792,48", "166,42", "8.883,70", "285.292,80", "Plan 70/30");
arrayvans[3][32] = cargarMatriz("84", "Furgon", "CDI Furgón Plus con aire acondicionado", "1.010.880,00", "707.616,00", "0,00", "0,00", "0,00", "8.424,00", "842,40", "176,90", "9.443,30", "303.264,00", "Plan 70/30");

arrayvans[4][0] = cargarMatriz("84", "Pasajeros", "Vito Combi", "995.904,00", "697.132,80", "0,00", "0,00", "0,00", "8.299,20", "829,92", "174,28", "9.303,40", "298.771,20", "Plan 70/30");
arrayvans[4][1] = cargarMatriz("84", "Pasajeros", "Tourer AT", "1.546.455,05", "1.082.518,53", "0,00", "0,00", "0,00", "12.887,13", "1.288,71", "270,63", "14.446,47", "463.936,51", "Plan 70/30");
arrayvans[4][2] = cargarMatriz("84", "Pasajeros", "Tourer AT X", "1.558.238,69", "1.090.767,08", "0,00", "0,00", "0,00", "12.985,32", "1.298,53", "272,69", "14.556,55", "467.471,61", "Plan 70/30");



// FUNCTIONS

function cargarMatriz(cuota, linea, modelo, precioPublico, precioPublico100, derechoSuscripcion, iva, totalSuscripcion, cuotaPura, cargaAdminSuscripcion, iva21, cuotaMensual, pagoAdjudicacion30, plan) {
	var array_aux = [];

	array_aux["modelo"] = modelo;
	array_aux["linea"] = linea;
	array_aux["plan"] = plan;
	array_aux["cuotas"] = cuota;
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

function obtenerModelos(arregloGeneral, linea) {

	var arregloModelos = [];

	for (var i = 0; i < arregloGeneral[linea].length; i++) {
		arregloModelos.push(arregloGeneral[linea][i]);
	}

	return arregloModelos;
}

function obtenerPlanes(arregloGeneral, linea, modelo) {

	var arregloPlanes = [];

	arregloPlanes = jQuery.grep(arregloGeneral[linea], function (n, i) {
		return n["modelo"] == modelo;
	});

	return arregloPlanes;
}

function obtenerCuotas(arregloGeneral, linea, modelo, plan) {

	var arregloCuotas = [];

	arregloCuotas = jQuery.grep(arregloGeneral[linea], function (n, i) {
		return n["modelo"] == modelo && n["plan"] == plan;
	});

	return arregloCuotas;
}

function getParameters(k) {
	var p = {};
	location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
		p[k] = v
	})
	return k ? p[k] : p;
}

function cotizar(objeto) {

	var arrayAux = [];
	arrayAux = eval('array' + objeto);

	var linea = $('#' + objeto + '_linea').val();
	var modelo = $('#' + objeto + '_modelos').val();
	var plan = $('#' + objeto + '_plan').val();
	var cuotas = $('#' + objeto + '_cuotas').val();

	// Armo la URL del Cotizador
	var urlParameter = '';

	if (linea != '' && modelo != '' && plan != '' && cuotas != '') {
		urlParameter = 'obj=' + escape(objeto) + '&linea=' + escape(linea) + '&modelo=' + escape(modelo) + '&plan=' + escape(plan) + '&cuotas=' + escape(cuotas);

		window.location.href = "cotizacion.html?" + urlParameter;
	} else {
		alert('Faltan elegir opciones para la cotización');
	}
}

function actualizarModelos(linea, objeto) {

	// Vacio la lista
	$("#" + objeto + "_modelos").empty().append('<option value="" selected="">Modelo</option>');
	$("#" + objeto + "_modelos").selectpicker("refresh");
	$("#" + objeto + "_plan").empty().append('<option value="" selected="">Plan</option>');
	$("#" + objeto + "_plan").selectpicker("refresh");
	$("#" + objeto + "_cuotas").empty().append('<option value="" selected="">Cuotas</option>');
	$("#" + objeto + "_cuotas").selectpicker("refresh");

	// Obtengo los Modelos de la linea seleccionada
	var Modelos = obtenerModelos(eval('array' + objeto), linea);

	var arregloAux = [];

	// Actualizo los modelos segun la linea elegida
	for (var i = 0; i < Modelos.length; i++) {

		if ($.inArray(Modelos[i]["modelo"], arregloAux) == -1) {

			arregloAux.push(Modelos[i]["modelo"]);

			$("#" + objeto + "_modelos").append('<option value="' + Modelos[i]["modelo"] + '" >' + Modelos[i]["modelo"] + '</option>');
			$("#" + objeto + "_modelos").selectpicker("refresh");
		}
	}

}

function actualizarPlanes(linea, modelo, objeto) {

	// Vacio la lista de Planes
	$("#" + objeto + "_plan").empty().append('<option value="" selected="">Plan</option>');
	$("#" + objeto + "_plan").selectpicker("refresh");
	$("#" + objeto + "_cuotas").empty().append('<option value="" selected="">Cuotas</option>');
	$("#" + objeto + "_cuotas").selectpicker("refresh");

	// Obtengo los Planes del Modelo seleccionado
	var Planes = obtenerPlanes(eval('array' + objeto), linea, modelo);

	// Actualizo los planes segun el modelo elejido
	for (var i = 0; i < Planes.length; i++) {

		$("#" + objeto + "_plan").append('<option value="' + Planes[i]["plan"] + '" >' + Planes[i]["plan"] + '</option>');
		$("#" + objeto + "_plan").selectpicker("refresh");
	}

}

function actualizarCuotas(linea, modelo, plan, objeto) {

	// Vacio la lista de Planes
	$("#" + objeto + "_cuotas").empty().append('<option value="" selected="">Cuotas</option>');

	// Obtengo las cuotas del Plan seleccionado
	var Cuotas = obtenerCuotas(eval('array' + objeto), linea, modelo, plan);

	// Actualizo las cuotas segun el plan elejido
	for (var i = 0; i < Cuotas.length; i++) {

		$("#" + objeto + "_cuotas").append('<option value="' + Cuotas[i]["cuotas"] + '" >' + Cuotas[i]["cuotas"] + '</option>');
		$("#" + objeto + "_cuotas").selectpicker("refresh");
	}
}

function actualizarContadorContactosPendientes() {

	var contadorAux = 0;

	//Si tengo los datos guardados localmente, los consulto directamente desde ahi
	var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

	// Si hay datos localmente
	if (datos_guardados != null) {
		contadorAux = datos_guardados.length;
	}

	// ACtualizo el Bubble Count de Contactos Pendientes
	$('#total_contactos_pendientes').html(contadorAux);
}

function enviarRegistro(RegistroGuardar) {

	//check if station is alive
	return $.ajax({
		type: 'GET',
		url: url_accesso + '/sync_data.php?datos_guardados=' + JSON.stringify(RegistroGuardar),
		dataType: "jsonp",
		jsonpCallback: "expojson_sync",
		charset: 'UTF-8',
		success: function (data) {

			// Si no hubo error
			if (String(data.error).toLowerCase() == "false") {

				// Vacio los registros offline
				//window.localStorage.removeItem("datos_guardados");

				// Los datos se sincronizaron con éxito.
				alert(data.mensaje);

				// Inicializo el Formulario
				$('#form1').trigger("reset");
				$("#provincia").val('default');
				$("#provincia").selectpicker("refresh");

			} else {
				alert(data.mensaje);
			}

		},
		beforeSend: function () {
			// This callback function will trigger before data is sent
		},
		complete: function () {
			// This callback function will trigger on data sent/received complete
		},
		error: function (httpReq, status, exception) {
			console.log(status + " " + exception);
		}
	}).then(function (resp) {
		return $.Deferred(function (def) {
			def.resolveWith({}, [resp == 1, RegistroGuardar]);
		}).promise();
	});
}

function guardarDatosLocalmente(RegistroGuardar) {

	var contactos = new Array();

	//Si tengo los datos guardados localmente, los consulto directamente desde ahi
	var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

	// Si hay datos localmente
	if (datos_guardados != null) {
		// Obtengo los datos de los registros previos para no perderlos
		contactos = datos_guardados;
	}

	// Agrego el contacto actual al arreglo
	contactos.push(RegistroGuardar);

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

function sincronizarContactosPendientes() {

	var total_contactos_pendientes = 0;
	var RegistroGuardar = new Array();

	// Para generar la cola de pensaje pendientes
	var RegistroAux = new Array();

	//Si tengo los datos guardados localmente, los consulto directamente desde ahi
	var datos_guardados = JSON.parse(window.localStorage.getItem("datos_guardados"));

	// Si hay datos localmente
	if (datos_guardados != null) {


		$.each(datos_guardados, function (key, value) {

			total_contactos_pendientes++;

			// Si falla el envio, lo dejo en la lista de pendientes
			enviarRegistro(value).fail(function (result, value) {
				RegistroAux.push(value);
				console.log('Fallo enviarRegistro(): Result: ' + result + ' - Value: ' + value);
			});

		});

		// Actualizo los datos que no fueron procesados
		window.localStorage.setItem("datos_guardados", JSON.stringify(RegistroAux));

		// Actualizo Contador
		actualizarContadorContactosPendientes();
	}
}

function mostrarDatosCotizacion(elemento) {

	var cargaAdminSuscripcion = '';
	var iva21 = '';
	var arrayGeneral = [];
	arrayGeneral = eval('array' + getParameters("obj"));

	var Registro = [];
	Registro = jQuery.grep(arrayGeneral[getParameters("linea")], function (n, i) {
		return n["modelo"] == unescape(getParameters("modelo")) && n["plan"] == unescape(getParameters("plan"));
	});

	cargaAdminSuscripcion = Registro[0]["cargaAdminSuscripcion"].numberCleanComma();
	iva21 = Registro[0]["iva21"].numberCleanComma();

	// Cargo el resultado del Cotizador
	$("#" + elemento + "_cant_cuotas").html(getParameters("cuotas"));
	$("#" + elemento + "_total_cuota_mensual").html('$' + Registro[0]["cuotaMensual"]);
	$("#" + elemento + "_precio_vehiculo_iva").html(Registro[0]["precioPublico"]);
	$("#" + elemento + "_tipo_plan").html(Registro[0]["plan"]);
	$("#" + elemento + "_cuota_pura").html(Registro[0]["cuotaPura"]);
	$("#" + elemento + "_gastos_adm_suscrip").html( (cargaAdminSuscripcion.float() + iva21.float()).toFixed(2) );

	//$("#" + elemento + "_gastos_adm_suscrip").html( (parseFloat(Registro[0]["cargaAdminSuscripcion"]) + parseFloat(Registro[0]["iva21"])).toFixed(2) );
	$("#" + elemento + "_gastos_adm_suscrip_iva").html(Registro[0]["iva21"]);
	$("#" + elemento + "_alicuota").html(Registro[0]["pagoAdjudicacion30"]);
	$("#" + elemento + "_modelo_cotizador").html(Registro[0]["modelo"]);
	$("#" + elemento + "_nombre_plan_cotizador").html(Registro[0]["plan"]);

	// Actualizacion de la imagen principal
	$("#" + elemento + "_img_ppal").attr("src", "images/vehicles/" + getParameters("obj") + "-linea" + getParameters("linea") + ".jpg");
}

String.prototype.float = function () {
	return parseFloat(this.replace(',', ''));
}

/* Scroll To */
function doScroll(event) {
	var el = $(event.currentTarget);
	var fullUrl = el.attr('href') !== undefined ? el.attr('href') : '';
	var parts, targetEl, trgt, targetOffset, targetTop;
	event.preventDefault();

	targetTop = 0;

	if (fullUrl) {
		parts = fullUrl.split("#");
		trgt = parts[1];
		targetEl = $("#" + trgt);
		targetOffset = targetEl.offset();
		targetTop = targetOffset.top;
	}

	$('html, body').animate({
		scrollTop: targetTop
	}, 800);
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

String.prototype.numberCleanComma = function(){
	var number = this;
	var parts = number.split(',');

	for(var i = 0; i < parts.length; i++){
		parts[i] = parts[i].replace(/\./g,'');
	}

	return parts.join('.');
};

Number.prototype.formatMoney = function(c, d, t){
	 var n = this,
	 c = isNaN(c = Math.abs(c)) ? 2 : c,
	 d = d == undefined ? "," : d,
	 t = t == undefined ? "." : t,
	 s = n < 0 ? "-" : "",
	 i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
	 j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };
