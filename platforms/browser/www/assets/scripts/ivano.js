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

	// ============================================ SINCRONIZAR CONTACTOS ======================================================

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


	// ============================================ ENVIAR_COTIZACION_FINAL ======================================================

	$( "#btn_enviar_cotizacion_final" ).click(function() {
		event.preventDefault();


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

	$('#smart_linea').on('changed.bs.select', function (e) {
		actualizarModelos($(this).val(), 'smart');
	});	

	$('#smart_modelos').on('changed.bs.select', function (e) {
		actualizarPlanes( $('#smart_linea').val(),$(this).val(), 'smart');
	});	

	$('#smart_plan').on('changed.bs.select', function (e) {
		actualizarCuotas( $('#smart_linea').val(), $('#smart_modelos').val(), $(this).val(), 'smart');
	});	
});


// VARIABLES

// PICKUP

var arraypickup =  [];
arraypickup[1] = [];
arraypickup[1][0] = [];

arraypickup[1][0] = cargarMatriz("84","Pickup","Plan","0.00","0.00","0.00","0.00","0.00","0.00","0.00","0.00","0.00","0.00","84 meses");


// SMART

var arraysmart =  [];
arraysmart[1] = [];
arraysmart[1][0] = [];
arraysmart[1][1] = [];
arraysmart[1][2] = [];
arraysmart[1][3] = [];
arraysmart[1][4] = [];
arraysmart[1][5] = [];

