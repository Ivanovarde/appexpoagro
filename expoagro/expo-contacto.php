<?php
/*----------------------------------------------------------------------*/
/* Validación de seguridad								                */
/*----------------------------------------------------------------------*/
	include("expo-seguridad.php");
/*----------------------------------------------------------------------*/
/* Extracción de los datos del archivo de configuración                 */
/*----------------------------------------------------------------------*/
	include("expo-db.php");
	include("expo-funciones.php");
	require_once("3wlab-mail.php");

/*----------------------------------------------------------------------*/
/* Genero la Conexión a la Base de Datos								*/
/*----------------------------------------------------------------------*/
	$db = mysql_connect(HOST, USUARIO, PASSWORD);
	mysql_select_db(DATABASE,$db);

/*----------------------------------------------------------------------*/
/* Armo el Resultado de la Busqueda										*/
/*----------------------------------------------------------------------*/

	// Agrego los filtros
	if(isset($_POST["busq_nombre"]) AND $_POST["busq_nombre"] <> "" AND $_POST["buscar"] == "S"){
		$sql_where[2] = " AND t1.nombre LIKE '%".$_POST["busq_nombre"]."%' ";
	}else{
		$sql_where[2] = "";
	}



	// Agrego los filtros
	if(isset($_POST["busq_apellido"]) AND $_POST["busq_apellido"] <> "" AND $_POST["buscar"] == "S"){
		$sql_where[3] = " AND t1.apellido LIKE '%".$_POST["busq_apellido"]."%' ";
	}else{
		$sql_where[3] = "";
	}



	// Agrego los filtros
	if(isset($_POST["busq_email"]) AND $_POST["busq_email"] <> "" AND $_POST["buscar"] == "S"){
		$sql_where[4] = " AND t1.email LIKE '%".$_POST["busq_email"]."%' ";
	}else{
		$sql_where[4] = "";
	}



	// Agrego los filtros
	if(isset($_POST["busq_telefono"]) AND $_POST["busq_telefono"] <> "" AND $_POST["buscar"] == "S"){
		$sql_where[5] = " AND t1.telefono LIKE '%".$_POST["busq_telefono"]."%' ";
	}else{
		$sql_where[5] = "";
	}

	// Agrego los filtros
	if(isset($_POST["busq_envio_emails"]) AND $_POST["busq_envio_emails"] <> "" AND $_POST["buscar"] == "S"){
		$sql_where[6] = " AND t1.envio_emails = '".$_POST["busq_envio_emails"]."' ";
	}else{
		$sql_where[6] = "";
	}

	// Agrego los filtros
	if(isset($_POST["busq_tipo_vehiculo"]) AND $_POST["busq_tipo_vehiculo"] <> "" AND $_POST["buscar"] == "S"){
		$sql_where[7] = " AND t1.tipo_vehiculo = '".$_POST["busq_tipo_vehiculo"]."' ";
	}else{
		$sql_where[7] = "";
	}



