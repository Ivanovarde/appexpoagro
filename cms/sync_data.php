<?php

header('Access-Control-Allow-Origin: *'); //for all

/*----------------------------------------------------------------------*/
/* Extracción de los datos del archivo de configuración                 */
/*----------------------------------------------------------------------*/
include("expo-db.php");
require_once("3wlab-mail.php");

$db = mysql_connect(HOST, USUARIO, PASSWORD);
mysql_select_db(DATABASE,$db);

/*----------------------------------------------------------------------*/
/* Proceso los datos 													*/
/*----------------------------------------------------------------------*/

$resultadoJson = array('error' => true,'mensaje'=>'Fallo en la conexión.');


if(isset($_GET['datos_guardados']) AND !empty($_GET['datos_guardados'])){


	// Proceso el Stream recibido
	$caracteresEliminar = array("\\", "[", "]","\"");
	$string_resultado = str_replace($caracteresEliminar, "", $_GET['datos_guardados']);
	$registrosProcesados = explode(",", $string_resultado) ;

	//print_r($registrosProcesados);

	//Valido que vengan los datos del formulario
	if( !isset($registrosProcesados[10]) || !isset($registrosProcesados[11]) || !isset($registrosProcesados[12]) || !isset($registrosProcesados[13]) || !isset($registrosProcesados[14]) || !isset($registrosProcesados[15]) ){
		$resultadoJson = array('error' => true,'mensaje'=>'Todos los datos son requeridos');
		echo "expojson_sync(" . json_encode($resultadoJson) . ")";
	}


	$error_transaction = false;

	// Comienzo la TRANSACTION
	mysql_query("BEGIN");


	// Determino la Linea del Vehiculo
	switch ($registrosProcesados[17]) {

		case 'bus':
			$tipo_vehiculo = "Bus";
			$img_newsletter = "buses.jpg";

			if($registrosProcesados[16] == "1"){ $linea = "Interurbanos";}
			if($registrosProcesados[16] == "2"){ $linea = "Midibus";}
			if($registrosProcesados[16] == "3"){ $linea = "Plataforma con motor eléctrico";}
			if($registrosProcesados[16] == "4"){ $linea = "Urbanos";}
			break;

		case 'camiones':
			$tipo_vehiculo = "Camión";
			$img_newsletter = "trucks.jpg";
			if($registrosProcesados[16] == "1"){ $linea = "Livianos";}
			if($registrosProcesados[16] == "2"){ $linea = "Medianos";}
			if($registrosProcesados[16] == "3"){ $linea = "Pesados Off Road";}
			if($registrosProcesados[16] == "4"){ $linea = "Pesados On Road";}
			if($registrosProcesados[16] == "5"){ $linea = "Semipesados";}
			break;

		case 'vans':
			$tipo_vehiculo = "Vans";
			$img_newsletter = "vans.jpg";
			if($registrosProcesados[16] == "1"){ $linea = "Chasis Cabina";}
			if($registrosProcesados[16] == "2"){ $linea = "Combi";}
			if($registrosProcesados[16] == "3"){ $linea = "Furgón";}
			if($registrosProcesados[16] == "4"){ $linea = "Pasajeros";}
			break;

		case 'pickup':
			$tipo_vehiculo = "Pickup";
			$img_newsletter = "pickups.jpg";
			if($registrosProcesados[16] == "1"){ $linea = "Furgón";}
			if($registrosProcesados[16] == "2"){ $linea = "Pasajeros";}
			break;

		case 'smart':
			$tipo_vehiculo = "Smart";
			$img_newsletter = "smart.jpg";
			if($registrosProcesados[16] == "1"){ $linea = "Smart";}
			break;
	}


	// Depuro el campo pagoAdjudicacion30 y lo pongo en 0 si viene vacio
	if(empty($registrosProcesados[7])){
		$registrosProcesados[7] = "0.00";
	}


	// Inserto el registro sin importar si hay duplicados
	$sql = "INSERT INTO contactos (nombre, apellido, email, telefono, provincia, ciudad, modelo, plan, cuotas, tipo_vehiculo, linea, precioPublico, cuotaPura, cargaAdminSuscripcion, iva21, cuotaMensual, pagoAdjudicacion30, created)VALUES(
		'".ucfirst(strtolower(($registrosProcesados[10])))."'
		,'". ucfirst(strtolower(($registrosProcesados[11])))."'
		,'". strtolower(($registrosProcesados[12]))."'
		,'". ($registrosProcesados[13])."'
		,'". ($registrosProcesados[14])."'
		,'". ucfirst(strtolower(($registrosProcesados[15])))."'
		,'". ($registrosProcesados[8])."'
		,'". ($registrosProcesados[9])."'
		,'". ($registrosProcesados[0])."'
		,'". ($tipo_vehiculo)."'
		,'". ($linea)."'
		,'". (str_replace("|","",$registrosProcesados[2]))."'
		,'". (str_replace("|","",$registrosProcesados[4]))."'
		,'". (str_replace("|","",$registrosProcesados[5]))."'
		,'". (str_replace("|","",$registrosProcesados[6]))."'
		,'". (str_replace("|","",$registrosProcesados[1]))."'
		,'". (str_replace("|","",$registrosProcesados[7]))."'
		, now() );";

	$result = mysql_query($sql,$db);
	$last_id = mysql_insert_id();

	// Si se detecto algun error durante la transaccion, se cancela todo
	if(!$result){
		$error_transaction = true;
		break;
	}



	// Si hubo error, rollback
	if($error_transaction){
		mysql_query("ROLLBACK");
		$resultadoJson = array('error' => true,'mensaje'=>'Fallo de Sincronización.');

	}else{
		mysql_query("COMMIT");
		$resultadoJson = array('error' => false,'mensaje'=>'Sincronización finalizada con éxito.');


		/*---------------------------------------------------*/
		/* ENVIO EL MAIL                                     */
		/*---------------------------------------------------*/

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
									<div style="width: 104px;text-align: left;">
										<div style="font-size: 18px; font-weight: 300; font-family: times new roman, serif;  letter-spacing: -0.04em;;">Mercedes-Benz</div>
										<div style="text-align: left;font-size: 10px;font-weight: 400;">'.$tipo_vehiculo.'</div>
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

						<h2 style=" color: #000; font-size: 38px; font-family: \'corporate-s\', times-new-roman; margin: 0 0 15px;    font-weight: 400; letter-spacing: -0.04em;">'.utf8_decode($registrosProcesados[8]).'<br>'.utf8_decode($registrosProcesados[9]).'</h2>

						<img src="http://expoagro.neomedia.com.ar/mailing/'.$img_newsletter.'" alt="Imágen Vehículo" style="width: 100%; height: auto;">

					</div>
				</td>
			</tr>

			<tr>
				<td valign="bottom">
					<div style="padding: 30px 40px 0">
						<a href="http://www.plandeahorro.mercedes-benz.com.ar" target="_blank" style="font-family: times new roman, serif;border: 1px solid #fff;display: inline-block;padding: 0 4px;line-height: 25px;font-weight: 400;letter-spacing: -.03em; font-size: 13px; margin-bottom: 30px;">Mercedes-Benz Plan de Ahorro</a>
						<h1 style="font-size: 18px; margin: 0 0 10px;font-weight: 300;">Tu cotización solicitada</h1>
						<p style="font-weight: 300;line-height: 1.5;margin-top: 0;">Gracias por tu interés en nuestros vehículos, adjuntamos la información solicitada.<br>
							Para más información consultá con nuestra red de concesionarios.
						</p>
						<a href="https://www.mercedes-benz.com.ar/content/argentina/mpc/mpc_argentina_website/es/home_mpc/truck_home/home/company_contact/find_a_dealer.flash.html" target="_blank" style="display: inline-block; background: #00adef; color: #fff; padding: 0px 10px; text-decoration: none; border: 1px solid #80d6f9; margin: 10px 0 25px;line-height: 32px;"> <span style="font-size: 14px;font-weight: 700;font-family: helvetica, sans-serif;opacity: .8;">></span>&nbsp;&nbsp; Red de concesionarios</a>

						<hr style="border: none; border-bottom: 1px solid #424244; margin: 0 -10px 25px;">
					</div>
				</td>
			</tr>
			<tr>
				<td align="left" valign="bottom">
					<div style="padding: 0 40px;">
						<h3 style="font-size: 26px; margin: 0; font-weight: 300;letter-spacing: -0.03em; color: #fff;">Cantidad de cuotas</h3>
						<h4 style="font-size: 52px;font-weight: bold; margin: 0 0 15px; color: #fff;">'.utf8_decode($registrosProcesados[0]).'</h4>
						<h3 style="font-size: 26px;margin: 0; font-weight: 300;letter-spacing: -0.03em; color: #fff;">Total cuota mensual</h3>
						<h4 style="font-size: 52px;font-weight: bold; margin: 0; color: #fff;">$'.utf8_decode(str_replace("|","",$registrosProcesados[1])).'</h4>

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
								<td>'.utf8_decode($registrosProcesados[8]).'</td>
							</tr>
							<tr>
								<th>Precio vehículo con IVA</th>
								<td>$ '.utf8_decode(str_replace("|","",$registrosProcesados[2])).'</td>
							</tr>
							<tr>
								<th>Tipo de plan</th>
								<td>'.utf8_decode($registrosProcesados[9]).'</td>
							</tr>
							<tr>
								<th>Cantidad de Cuotas</th>
								<td>'.utf8_decode(str_replace("|","",$registrosProcesados[0])).'</td>
							</tr>
							<tr>
								<th>Cuota Pura</th>
								<td>$ '.utf8_decode(str_replace("|","",$registrosProcesados[4])).'</td>
							</tr>
							<tr>
								<th>Carga administrativa + derecho de suscrip.</th>
								<td>$ '.utf8_decode(str_replace("|","",$registrosProcesados[5]+$registrosProcesados[6])).'</td>
							</tr>
							<tr>
								<th>IVA (Carga administrativa + derecho de suscrip.)</th>
								<td>$ '.utf8_decode(str_replace("|","",$registrosProcesados[6])).'</td>
							</tr>
							<tr>
								<th>Total cuota mensual</th>
								<td>$ '.utf8_decode(str_replace("|","",$registrosProcesados[1])).'</td>
							</tr>
							<tr>
								<th>Alícuota extraordinaria (30%)</th>
								<td>$ '.utf8_decode(str_replace("|","",$registrosProcesados[7])).'</td>
							</tr>

						</table>
					</div>
					<div style="text-align: left; padding: 0 40px 20px; font-family: helvetica, arial, sans-serif;font-size:11px;">
						<hr style="border: none; border-bottom: 1px solid #424244; margin: 25px -10px;">
						NOTA: Los valores aquí expresados son solamente de referencia y se calculan en base a la lista de precios vigente al 05/06/2018. Las cuotas se ajusta según el valor móvil del vehículo suscripto. Precios válidos para personas residentes en la República Argentina excepto Tierra del Fuego que tiene un tratamiento impositivo distinto. Para mayor asesoramiento comuníquese al 0800-888-2262 o a <a href="mailto:plandeahorro@mercedes-benz.com.ar" target="_blank" style="color: inherit;">plandeahorro@mercedes-benz.com.ar</a>
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
									<a href="http://www.plandeahorro.mercedes-benz-com.ar" target="_blank">www.plandeahorro.mercedes-benz.com.ar</a>
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
									<div style="width: 104px;text-align: left;">
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
						<a href="https://www.plandeahorro.mercedes-benz.com.ar/" target="_blank" style="display: inline-block;/*! clear: both; */font-family: times new roman, serif;font-size: 21px;letter-spacing: -0.05em;padding: 0px 27px;border: 1px solid #fff;line-height: 40px;">Mercedes-Benz Plan de Ahorro</a>
						<p style="font-family: times new roman, serif;font-weight: 400;font-size: 30px;letter-spacing: -0.05em;line-height:  1;margin: 30px 0;">¡Muchas gracias por tu interés<br>en nuestros productos!</p>
						<p style="margin-top: 0; font-weight: 300;font-size: 14px;letter-spacing: -0.04em;">Tus datos han sido registrados y agregados<br>a una lista de espera. </p>
						<p style="font-weight: 400;font-size: 14px;letter-spacing: -0.04em;">Cada vez estás más cerca de conocerla.</p>
					</div>
				</td>
			</tr>


			<tr>
				<td valign="bottom" height="80" style="height: 80px;">
					<table valign="center" height="80" width="100%" cellpadding="0" cellspacing="0" border="0">
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
									<a href="http://www.plandeahorro.mercedes-benz-com.ar" target="_blank">www.plandeahorro.mercedes-benz.com.ar</a>
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



			$arreglo_email1[1] = "iv@neomedia.com.ar";
			$arreglo_email_bcc[1] = "sciancio@3wfactory.com.ar";

			//enviar_mail("localhost", true, "expoagro@neomedia.com.ar", "expoagromb", "expoagro@neomedia.com.ar", "Expo Agro", $arreglo_email1, $arreglo_email_bcc, "expoagro@neomedia.com.ar", $subject, $mensaje_mail1_1, "");

			// Actualizo el estado de email enviado
			$sql_update = "UPDATE contactos SET envio_emails = 'S' WHERE id = '$last_id';";
			//$result_update = mysql_query($sql_update,$db);


		/*----------------------------------------------------------------------*/
	}
}

/*----------------------------------------------------------------------*/
/* Valido los datos del login	 										*/
/*----------------------------------------------------------------------*/

echo "expojson_sync(" . json_encode($resultadoJson) . ")";
//echo json_encode($resultadoJson);

/*----------------------------------------------------------------------*/
?>