// Cargo el arreglo
arraysmart[1][0] = cargarMatriz("72","smart","smart forfour passion automatico","450,075.00","315,052.50","6,301.05","1,323.22","7,624.27","4,375.73","525.09","110.27","5,011.09","135,022.50","Plan 70/30");
arraysmart[1][1] = cargarMatriz("72","smart","smart fortwo play","494,200.00","345,940.00","6,918.80","1,452.95","8,371.75","4,804.72","576.57","121.08","5,502.37","148,260.00","Plan 70/30");
arraysmart[1][2] = cargarMatriz("72","smart","smart forfour play","503,025.00","352,117.50","7,042.35","1,478.89","8,521.24","4,890.52","586.86","123.24","5,600.62","150,907.50","Plan 70/30");
arraysmart[1][3] = cargarMatriz("72","smart","smart forfour passion automatico","448290","448290","8965.8","1882.818","10848.618","6226.25","747.15","156.9015","7130.3015","","Plan 100%");
arraysmart[1][4] = cargarMatriz("72","smart","smart fortwo play","492240","492240","9844.8","2067.408","11912.208","6836.666667","820.4","172.284","7829.350667","", "Plan 100%");
arraysmart[1][5] = cargarMatriz("72","smart","smart forfour play","501030","501030","10020.6","2104.326","12124.926","6958.75","835.05","175.3605","7969.1605","", "Plan 100%");


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
arraybus[1][0] = cargarMatriz("72","Interurbanos","OF 1519-52 Euro V","1,879,148.71","1,879,148.71","37,582.97","7,892.42","45,475.39","26,099.29","3,131.91","657.70","29,888.90","0.00","Plan 100%");
arraybus[1][1] = cargarMatriz("72","Interurbanos","OF 1721-59 Euro V","2,011,365.82","2,011,365.82","40,227.32","8,447.74","48,675.06","27,935.64","3,352.28","703.98","31,991.90","0.00","Plan 100%");
arraybus[1][2] = cargarMatriz("72","Interurbanos","O500 M 1826 Euro V","2,438,208.46","2,438,208.46","48,764.17","10,240.48","59,004.65","33,864.01","4,063.68","853.37","38,781.06","0.00","Plan 100%");
arraybus[1][3] = cargarMatriz("72","Interurbanos","O500 U 1826 Euro V","2,498,591.08","2,498,591.08","49,971.82","10,494.08","60,465.90","34,702.65","4,164.32","874.51","39,741.48","0.00","Plan 100%");
arraybus[2][0] = cargarMatriz("72","Midibus","LO 916-45 Euro V","1,170,173.49","1,170,173.49","23,403.47","4,914.73","28,318.20","16,252.41","1,950.29","409.56","18,612.26","0.00","Plan 100%");
arraybus[3][0] = cargarMatriz("72","Plataformas con motor electrónico","O500 RSD 2436 Euro V","3,189,867.95","3,189,867.95","63,797.36","13,397.45","77,194.81","44,303.72","5,316.45","1,116.45","50,736.62","0.00","Plan 100%");
arraybus[4][0] = cargarMatriz("72","Urbanos","OH 1621/55 Euro V","2,205,006.63","2,205,006.63","44,100.13","9,261.03","53,361.16","30,625.09","3,675.01","771.75","35,071.85","0.00","Plan 100%");
arraybus[4][1] = cargarMatriz("72","Urbanos","OH 1721/62 Euro V","2,244,567.66","2,244,567.66","44,891.35","9,427.18","54,318.53","31,174.55","3,740.95","785.60","35,701.10","0.00","Plan 100%");


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
arraycamiones[1][0] = cargarMatriz("84","Livianos ","Accelo 815/37","1,019,524.71","713,667.30","0.00","0.00","0.00","8,496.04","849.60","178.42","9,524.06","305,857.41","Plan 70/30");
arraycamiones[1][1] = cargarMatriz("84","Livianos  ","Accelo 1016/37","1,109,966.42","776,976.50","0.00","0.00","0.00","9,249.72","924.97","194.24","10,368.93","332,989.93","Plan 70/30");
arraycamiones[2][0] = cargarMatriz("72","Medianos","Atego 1419/48","1,455,955.96","1,455,955.96","29,119.12","6,115.02","35,234.14","20,221.61","2,426.59","509.58","23,157.78","0.00","Plan 100%");
arraycamiones[2][1] = cargarMatriz("72","Medianos","Atego 1419/48","1,455,955.96","1,019,169.17","20,383.38","4,280.51","24,663.89","14,155.13","1,698.62","356.71","16,210.46","436,786.79","Plan 70/30");
arraycamiones[3][0] = cargarMatriz("72","Pesados Off Road ","Axor 3131 B/36","2,823,470.14","2,823,470.14","56,469.40","11,858.57","68,327.97","39,214.86","4,705.78","988.21","44,908.85","0.00","Plan 100%");
arraycamiones[3][1] = cargarMatriz("72","Pesados Off Road ","Axor 3131 B/36","2,823,470.14","1,976,429.10","39,528.58","8,301.00","47,829.58","27,450.40","3,294.05","691.75","31,436.20","847,041.04","Plan 70/30");
arraycamiones[3][2] = cargarMatriz("72","Pesados Off Road ","Axor 3131 K/36","2,781,693.63","2,781,693.63","55,633.87","11,683.11","67,316.98","38,634.63","4,636.16","973.59","44,244.38","0.00","Plan 100%");
arraycamiones[3][3] = cargarMatriz("72","Pesados Off Road ","Axor 3131 K/36","2,781,693.63","1,947,185.54","38,943.71","8,178.18","47,121.89","27,044.24","3,245.31","681.52","30,971.07","834,508.09","Plan 70/30");
arraycamiones[3][4] = cargarMatriz("72","Pesados Off Road ","Axor 3131/48 6x4 Cab Ext","2,788,804.53","2,788,804.53","55,776.09","11,712.98","67,489.07","38,733.40","4,648.01","976.08","44,357.49","0.00","Plan 100%");
arraycamiones[3][5] = cargarMatriz("72","Pesados Off Road ","Axor 3131/48 6x4 Cab Ext","2,788,804.53","1,952,163.17","39,043.26","8,199.08","47,242.34","27,113.38","3,253.61","683.26","31,050.25","836,641.36","Plan 70/30");
arraycamiones[4][0] = cargarMatriz("72","Pesados On Road","Actros 1841 LS/36 4x2 Cabina L Dormitorio","3,023,908.52","3,023,908.52","60,478.17","12,700.42","73,178.59","41,998.73","5,039.85","1,058.37","48,096.95","0.00","Plan 100%");
arraycamiones[4][1] = cargarMatriz("72","Pesados On Road","Actros 1841 LS/36 4x2 Cabina L Dormitorio","3,023,908.52","2,116,735.97","42,334.72","8,890.29","51,225.01","29,399.11","3,527.89","740.86","33,667.86","907,172.56","Plan 70/30");
arraycamiones[4][2] = cargarMatriz("72","Pesados On Road","Actros 2041 S/36 4x2 Cabina L Dormitorio","2,961,910.40","2,961,910.40","59,238.21","12,440.02","71,678.23","41,137.64","4,936.52","1,036.67","47,110.83","0.00","Plan 100%");
arraycamiones[4][3] = cargarMatriz("72","Pesados On Road","Actros 2041 S/36 4x2 Cabina L Dormitorio","2,961,910.40","2,073,337.28","41,466.75","8,708.02","50,174.77","28,796.35","3,455.56","725.67","32,977.58","888,573.12","Plan 70/30");
arraycamiones[4][4] = cargarMatriz("72","Pesados On Road","Actros 2041/45 4x2 Cabina L Dormitorio","2,931,022.45","2,931,022.45","58,620.45","12,310.29","70,930.74","40,708.65","4,885.04","1,025.86","46,619.55","0.00","Plan 100%");
arraycamiones[4][5] = cargarMatriz("72","Pesados On Road","Actros 2041/45 4x2 Cabina L Dormitorio","2,931,022.45","2,051,715.71","41,034.31","8,617.21","49,651.52","28,496.05","3,419.53","718.10","32,633.68","879,306.73","Plan 70/30");
arraycamiones[4][6] = cargarMatriz("72","Pesados On Road","Actros 2046 S/36 4x2 Cabina L Dormitorio c/Retarder","3,112,128.08","3,112,128.08","62,242.56","13,070.94","75,313.50","43,224.00","5,186.88","1,089.24","49,500.12","0.00","Plan 100%");
arraycamiones[4][7] = cargarMatriz("72","Pesados On Road","Actros 2046 S/36 4x2 Cabina L Dormitorio c/Retarder","3,112,128.08","2,178,489.65","43,569.79","9,149.66","52,719.45","30,256.80","3,630.82","762.47","34,650.09","933,638.42","Plan 70/30");
arraycamiones[4][8] = cargarMatriz("72","Pesados On Road","Actros 2636 LS/33 6x2 Cabina L Dormitorio Techo Bajo (Combustible)","3,013,464.40","3,013,464.40","60,269.29","12,656.55","72,925.84","41,853.67","5,022.44","1,054.71","47,930.82","0.00","Plan 100%");
arraycamiones[4][9] = cargarMatriz("72","Pesados On Road","Actros 2636 LS/33 6x2 Cabina L Dormitorio Techo Bajo (Combustible)","3,013,464.40","2,109,425.08","42,188.50","8,859.59","51,048.09","29,297.57","3,515.71","738.30","33,551.58","904,039.32","Plan 70/30");
arraycamiones[4][10] = cargarMatriz("72","Pesados On Road","Actros 2646 S/33 6x4 Cabina L Dormitorio","3,530,337.65","3,530,337.65","70,606.75","14,827.42","85,434.17","49,032.47","5,883.90","1,235.62","56,151.99","0.00","Plan 100%");
arraycamiones[4][11] = cargarMatriz("72","Pesados On Road","Actros 2646 S/33 6x4 Cabina L Dormitorio","3,530,337.65","2,471,236.35","49,424.73","10,379.19","59,803.92","34,322.73","4,118.73","864.93","39,306.39","1,059,101.29","Plan 70/30");
arraycamiones[4][12] = cargarMatriz("72","Pesados On Road","Actros 2655 LS/33 6x4 Megaspace - c/Deflectores","3,819,440.01","3,819,440.01","76,388.80","16,041.65","92,430.45","53,047.78","6,365.73","1,336.80","60,750.31","0.00","Plan 100%");
arraycamiones[4][13] = cargarMatriz("72","Pesados On Road","Actros 2655 LS/33 6x4 Megaspace - c/Deflectores","3,819,440.01","2,673,608.01","53,472.16","11,229.15","64,701.31","37,133.44","4,456.01","935.76","42,525.21","1,145,832.00","Plan 70/30");
arraycamiones[4][14] = cargarMatriz("72","Pesados On Road","Atron 1735/51","2,348,151.19","2,348,151.19","46,963.02","9,862.23","56,825.25","32,613.21","3,913.59","821.85","37,348.65","0.00","Plan 100%");
arraycamiones[4][15] = cargarMatriz("72","Pesados On Road","Atron 1735/51","2,348,151.19","1,643,705.83","32,874.12","6,903.57","39,777.69","22,829.25","2,739.51","575.30","26,144.06","704,445.36","Plan 70/30");
arraycamiones[4][16] = cargarMatriz("72","Pesados On Road","Atron 1735S/45","2,381,261.30","2,381,261.30","47,625.23","10,001.30","57,626.53","33,073.07","3,968.77","833.44","37,875.28","0.00","Plan 100%");
arraycamiones[4][17] = cargarMatriz("72","Pesados On Road","Atron 1735S/45","2,381,261.30","1,666,882.91","33,337.66","7,000.91","40,338.57","23,151.15","2,778.14","583.41","26,512.70","714,378.39","Plan 70/30");
arraycamiones[4][18] = cargarMatriz("72","Pesados On Road","Axor 1933 S/36 CD Techo Bajo","2,407,260.51","2,407,260.51","48,145.21","10,110.49","58,255.70","33,434.17","4,012.10","842.54","38,288.81","0.00","Plan 100%");
arraycamiones[4][19] = cargarMatriz("72","Pesados On Road","Axor 1933 S/36 CD Techo Bajo","2,407,260.51","1,685,082.36","33,701.65","7,077.35","40,779.00","23,403.92","2,808.47","589.78","26,802.17","722,178.15","Plan 70/30");
arraycamiones[4][20] = cargarMatriz("72","Pesados On Road","Axor 2036 S/36 CD Techo Elevado","2,741,028.19","2,741,028.19","54,820.56","11,512.32","66,332.88","38,069.84","4,568.38","959.36","43,597.58","0.00","Plan 100%");
arraycamiones[4][21] = cargarMatriz("72","Pesados On Road","Axor 2036 S/36 CD Techo Elevado","2,741,028.19","1,918,719.73","38,374.39","8,058.62","46,433.01","26,648.89","3,197.87","671.55","30,518.31","822,308.46","Plan 70/30");
arraycamiones[4][22] = cargarMatriz("72","Pesados On Road","Axor 2041 S/36 CD Techo Elevado","2,863,246.72","2,863,246.72","57,264.93","12,025.64","69,290.57","39,767.32","4,772.08","1,002.14","45,541.54","0.00","Plan 100%");
arraycamiones[4][23] = cargarMatriz("72","Pesados On Road","Axor 2041 S/36 CD Techo Elevado","2,863,246.72","2,004,272.70","40,085.45","8,417.94","48,503.39","27,837.12","3,340.45","701.49","31,879.06","858,974.02","Plan 70/30");
arraycamiones[5][0] = cargarMatriz("72","Semipesados ","Atego 1720/36 CN","1,489,510.50","1,489,510.50","29,790.21","6,255.94","36,046.15","20,687.65","2,482.52","521.33","23,691.50","0.00","Plan 100%");
arraycamiones[5][1] = cargarMatriz("72","Semipesados ","Atego 1720/36 CN","1,489,510.50","1,042,657.35","20,853.15","4,379.16","25,232.31","14,481.35","1,737.76","364.93","16,584.04","446,853.15","Plan 70/30");
arraycamiones[5][2] = cargarMatriz("72","Semipesados ","Atego 1720/48 CN","1,503,065.64","1,503,065.64","30,061.31","6,312.88","36,374.19","20,875.91","2,505.11","526.07","23,907.09","0.00","Plan 100%");
arraycamiones[5][3] = cargarMatriz("72","Semipesados ","Atego 1720/48 CN","1,503,065.64","1,052,145.95","21,042.92","4,419.01","25,461.93","14,613.14","1,753.58","368.25","16,734.97","450,919.69","Plan 70/30");
arraycamiones[5][4] = cargarMatriz("72","Semipesados ","Atego 1726 A/42 4x4 Cab Ext Versión Civil •","2,487,702.52","2,487,702.52","49,754.05","10,448.35","60,202.40","34,551.42","4,146.17","870.70","39,568.29","0.00","Plan 100%");
arraycamiones[5][5] = cargarMatriz("72","Semipesados ","Atego 1726 A/42 4x4 Cab Ext Versión Civil •","2,487,702.52","1,741,391.77","34,827.84","7,313.85","42,141.69","24,186.00","2,902.32","609.49","27,697.81","746,310.76","Plan 70/30");
arraycamiones[5][6] = cargarMatriz("72","Semipesados ","Atego 1726 S/36 CD con ABS","1,787,723.70","1,787,723.70","35,754.47","7,508.44","43,262.91","24,829.50","2,979.54","625.70","28,434.74","0.00","Plan 100%");
arraycamiones[5][7] = cargarMatriz("72","Semipesados ","Atego 1726 S/36 CD con ABS","1,787,723.70","1,251,406.59","25,028.13","5,255.91","30,284.04","17,380.65","2,085.68","437.99","19,904.32","536,317.11","Plan 70/30");
arraycamiones[5][8] = cargarMatriz("72","Semipesados ","Atego 1726 S/36 CN con ABS","1,715,059.23","1,715,059.23","34,301.18","7,203.25","41,504.43","23,820.27","2,858.43","600.27","27,278.97","0.00","Plan 100%");
arraycamiones[5][9] = cargarMatriz("72","Semipesados ","Atego 1726 S/36 CN con ABS","1,715,059.23","1,200,541.46","24,010.83","5,042.27","29,053.10","16,674.19","2,000.90","420.19","19,095.28","514,517.77","Plan 70/30");
arraycamiones[5][10] = cargarMatriz("72","Semipesados ","Atego 1726/42 CD","1,759,502.33","1,759,502.33","35,190.05","7,389.91","42,579.96","24,437.53","2,932.50","615.83","27,985.86","0.00","Plan 100%");
arraycamiones[5][11] = cargarMatriz("72","Semipesados ","Atego 1726/42 CD","1,759,502.33","1,231,651.63","24,633.03","5,172.94","29,805.97","17,106.27","2,052.75","431.08","19,590.10","527,850.70","Plan 70/30");
arraycamiones[5][12] = cargarMatriz("72","Semipesados ","Atego 1726/42 CN","1,686,171.21","1,686,171.21","33,723.42","7,081.92","40,805.34","23,419.04","2,810.28","590.16","26,819.48","0.00","Plan 100%");
arraycamiones[5][13] = cargarMatriz("72","Semipesados ","Atego 1726/42 CN","1,686,171.21","1,180,319.85","23,606.40","4,957.34","28,563.74","16,393.33","1,967.20","413.11","18,773.64","505,851.36","Plan 70/30");
arraycamiones[5][14] = cargarMatriz("72","Semipesados ","Atego 1726/48 CN","1,704,170.67","1,704,170.67","34,083.41","7,157.52","41,240.93","23,669.04","2,840.28","596.46","27,105.78","0.00","Plan 100%");
arraycamiones[5][15] = cargarMatriz("72","Semipesados ","Atego 1726/48 CN","1,704,170.67","1,192,919.47","23,858.39","5,010.26","28,868.65","16,568.33","1,988.20","417.52","18,974.05","511,251.20","Plan 70/30");
arraycamiones[5][16] = cargarMatriz("72","Semipesados ","Atego 2426/48","1,895,942.65","1,895,942.65","37,918.85","7,962.96","45,881.81","26,332.54","3,159.90","663.58","30,156.02","0.00","Plan 100%");
arraycamiones[5][17] = cargarMatriz("72","Semipesados ","Atego 2426/48","1,895,942.65","1,327,159.85","26,543.20","5,574.07","32,117.27","18,432.78","2,211.93","464.51","21,109.22","568,782.79","Plan 70/30");