/*----------------------------------------------------------------------*/
/* Borro el Registro Seleccionado										*/
/*----------------------------------------------------------------------*/

	if(isset($_POST["actualizar"]) AND $_POST["actualizar"] == "S"){

		$db = mysql_connect(HOST, USUARIO, PASSWORD);
		mysql_select_db(DATABASE,$db);

		 // Si se pulsó el BTN ELIMINAR
		if(isset($_POST["Eliminar"]) AND $_POST["Eliminar"] == "Eliminar"){
			foreach ($_POST["array_id"] as $campo_id_unico_actual) {
				$sql = "DELETE FROM contactos WHERE id = '$campo_id_unico_actual';";
				$result = mysql_query($sql,$db);
			}
		}


		if($_POST["Emails"] == "Enviar Emails"){ // Si se pulsÛ el BTN ELIMINAR

			if(isset($_POST["array_id"]) AND !empty($_POST["array_id"])){
				foreach ($_POST["array_id"] as $campo_id_unico_actual) {


					/*----------------------------------------------------------------------*/
					/* Armo el Resultado de la Busqueda										*/
					/*----------------------------------------------------------------------*/

						$sql = "
							SELECT t1.id, t1.nombre, t1.apellido, t1.email, t1.telefono, t1.provincia, t1.ciudad, t1.modelo, t1.plan, t1.cuotas, t1.created, t1.envio_emails, t1.tipo_vehiculo, t1.linea, t1.precioPublico, t1.cuotaPura, t1.cargaAdminSuscripcion, t1.iva21, t1.cuotaMensual, t1.pagoAdjudicacion30
							FROM contactos AS t1
							WHERE t1.id = '$campo_id_unico_actual';
						";

						$result = mysql_query($sql,$db);
						if ($myrow = mysql_fetch_array($result)) {
							$id_aux = $myrow["id"];
							$nombre = ucfirst(strtolower(utf8_encode($myrow["nombre"])));
							$apellido = ucfirst(strtolower(utf8_encode($myrow["apellido"])));
							$email = strtolower(utf8_encode($myrow["email"]));
							$telefono = utf8_encode($myrow["telefono"]);
							$provincia = utf8_encode($myrow["provincia"]);
							$ciudad = ucfirst(strtolower(utf8_encode($myrow["ciudad"])));
							$modelo = utf8_encode($myrow["modelo"]);
							$plan = utf8_encode($myrow["plan"]);
							$cuotas = utf8_encode($myrow["cuotas"]);
							$created = utf8_encode($myrow["created"]);
							$tipo_vehiculo = ($myrow["tipo_vehiculo"]);
							$linea = utf8_encode($myrow["linea"]);
							$precioPublico = utf8_encode($myrow["precioPublico"]);
							$cuotaPura = utf8_encode($myrow["cuotaPura"]);
							$cargaAdminSuscripcion = utf8_encode($myrow["cargaAdminSuscripcion"]);
							$iva21 = utf8_encode($myrow["iva21"]);
							$cuotaMensual = utf8_encode($myrow["cuotaMensual"]);
							$pagoAdjudicacion30 = utf8_encode($myrow["pagoAdjudicacion30"]);


							// Determino la img del vehiculo
							switch ($tipo_vehiculo) {

								case 'Bus':
									$img_newsletter = "buses.jpg";
								break;

								case 'Camión':
									$img_newsletter = "trucks.jpg";
									$acentos = array('á','é','í','ó','ú');
									$vocales = array('a','e','i','o','u');
									$modelo_corregido = str_replace($acentos, $vocales, utf8_decode($modelo));

									switch($modelo_corregido){
										case "Arocs 3342 K/36 Cabina M - Toma de fuerza en caja":
										case "Arocs 4136 B/42 8x4 Cabina M -Toma de fuerza en motor en caja":
										case "Arocs 4845 K/48 8x4 Cabina M - Toma de fuerza en caja":
										case "Arocs 3342 K/36 Cabina M - Toma de fuerza en caja":
										case "Arocs 4136 B/42 8x4 Cabina M -Toma de fuerza en motor en caja":
										case "Arocs 4845 K/48 8x4 Cabina M - Toma de fuerza en caja":
											$img_newsletter = 'nuevo-arocs.jpg';
										break;

										case "Nuevo Actros 3342 S/36 6x4 Cabina M - Toma de fuerza en caja":
										case "Nuevo Actros 2042 LS/37 4x2":
										case "Nuevo Actros 2042 L/46 4x2":
										case "Nuevo Actros 2048 LS/37 4x2":
										case "Nuevo Actros 2636 LS/33 6x2 (liviano combustible CMT 50Tn)":
										case "Nuevo Actros 2645 LS/33 6x2 (55tN / Briten 60Tn)":
										case "Nuevo Actros 2651 LS/40 6x4 (Bitren 75 Tn)":
										case "Nuevo Actros 3342 S/36 6x4 Cabina M - Toma de fuerza en caja":
										case "Nuevo Actros 2042 LS/37 4x2":
										case "Nuevo Actros 2042 L/46 4x2":
										case "Nuevo Actros 2048 LS/37 4x2":
										case "Nuevo Actros 2636 LS/33 6x2 (liviano combustible CMT 50Tn)":
										case "Nuevo Actros 2645 LS/33 6x2 (55tN / Briten 60Tn)":
										case "Nuevo Actros 2651 LS/40 6x4 (Bitren 75 Tn)":
											$img_newsletter = 'nuevo-actros.jpg';
										break;
									}
								break;

								case 'Vans':
									$img_newsletter = "vans.jpg";
									$acentos = array('á','é','í','ó','ú');
									$vocales = array('a','e','i','o','u');
									$modelo_corregido = str_replace($acentos, $vocales, utf8_decode($modelo));

									switch($modelo_corregido){
										case 'Vito CDI Furgon Version 1 con aire acondicionado':
										case 'Vito CDI Furgon Version 2 con aire acondicionado':
											$img_newsletter = 'vito-furgon.jpg';
										break;
										case 'Vito CDI Furgon Mixto con aire acondicionado - PEA2':
										case 'Vito CDI Furgon Mixto con aire acondicionado':
										case 'Vito CDI Furgon Mixto X con aire acondicionado':
											$img_newsletter = 'vito-mixto.jpg';
										break;
										case 'Vito CDI Furgon Plus con aire acondicionado':
											$img_newsletter = 'vito-plus.jpg';
										break;
										case 'Vito Tourer':
											$img_newsletter = 'vito-tourer.jpg';
										break;
										case 'Vito Combi':
											$img_newsletter = 'vito-combi.jpg';
										break;

										case "Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado":
										case "Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado":
										case "Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado":
										case "Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado":
										case "Sprinter 411CDI Street Furgón 3250 TN Versión 1 con Aire Acondicionado":
										case "Sprinter 411CDI Street Furgón 3250 TN Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3250 TN Versión 1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3250 TN Mixto 4+1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3250 TN Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TN Versión 1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TN Mixto 4+1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TN Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TE Versión 1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TE Mixto 4+1 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 3665 TE Versión 2 con Aire Acondicionado":
										case "Sprinter 415 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado":
										case "Sprinter 515 CDI Furgón 4325 TE Versión 2 con Aire Acondicionado":
										case "Sprinter 515 CDI Furgón 4325 XL TE Versión 2 con Aire Acondicionado":
											$img_newsletter = 'sprinter-furgon.jpg';
										break;

										case "Sprinter 415 CDI Combi 3665 9+1 TN":
										case "Sprinter 415 CDI Combi 3665 15+1 TE":
										case "Sprinter 515 CDI Combi 4325 19+1":
										case "Sprinter 415 CDI Combi 3665 9+1 TN":
										case "Sprinter 415 CDI Combi 3665 15+1 TE":
										case "Sprinter 515 CDI Combi 4325 19+1":
											$img_newsletter = 'sprinter-combi.jpg';
										break;

										case "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado":
										case "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado":
										case "Sprinter 415 CDI Chasis 3665 con Aire Acondicionado":
										case "Sprinter 515 CDI Chasis 4325 con Aire Acondicionado":
											$img_newsletter = 'sprinter-chasis.jpg';
										break;
									}

								break;

								case 'Pickup':
									$img_newsletter = "pickups.jpg";
								break;

								case 'Smart':
									$img_newsletter = "smart.jpg";
								break;
							}

							/*---------------------------------------------------*/
							/* ENVIO EL MAIL									 */
							/*---------------------------------------------------*/

								//$subject = "Nuevo contacto desde App en Expo Agro " . date('d-m H:i:s');
								$subject = $tipo_vehiculo . " Mercedes-Benz: Envío de tu cotización";



								if($tipo_vehiculo != "Pickup"){ // Si no es Pickup

								$mensaje_mail1_1 = '
					<!DOCTYPE html>
					<html lang="en">

					<head>
						<meta charset="utf-8">
						<title>Mercedes-Benz Información plan de ahorro</title>

						<meta http-equiv="X-UA-Compatible" content="IE=edge">
						<meta name="description" content="">
						<meta name="viewport" content="width=device-width, initial-scale=1">

						<!--[if mso]>
							<style type=”text/css”>
							.fallback-font {
								font-family: sans-serif, Arial;
							}
							</style>
						<![endif]-->

					</head>

					<body style="margin: 0 auto;  padding: 0; border: none; width: 600px; background: #fff; color: #fff;; font-family: helvetica, arial, sans-serif; font-size: 12px; -webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;" bgcolor="#fff">

						<style>
							a, a:link, a:active, a:visited, a:hover {
								border: none;
								color: inherit;
								text-decoration: none;
							}
							table#info th, table#info td {
								font-weight: 400;
								padding: 7px 10px 5px 0px;
								vertical-align: middle;
								font-family: helvetica, arial, sans-serif;
								text-align: left;
								font-size: 12px;
								letter-spacing: -0.03em;
							}
							table#info td {
								padding-right: 0;
							}
							#social a{
								border-radius: 50%;
								overflow: hidden;
								display: inline-block;
								width: 25px;
								height: 23px;
								margin-right: 5px;
							}
						</style>

						<table align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; border: none; width: 600px; background: #000;">

							<tr>
								<td valign="bottom" height="90" style="height: 90px;">
									<table style="background: #000; width: 600px; height: 90px;" valign="center" height="90" width="600" cellpadding="0" cellspacing="0" border="0">
										<tr>
											<td align="left">
												<div style="padding-left: 40px;">
													<a href="http://www.mercedes-benz.com.ar" target="_blank"><img src="http://expoagro.neomedia.com.ar/mailing/logo-mb.png" alt="Logo Mercedes-Benz"></a>
												</div>
											</td>
											<td align="right">
												<div style="padding-right: 40px; padding-top: 30px;">
													<div style="width: 124px;text-align: right;">
														<div style="font-size: 18px; font-weight: 300; font-family: times new roman, serif;  letter-spacing: -0.04em;;">Mercedes-Benz</div>
														<div style="text-align: right;font-size: 10px;font-weight: 400;">'.$tipo_vehiculo.'</div>
													</div>
												</div>
											</td>
										</tr>
									</table>
								</td>
							</tr>

							<tr>
								<td align="left" valign="bottom" style="background: #fff;">
									<div style="padding: 0 40px;">
										<hr style="width: 75px; border-bottom: 3px solid #000; margin: 20px 0; height: 0;">

										<h2 style=" color: #000; font-size: 38px; font-family: \'corporate-s\', times-new-roman; margin: 0 0 15px;    font-weight: 400; letter-spacing: -0.04em;">'.utf8_decode($modelo).'<br>'.utf8_decode($plan).'</h2>
									</div>

									<img src="http://expoagro.neomedia.com.ar/mailing/'.$img_newsletter.'?v=' . date('ymdhis') . '" alt="Imágen Vehículo" style="width: 100%; height: auto;">
								</td>
							</tr>

							<tr>
								<td valign="bottom">
									<div style="padding: 30px 40px 0">
										<a href="http://www.plandeahorro.mercedes-benz.com.ar" target="_blank" style="font-family: times new roman, serif;border: 1px solid #fff;display: inline-block;padding: 0 4px;line-height: 25px;font-weight: 400;letter-spacing: -.03em; font-size: 13px; margin-bottom: 30px;color: #fff; text-decoration: none;">Mercedes-Benz Plan de Ahorro</a>
										<h1 style="font-size: 18px; margin: 0 0 10px;font-weight: 300;">Tu cotización solicitada</h1>
										<p style="font-weight: 300;line-height: 1.5;margin-top: 0;">Gracias por tu interés en nuestros vehículos, adjuntamosla información solicitada.<br>
											Para más información consultá con nuestra red de consesionarios.
										</p>
										<a href="https://dealerlocator.mercedes-benz.com/dls1/dealersearch/search.html?sku=DLp&organization=outlet-emb-ar&locale=es_AR&env=cloud/buscador.aspx" target="_blank" style="display: inline-block; background: #00adef; color: #fff; padding: 0px 10px; text-decoration: none; border: 1px solid #80d6f9; margin: 10px 0 25px;line-height: 32px;"> <span style="font-size: 14px;font-weight: 700;font-family: helvetica, sans-serif;opacity: .8;">></span>&nbsp;&nbsp; Red de concesionarios</a>

										<hr style="border: none; border-bottom: 1px solid #424244; margin: 0 -10px 25px;">
									</div>
								</td>
							</tr>


							<tr>
								<td align="left" valign="bottom">
									<div style="padding: 0 40px;">
										<h3 style="font-size: 26px; margin: 0; font-weight: 300;letter-spacing: -0.03em; color: #fff;">Cantidad de cuotas</h3>
										<h4 style="font-size: 52px;font-weight: bold; margin: 0 0 15px; color: #fff;">'.utf8_decode($cuotas).'</h4>
										<h3 style="font-size: 26px;margin: 0; font-weight: 300;letter-spacing: -0.03em; color: #fff;">Total cuota mensual</h3>
										<h4 style="font-size: 52px;font-weight: bold; margin: 0; color: #fff;">$'.utf8_decode($cuotaMensual).'</h4>

										<hr style="border: none; border-bottom: 1px solid #424244; margin: 25px -10px;">
									</div>
								</td>
							</tr>
							<tr>
								<td align="center" valign="bottom">
									<div style="padding: 0px 40px 0px;">
										<table id="info" valign="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: left; width: 100%; font-family: helvetica, arial, sans-serif;">
											<tr>
												<th style="width: 50%;">Fecha</th>
												<td>'.date("d/m/Y").'</td>
											</tr>
											<tr>
												<th>Tipo de vehiculo</th>
												<td>'.$tipo_vehiculo.'</td>
											</tr>
											<tr>
												<th>Linea</th>
												<td>'.utf8_decode($linea).'</td>
											</tr>
											<tr>
												<th>Modelo</th>
												<td>'.utf8_decode($modelo).'</td>
											</tr>
											<tr>
												<th>Precio vehículo con IVA</th>
												<td>$ '.utf8_decode($precioPublico).'</td>
											</tr>
											<tr>
												<th>Tipo de plan</th>
												<td>'.utf8_decode($plan).'</td>
											</tr>
											<tr>
												<th>Cantidad de Cuotas</th>
												<td>'.utf8_decode($cuotas).'</td>
											</tr>
											<tr>
												<th>Cuota Pura</th>
												<td>$ '.utf8_decode($cuotaPura).'</td>
											</tr>
											<tr>
												<th>Carga administrativa + derecho de suscrip.</th>
												<td>$ '.utf8_decode($cargaAdminSuscripcion+$iva21).'</td>
											</tr>
											<tr>
												<th>IVA (Carga administrativa + derecho de suscrip.)</th>
												<td>$ '.utf8_decode($iva21).'</td>
											</tr>
											<tr>
												<th>Total cuota mensual</th>
												<td>$ '.utf8_decode($cuotaMensual).'</td>
											</tr>
											<tr>
												<th>Alícuota extraordinaria (30%)</th>
												<td>$ '.utf8_decode($pagoAdjudicacion30).'</td>
											</tr>

										</table>
									</div>
									<div style="text-align: left; padding: 0 40px 20px; font-family: helvetica, arial, sans-serif;font-size:11px; color: #fff;">
										<hr style="border: none; border-bottom: 1px solid #424244; margin: 25px -10px;">
										NOTA: Los valores aquí expresados son solamente de referencia y se calculan en base a la lista de precios vigente al 01/03/2018. Las cuotas se ajusta según el valor móvil del vehículo suscripto. Precios válidos para personas residentes en la República Argentina excepto Tierra del Fuego que tiene un tratamiento impositivo distinto. Para mayor asesoramiento comuníquese al 0800-888-2262 o a <a href="mailto:plandeahorro@mercedes-benz.com.ar" target="_blank" style="color: #fff; text-decoration: none;">plandeahorro@mercedes-benz.com.ar</a>
									</div>
								</td>
							</tr>

							<tr>
								<td align="left" valign="bottom">
									<table valign="center" height="80" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-top: 1px solid #fff;">
										<tr>
											<td align="left">
												<div id="social" style="padding-left: 30px;">
													<a href="https://www.facebook.com/VehiculosComercialesMercedesBenzArg/" target="_blank" title="Facebook"><img src="http://expoagro.neomedia.com.ar/mailing/icon-fb.jpg" alt="Mercedes-Benz Facebook"></a>
													<a href="https://www.instagram.com/mercedesbenzvans_arg/" target="_blank" title="Instagram"><img src="http://expoagro.neomedia.com.ar/mailing/icon-in.jpg" alt="Mercedes-Benz Instagram"></a>
													<a href="https://www.youtube.com/user/MercedesBenzArgentin" target="_blank" title="Youtube"><img src="http://expoagro.neomedia.com.ar/mailing/icon-yt.jpg" alt="Mercedes-Benz Youtube"></a>
													<a href="http://www2.mercedes-benz.com.ar/callclient/client.php?locale=sp&style=simplicity&noagents=0&url=http%3A//www2.mercedes-benz.com.ar/CALLCLIENT/CLIENTE.HTML&referrer=" target="_blank" title="Chat"><img src="http://expoagro.neomedia.com.ar/mailing/icon-bl.jpg" alt="Mercedes-Benz Blog"></a>
												</div>
											</td>
											<td align="right">
												<div style="padding-right: 30px; text-align: right;">
													<a href="http://www.plandeahorro.mercedes-benz.com.ar" target="_blank" style="color: #fff; text-decoration: none;">www.plandeahorro.mercedes-benz.com.ar</a>
												</div>
											</td>
										</tr>
									</table>

								</td>
							</tr>

						</table>
					</body>
					</html>
								';

								}else{ // Si es el caso de Pickup o Plan 84


									$mensaje_mail1_1 = '
					<!DOCTYPE html>
					<html lang="en">

					<head>
						<meta charset="utf-8">
						<title>Mercedes-Benz VITO X</title>

						<meta http-equiv="X-UA-Compatible" content="IE=edge">
						<meta name="description" content="">
						<meta name="viewport" content="width=device-width, initial-scale=1">


						<!--[if mso]>
							<style type=”text/css”>
							.fallback-font {
								font-family: sans-serif, Arial;
							}
							</style>
						<![endif]-->

					</head>

					<body style="margin: 0 auto;  padding: 0; border: none; width: 600px; background: #fff; color: #ebebeb;; font-family: helvetica, arial, sans-serif; font-size: 12px; -webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;" bgcolor="#fff">

						<style>
							a, a:link, a:active, a:visited, a:hover{
								border: none;
								color: inherit;
								text-decoration: none;
							}
							#social a{
								border-radius: 50%;
								overflow: hidden;
								display: inline-block;
								width: 25px;
								height: 23px;
								margin-right: 5px;
							}
						</style>

						<table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; border: none; width: 100%; background: #262424;" bgcolor="#262424">
							<tr>
								<td valign="bottom" height="126" style="height: 126px;">
									<table valign="center" height="126" width="100%" cellpadding="0" cellspacing="0" border="0">
										<tr>
											<td align="left">
												<div style="padding-left: 40px;">
													<a href="http://www.mercedes-benz.com.ar" target="_blank"><img src="http://expoagro.neomedia.com.ar/mailing/logo-mb.png" alt="Logo Mercedes-Benz"></a>
												</div>
											</td>
											<td align="right">
												<div style="padding-right: 40px; padding-top: 30px; color: #ebebeb">
													<div style="width: 124px;text-align: right;">
														<div style="font-size: 18px; font-weight: 300; font-family: times new roman, serif;  letter-spacing: -0.04em;;">Mercedes-Benz</div>
													</div>
												</div>
											</td>
										</tr>
									</table>
								</td>
							</tr>


							<tr>
								<td align="center" valign="bottom">
									<div style="">
										<img src="http://expoagro.neomedia.com.ar/mailing/info-pickups-img-header.jpg" alt="Imágen Pickup Vito X">
									</div>
								</td>
							</tr>


							<tr>
								<td valign="bottom">
									<div style="padding: 40px; text-align: left; color: #fff; border-bottom: 1px solid #fff;">
										<a href="https://www.plandeahorro.mercedes-benz.com.ar/" target="_blank" style="display: inline-block;font-family: times new roman, serif;font-size: 21px;letter-spacing: -0.05em;padding: 0px 27px;border: 1px solid #fff;line-height: 40px;text-decoration; none; color: #fff;">Mercedes-Benz Plan de Ahorro</a>
										<p style="font-family: times new roman, serif;font-weight: 400;font-size: 30px;letter-spacing: -0.05em;line-height:  1;margin: 30px 0;">¡Muchas gracias por tu interés<br>en nuestros productos!</p>
										<p style="margin-top: 0; font-weight: 300;font-size: 14px;letter-spacing: -0.04em;">Tus datos han sido registrados y agregados<br>a una lista de espera. </p>
										<p style="font-weight: 400;font-size: 14px;letter-spacing: -0.04em;">Cada vez estás más cerca de conocerla.</p>
									</div>
								</td>
							</tr>


							<tr>
								<td align="left" valign="bottom">
									<table valign="center" height="80" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-top: 1px solid #fff;">
										<tr>
											<td align="left">
												<div id="social" style="padding-left: 30px;">
													<a href="https://www.facebook.com/VehiculosComercialesMercedesBenzArg/" target="_blank" title="Facebook"><img src="http://expoagro.neomedia.com.ar/mailing/icon-fb.jpg" alt="Mercedes-Benz Facebook"></a>
													<a href="https://www.instagram.com/mercedesbenzvans_arg/" target="_blank" title="Instagram"><img src="http://expoagro.neomedia.com.ar/mailing/icon-in.jpg" alt="Mercedes-Benz Instagram"></a>
													<a href="https://www.youtube.com/user/MercedesBenzArgentin" target="_blank" title="Youtube"><img src="http://expoagro.neomedia.com.ar/mailing/icon-yt.jpg" alt="Mercedes-Benz Youtube"></a>
													<a href="http://www2.mercedes-benz.com.ar/callclient/client.php?locale=sp&style=simplicity&noagents=0&url=http%3A//www2.mercedes-benz.com.ar/CALLCLIENT/CLIENTE.HTML&referrer=" target="_blank" title="Chat"><img src="http://expoagro.neomedia.com.ar/mailing/icon-bl.jpg" alt="Mercedes-Benz Blog"></a>
												</div>
											</td>
											<td align="right">
												<div style="padding-right: 30px; text-align: right;">
													<a href="http://www.plandeahorro.mercedes-benz.com.ar" target="_blank" style="color: #fff; text-decoration: none;">www.plandeahorro.mercedes-benz.com.ar</a>
												</div>
											</td>
										</tr>
									</table>

								</td>
							</tr>

						</table>
					</body>
					</html>
								';
								}

								$arreglo_email1[1] = $email;
								$arreglo_email_bcc[1] = "ivano22@gmail.com";
								//$arreglo_email_bcc[1] = "sciancio@3wfactory.com.ar";
								//$arreglo_email_bcc[2] = "iv@neomedia.com.ar";
								//$arreglo_email_bcc[3] = $email;

								//enviar_mail($host, $smtpauth, $username, $password, $from, $fromname, $addadress,$addadressbcc, $replyto, $subject, $body_html, $body_plano)

								enviar_mail("localhost", true, "expoagro@neomedia.com.ar", "expoagromb", "plandeahorro@mercedes-benz.com.ar", "Plan de Ahorro Mercedes-Benz", $arreglo_email1, $arreglo_email_bcc, "plandeahorro@mercedes-benz.com.ar", $subject, $mensaje_mail1_1, "");


								// Actualizo el estado de email enviado
								$sql_update = "UPDATE contactos SET envio_emails = 'S', sent = now() WHERE id = '$id_aux';";
								$result_update = mysql_query($sql_update,$db);


							/*----------------------------------------------------------------------*/

						}

					/*----------------------------------------------------------------------*/

				}
			}
		}

	}

/*----------------------------------------------------------------------*/
/* Cargo el Registro													*/
/*----------------------------------------------------------------------*/

	if(isset($_POST['accion']) AND $_POST['accion'] == "cargar"){ // Si vengo del Alta

		// Verifico si el contacto ya existe
		$sql = "SELECT id FROM contactos WHERE nombre = '$add_nombre'  AND apellido = '$add_apellido'  AND email = '$add_email'  AND telefono = '$add_telefono'  AND provincia = '$add_provincia'  AND ciudad = '$add_ciudad'  AND modelo = '$add_modelo'  AND plan = '$add_plan'  AND cuotas = '$add_cuotas'  ;";

		$result = mysql_query($sql,$db);
		if (!($myrow = mysql_fetch_array($result))) {

			$sql = "INSERT INTO contactos (nombre, apellido, email, telefono, provincia, ciudad, modelo, plan, cuotas) VALUES ( '$add_nombre' ,  '$add_apellido' ,  '$add_email' ,  '$add_telefono' ,  '$add_provincia' ,  '$add_ciudad' ,  '$add_modelo' ,  '$add_plan' ,  '$add_cuotas' );";
			$result = mysql_query($sql,$db);
		}
	}

/*----------------------------------------------------------------------*/
?>
<!DOCTYPE html>
<html lang="es-AR" prefix="og: http://ogp.me/ns#">
<head>
<title>Administrador de Contacto</title>
<meta charset="UTF-8">
<link rel="stylesheet" href="styles/styles.css" type="text/css">
<link rel="stylesheet" href="styles/jquery.autocomplete.css" type="text/css">
<script type="text/javascript" src="js/jquery-1.11.1.min.js"></script>
<script type="text/javascript" src="js/xlsx.core.min.js"></script>
<script type="text/javascript" src="js/Blob.js"></script>
<script type="text/javascript" src="js/FileSaver.js"></script>
<script type="text/javascript" src="js/tableexport.js"></script>
<SCRIPT LANGUAGE="JavaScript" SRC="calendar/date.js"></SCRIPT>
<SCRIPT LANGUAGE="JavaScript" SRC="calendar/CalendarPopup.js"></SCRIPT>
<SCRIPT LANGUAGE="JavaScript">
	var cal = new CalendarPopup();
	cal.showNavigationDropdowns();
	cal.setYearSelectStartOffset(10);