// VANS

var arrayvans =  [];
arrayvans[1] = [];
arrayvans[2] = [];
arrayvans[3] = [];

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



arrayvans[1][0] = cargarMatriz("72","Chasis Cabina","Sprinter 415 CDI Chasis 3665 con Aire Acondicionado","819,683.60","573,778.52","11,475.57","2,409.87","13,885.44","7,969.15","956.30","200.82","9,126.27","245,905.08","Plan 70/30");
arrayvans[1][1] = cargarMatriz("72","Chasis Cabina","Sprinter 415 CDI Chasis 3665 con Aire Acondicionado","819,683.60","819,683.60","16,393.67","3,442.67","19,836.34","11,384.49","1,366.14","286.89","13,037.52","0.00","Plan 100%");
arrayvans[1][2] = cargarMatriz("72","Chasis Cabina","Sprinter 515 CDI Chasis 4325 con Aire Acondicionado","895,900.50","627,130.35","12,542.61","2,633.95","15,176.56","8,710.14","1,045.22","219.50","9,974.86","268,770.15","Plan 70/30");
arrayvans[1][3] = cargarMatriz("72","Chasis Cabina","Sprinter 515 CDI Chasis 4325 con Aire Acondicionado","895,900.50","895,900.50","17,918.01","3,762.78","21,680.79","12,443.06","1,493.17","313.57","14,249.80","0.00","Plan 100%");
arrayvans[2][0] = cargarMatriz("72","Combi","Sprinter 415 CDI Combi 3665 15+1 TE","1,231,737.50","862,216.25","17,244.33","3,621.31","20,865.64","11,975.23","1,437.03","301.78","13,714.04","369,521.25","Plan 70/30");
arrayvans[2][1] = cargarMatriz("72","Combi","Sprinter 415 CDI Combi 3665 15+1 TE","1,231,737.50","1,231,737.50","24,634.75","5,173.30","29,808.05","17,107.47","2,052.90","431.11","19,591.48","0.00","Plan 100%");
arrayvans[2][2] = cargarMatriz("72","Combi","Sprinter 415 CDI Combi 3665 9+1 TN","1,250,238.70","875,167.09","17,503.34","3,675.70","21,179.04","12,155.10","1,458.61","306.31","13,920.02","375,071.61","Plan 70/30");
arrayvans[2][3] = cargarMatriz("72","Combi","Sprinter 415 CDI Combi 3665 9+1 TN","1,250,238.70","1,250,238.70","25,004.77","5,251.00","30,255.77","17,364.43","2,083.73","437.58","19,885.74","0.00","Plan 100%");
arrayvans[2][4] = cargarMatriz("72","Combi","Sprinter 515 CDI Combi 4325 19+1","1,517,701.70","1,062,391.19","21,247.82","4,462.04","25,709.86","14,755.43","1,770.65","371.84","16,897.92","455,310.51","Plan 70/30");
arrayvans[2][5] = cargarMatriz("72","Combi","Sprinter 515 CDI Combi 4325 19+1","1,517,701.70","1,517,701.70","30,354.03","6,374.35","36,728.38","21,079.19","2,529.50","531.20","24,139.89","0.00","Plan 100%");
arrayvans[3][0] = cargarMatriz("72","Furgón","Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado","794,345.00","556,041.50","11,120.83","2,335.37","13,456.20","7,722.80","926.74","194.62","8,844.16","238,303.50","Plan 70/30");
arrayvans[3][1] = cargarMatriz("72","Furgón","Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado","794,345.00","794,345.00","15,886.90","3,336.25","19,223.15","11,032.57","1,323.91","278.02","12,634.50","0.00","Plan 100%");
arrayvans[3][2] = cargarMatriz("72","Furgón","Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado","803,595.60","562,516.92","11,250.34","2,362.57","13,612.91","7,812.74","937.53","196.88","8,947.15","241,078.68","Plan 70/30");
arrayvans[3][3] = cargarMatriz("72","Furgón","Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado","803,595.60","803,595.60","16,071.91","3,375.10","19,447.01","11,161.05","1,339.33","281.26","12,781.64","0.00","Plan 100%");
arrayvans[3][4] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado","947,784.30","663,449.01","13,268.98","2,786.49","16,055.47","9,214.57","1,105.75","232.21","10,552.53","284,335.29","Plan 70/30");
arrayvans[3][5] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado","947,784.30","947,784.30","18,955.69","3,980.69","22,936.38","13,163.67","1,579.64","331.72","15,075.03","0.00","Plan 100%");
arrayvans[3][6] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado","927,674.30","649,372.01","12,987.44","2,727.36","15,714.80","9,019.06","1,082.29","227.28","10,328.63","278,302.29","Plan 70/30");
arrayvans[3][7] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado","927,674.30","927,674.30","18,553.49","3,896.23","22,449.72","12,884.37","1,546.12","324.69","14,755.18","0.00","Plan 100%");
arrayvans[3][8] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado","938,935.90","657,255.13","13,145.10","2,760.47","15,905.57","9,128.54","1,095.42","230.04","10,454.00","281,680.77","Plan 70/30");
arrayvans[3][9] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado","938,935.90","938,935.90","18,778.72","3,943.53","22,722.25","13,040.78","1,564.89","328.63","14,934.30","0.00","Plan 100%");
arrayvans[3][10] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado","1,044,111.20","730,877.84","14,617.56","3,069.69","17,687.25","10,151.08","1,218.13","255.81","11,625.02","313,233.36","Plan 70/30");
arrayvans[3][11] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado","1,044,111.20","1,044,111.20","20,882.22","4,385.27","25,267.49","14,501.54","1,740.18","365.44","16,607.16","0.00","Plan 100%");
arrayvans[3][12] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado","1,015,957.20","711,170.04","14,223.40","2,986.91","17,210.31","9,877.36","1,185.28","248.91","11,311.55","304,787.16","Plan 70/30");
arrayvans[3][13] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado","1,015,957.20","1,015,957.20","20,319.14","4,267.02","24,586.16","14,110.52","1,693.26","355.58","16,159.36","0.00","Plan 100%");
arrayvans[3][14] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado","1,024,604.50","717,223.15","14,344.46","3,012.34","17,356.80","9,961.43","1,195.37","251.03","11,407.83","307,381.35","Plan 70/30");
arrayvans[3][15] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado","1,024,604.50","1,024,604.50","20,492.09","4,303.34","24,795.43","14,230.62","1,707.67","358.61","16,296.90","0.00","Plan 100%");
arrayvans[3][16] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado","1,022,392.40","715,674.68","14,313.49","3,005.83","17,319.32","9,939.93","1,192.79","250.49","11,383.21","306,717.72","Plan 70/30");
arrayvans[3][17] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado","1,022,392.40","1,022,392.40","20,447.85","4,294.05","24,741.90","14,199.89","1,703.99","357.84","16,261.72","0.00","Plan 100%");
arrayvans[3][18] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado","994,439.50","696,107.65","13,922.15","2,923.65","16,845.80","9,668.16","1,160.18","243.64","11,071.98","298,331.85","Plan 70/30");
arrayvans[3][19] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado","994,439.50","994,439.50","19,888.79","4,176.65","24,065.44","13,811.66","1,657.40","348.05","15,817.11","0.00","Plan 100%");
arrayvans[3][20] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado","1,005,097.80","703,568.46","14,071.37","2,954.99","17,026.36","9,771.78","1,172.61","246.25","11,190.64","301,529.34","Plan 70/30");
arrayvans[3][21] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado","1,005,097.80","1,005,097.80","20,101.96","4,221.41","24,323.37","13,959.69","1,675.16","351.78","15,986.63","0.00","Plan 100%");
arrayvans[3][22] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado","1,144,862.30","801,403.61","16,028.07","3,365.89","19,393.96","11,130.61","1,335.67","280.49","12,746.77","343,458.69","Plan 70/30");
arrayvans[3][23] = cargarMatriz("72","Furgón","Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado","1,144,862.30","1,144,862.30","22,897.25","4,808.42","27,705.67","15,900.87","1,908.10","400.70","18,209.67","0.00","Plan 100%");
arrayvans[3][24] = cargarMatriz("72","Furgón","Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado","1,185,283.40","829,698.38","16,593.97","3,484.73","20,078.70","11,523.59","1,382.83","290.39","13,196.81","355,585.02","Plan 70/30");
arrayvans[3][25] = cargarMatriz("72","Furgón","Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado","1,185,283.40","1,185,283.40","23,705.67","4,978.19","28,683.86","16,462.27","1,975.47","414.85","18,852.59","0.00","Plan 100%");
arrayvans[3][26] = cargarMatriz("72","Furgón","Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado","1,214,241.80","849,969.26","16,999.39","3,569.87","20,569.26","11,805.13","1,416.62","297.49","13,519.24","364,272.54","Plan 70/30");
arrayvans[3][27] = cargarMatriz("72","Furgón","Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado","1,214,241.80","1,214,241.80","24,284.84","5,099.82","29,384.66","16,864.47","2,023.74","424.99","19,313.20","0.00","Plan 100%");


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
			    //$('#form1').trigger("reset");
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