</SCRIPT>
<SCRIPT LANGUAGE="JavaScript">
<!--

	function MostrarDiv(id_div){
		$('#'+id_div).fadeIn("slow");
	}

	function selectAll(objeto){
		$("input:checkbox").prop('checked', objeto.checked);
	}


//-->
</SCRIPT>
<script language="javascript">
$(document).ready(function() {
	$(".botonExcel").click(function(event) {

		//$( ".no_export_excel" ).remove();

/*		$("#datos_a_enviar").val( $("<div>").append( $("#TablaResultados").eq(0).clone()).html());
		$("#nombre_xls").val( 'smart_contactos_<?php echo date("YmdHis")?>.xls' );
		$("#FormularioExportacion").submit();
*/


		$("#TablaResultados").tableExport({
			bootstrap: false
		});

});
});
</script>
<style type="text/css">
	.botonExcel{cursor:pointer;}
</style>
</head>
<body bgcolor="#E6E6E6" text="#000000" leftmargin="0" topmargin="0">
<?php
/*---------------------------------*/
/* Lectura del TOP                 */
/*---------------------------------*/
	include("expo-top.php");
/*---------------------------------*/
?>
  <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" align="center">
	<tr>
	<td valign="top">
		<table width="100%" border="0" cellspacing="0" cellpadding="5" bgcolor="#FFFFFF" align="center" style="margin: 25px 0;">
		  <tr>
			<td valign="middle" height="35">
				 <span class="titulo" style="margin-left: 25px;"> Gesti&oacute;n de Contactos</span>
			</td>
		  </tr>
		</table>

		<span class="titulo" style="margin: 0 25px 5px;; display: inline-block;">&nbsp;Buscador</span>
		<form id="filtros" method="post" name="Formulario" action="<?php echo $_SERVER['PHP_SELF'] ?>">
		<input type="hidden" name="buscar" value="S">
		<table width="100%" border="0" cellspacing="0" cellpadding="5" bgcolor="#F3F3F3" align="center">
		  <tr>
			<td width="10%" class="line_top_gris" align="right">Nombre:</td>
			<td width="40%" class="line_top_gris">
			  <input type="text" name="busq_nombre" class="texto" size=60 value="<?php if(!empty($_POST['busq_nombre'])){ echo $_POST['busq_nombre']; }?>">
			</td>
			<td width="10%" class="line_top_gris" align="right">Apellido:</td>
			<td width="40%" class="line_top_gris">
			  <input type="text" name="busq_apellido" class="texto" size=60 value="<?php if(!empty($_POST['busq_apellido'])){ echo $_POST['busq_apellido']; }?>">
			</td>
		  </tr>
		  <tr>
			<td class="line_top_gris" align="right">Email:</td>
			<td class="line_top_gris">
			  <input type="text" name="busq_email" class="texto" size=60 value="<?php if(!empty($_POST['busq_email'])){ echo $_POST['busq_email']; }?>">
			</td>
			<td class="line_top_gris" align="right">Tel&eacute;fono:</td>
			<td class="line_top_gris">
			  <input type="text" name="busq_telefono" class="texto" size=60 value="<?php if(!empty($_POST['busq_telefono'])){ echo $_POST['busq_telefono']; }?>">
			</td>
		  </tr>
		  <tr>
			<td class="line_top_gris" align="right">Email Enviado?:</td>
			<td class="line_top_gris">
				<select name="busq_envio_emails" class="texto">
					<option value="">Todos</option>
					<option value="S" <?php if(!empty($_POST['busq_envio_emails']) AND $_POST['busq_envio_emails'] == "S"){ echo " selected "; }?>>Sí</option>
					<option value="N" <?php if(!empty($_POST['busq_envio_emails']) AND $_POST['busq_envio_emails'] == "N"){ echo " selected "; }?>>No</option>
				</select>
			</td>
			<td class="line_top_gris" align="right">Tipo veh&iacute;culo:</td>
			<td class="line_top_gris">
				<select name="busq_tipo_vehiculo" class="texto">
					<option value="">Todos</option>

					<option value="Bus" <?php if(!empty($_POST['busq_tipo_vehiculo']) AND $_POST['busq_tipo_vehiculo'] == "Bus"){ echo " selected "; }?>>Bus</option>
					<option value="Camión" <?php if(!empty($_POST['busq_tipo_vehiculo']) AND $_POST['busq_tipo_vehiculo'] == "Camión"){ echo " selected "; }?>>Camion</option>
					<option value="Pickup" <?php if(!empty($_POST['busq_tipo_vehiculo']) AND $_POST['busq_tipo_vehiculo'] == "Pickup"){ echo " selected "; }?>>Pickup</option>
					<option value="Vans" <?php if(!empty($_POST['busq_tipo_vehiculo']) AND $_POST['busq_tipo_vehiculo'] == "Vans"){ echo " selected "; }?>>Vans</option>

				</select>
			</td>
		  </tr>
		  <tr>
			<td colspan="4" align="center" class="line_bottom_gris">
			  <input type="submit" name="Submit" value="Buscar" class="input fdo_action_call">
			</td>
		  </tr>
		</table>
	  </form>

	  <form action="ficheroExcel.php" method="post" target="_blank" id="FormularioExportacion">
		  <p class="texto" style="text-align: right;"><a class="botonExcel fdo_action_call">Exportar a Excel</a></p>
		<input type="hidden" id="datos_a_enviar" name="datos_a_enviar" />
		<input type="hidden" id="nombre_xls" name="nombre_xls" value="ST_Reporte_<?php echo date("YmdHis")?>.xls" />
	  </form>

	  <form name="Formulario_Dinamico" id="Formulario_Dinamico" method="post" action="<?php echo $PHP_SELF ?>">
		<input type="hidden" name="actualizar" value="S">
		<table width="100%" border="0" cellspacing="0" cellpadding="5" align="center" id="TablaResultados">
<?php
/*----------------------------------------------------------------------*/
/* Armo el Resultado de la Busqueda										*/
/*----------------------------------------------------------------------*/

	$sql = "
		SELECT t1.id, t1.nombre, t1.apellido, t1.email, t1.telefono, t1.provincia, t1.ciudad, t1.tipo_vehiculo, t1.modelo, t1.plan, t1.cuotas, t1.created, t1.envio_emails
		FROM contactos AS t1
		WHERE t1.id <> '0' ";

	// Concateno los Filtros
	if(isset($sql_where)){
		foreach($sql_where AS $sql_where_adicional){
			$sql .= $sql_where_adicional." ";
		}
	}

	$sql .= " ORDER BY t1.id DESC";

// echo $sql;

	$result = mysql_query($sql,$db);
	$total_encontrados = mysql_num_rows($result);

	if ($myrow = mysql_fetch_array($result)) {

		// Muestro el Encabezado
		echo '
			<tr>
				<td valign="middle" colspan="13" class="line_bottom_gris" height="35"><span class="titulo">Registros encontrados: ' . $total_encontrados . '</span></td>
			</tr>
			<tr bgcolor="#EEEEEE">
				<th class="line_bottom_gris"><input type="checkbox" name="select_all" onclick="selectAll(this);"></th>
				<th class="line_bottom_gris"><b>Nombre</b></th>
				<th class="line_bottom_gris"><b>Apellido</b></th>
				<th class="line_bottom_gris"><b>Email</b></th>
				<th class="line_bottom_gris"><b>Tel&eacute;fono</b></th>
				<th class="line_bottom_gris"><b>Provincia</b></th>
				<th class="line_bottom_gris"><b>Ciudad</b></th>
				<th class="line_bottom_gris"><b>Tipo</b></th>
				<th class="line_bottom_gris"><b>Modelo</b></th>
				<th class="line_bottom_gris"><b>Plan</b></th>
				<th class="line_bottom_gris"><b>Cuotas</b></th>
				<th class="line_bottom_gris"><b>Creación</b></th>
				<th class="line_bottom_gris"><b>Env</b></th>
			</tr>
			<tbody>
		';

		do {
			$id = $myrow["id"];
			$nombre = $myrow["nombre"];
			$apellido = $myrow["apellido"];
			$email = $myrow["email"];
			$telefono = $myrow["telefono"];
			$provincia = $myrow["provincia"];
			$ciudad = $myrow["ciudad"];
			$tipo_vehiculo = $myrow["tipo_vehiculo"];
			$modelo = $myrow["modelo"];
			$plan = $myrow["plan"];
			$cuotas = $myrow["cuotas"];
			$created = $myrow["created"];
			$envio_emails = $myrow["envio_emails"];


?>
		  <!-- Comienzo de la Fila -->
			<tr>
				<td class="line_bottom_gris" width="1%"><input type="checkbox" class="checkbox_email" name="array_id[]" value="<?php echo $id ?>"></td>
				<td class="line_bottom_gris"><a href="expo-modif-contacto.php?id=<?php echo $id ?>"><?php echo $nombre ?></a></td>
				<td class="line_bottom_gris"><a href="expo-modif-contacto.php?id=<?php echo $id ?>"><?php echo $apellido ?></a></td>
				<td class="line_bottom_gris"><?php echo $email ?></td>
				<td class="line_bottom_gris"><?php echo $telefono ?></td>
				<td class="line_bottom_gris"><?php echo $provincia ?></td>
				<td class="line_bottom_gris"><?php echo $ciudad ?></td>
				<td class="line_bottom_gris"><?php echo $tipo_vehiculo ?></td>
				<td class="line_bottom_gris"><?php echo $modelo ?></td>
				<td class="line_bottom_gris"><?php echo $plan ?></td>
				<td class="line_bottom_gris"><?php echo $cuotas ?></td>
				<td class="line_bottom_gris"><?php echo $created ?></td>
				<td class="line_bottom_gris"><?php echo $envio_emails ?></td>
			</tr>
		  <!-- Fin de la Fila -->
<?php

		}while ($myrow = mysql_fetch_array($result));

		echo '
		  <tr>
			<td valign="middle" colspan="12" class="texto_negro" height="35">
				<input type="submit" name="Eliminar" value="Eliminar" onclick="return confirm(\'Se eliminar&aacute;n los \' + $(\'#Formulario_Dinamico\').find(\'.checkbox_email:checked\').length + \' registros seleccionados. ¿Continuar?\');" class="input fdo_action_call">
				<input type="submit" name="Emails" value="Enviar Emails" onclick="return confirm(\'Se enviar&aacute; un email a cada contacto seleccionado. ¿Continuar?\');" class="input fdo_action_call">
			</td>
		  </tr>
		';

	}else{ // Si no hay datos

		echo '
		  <tr>
			<td valign="middle" class="texto_negro" height="35" align="center"><b>No se encontraron registros.</b></td>
		  </tr>
		';
	}

/*----------------------------------------------------------------------*/
?>
		</table>
		</form>
	  <p>&nbsp;</p>
	</td>
	</tr>
  </table>
<?php
/*---------------------------------*/
/* Lectura del PIE                 */
/*---------------------------------*/
	include("expo-pie.php");
/*---------------------------------*/
?>
</body>
</html>

