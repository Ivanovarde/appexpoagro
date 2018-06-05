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

/*----------------------------------------------------------------------*/
/* Genero la Conexión a la Base de Datos								*/
/*----------------------------------------------------------------------*/
	$db = mysql_connect(HOST, USUARIO, PASSWORD);
	mysql_select_db(DATABASE,$db);

/*----------------------------------------------------------------------*/
/* Modifico el Registro													*/
/*----------------------------------------------------------------------*/

	if(isset($_POST["accion"]) AND $_POST["accion"] == "cargar"){ // Si vengo del Modif

		// Actualizo el Registro
		$sql = "
			UPDATE contactos SET
				nombre = '".$_POST["add_nombre"]."'
					, apellido = '".$_POST["add_apellido"]."'
					, email = '".$_POST["add_email"]."'
					, telefono = '".$_POST["add_telefono"]."'
					, provincia = '".$_POST["add_provincia"]."'
					, ciudad = '".$_POST["add_ciudad"]."'
					, modelo = '".$_POST["add_modelo"]."'
					, plan = '".$_POST["add_plan"]."'
					, cuotas = '".$_POST["add_cuotas"]."'

			WHERE id='".$_POST['id']."';
		";
		$result = mysql_query($sql,$db);

		header("Location: expo-contacto.php"); /* Redirect browser */
		exit;
	}

/*----------------------------------------------------------------------*/
/* Levanto los datos Cargado											*/
/*----------------------------------------------------------------------*/

	$sql = "
		SELECT t1.id, t1.nombre, t1.apellido, t1.email, t1.telefono, t1.provincia, t1.ciudad, t1.modelo, t1.plan, t1.cuotas, t1.created, t1.envio_emails
		FROM contactos AS t1
		WHERE t1.id = '".$_GET['id']."' ";

	$result = mysql_query($sql,$db);

	if ($myrow = mysql_fetch_array($result)) {
		$id = $myrow["id"];
			$nombre = $myrow["nombre"];
			$apellido = $myrow["apellido"];
			$email = $myrow["email"];
			$telefono = $myrow["telefono"];
			$provincia = $myrow["provincia"];
			$ciudad = $myrow["ciudad"];
			$modelo = $myrow["modelo"];
			$plan = $myrow["plan"];
			$cuotas = $myrow["cuotas"];
			$created = $myrow["created"];
			$envio_emails = $myrow["envio_emails"];

	}else{
		exit;
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
<script type="text/javascript" src="js/jquery-1.3.2.min.js"></script>
<script type="text/javascript" src="js/jquery.autocomplete.js"></script>
<SCRIPT LANGUAGE="JavaScript" SRC="calendar/date.js"></SCRIPT>
<SCRIPT LANGUAGE="JavaScript" SRC="calendar/CalendarPopup.js"></SCRIPT>
<SCRIPT LANGUAGE="JavaScript">
	var cal = new CalendarPopup();
	cal.showNavigationDropdowns();
	cal.setYearSelectStartOffset(100);
</SCRIPT>
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

		<span class="titulo" style="margin: 0 25px 5px;; display: inline-block;">&nbsp;Modificar contacto</span>
		<form id="Formulario_Carga" method="post" name="Formulario_Carga" action="<?php echo $PHP_SELF ?>">
		<input type="hidden" name="accion" value="cargar">
		<input type="hidden" name="id" value="<?php echo $_GET['id'] ?>">
		  <table width="100%" border="0" cellspacing="0" cellpadding="5">

				  <tr>
					<td width="10%">Nombre:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_nombre" class="texto" size=60 value="<?php echo $nombre ?>">
					</td>
				  </tr>

				  <tr>
					<td width="10%">Apellido:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_apellido" class="texto" size=60 value="<?php echo $apellido ?>">
					</td>
				  </tr>

				  <tr>
					<td width="10%">Email:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_email" class="texto" size=60 value="<?php echo $email ?>">
					</td>
				  </tr>

				  <tr>
					<td width="10%">Tel&eacute;fono:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_telefono" class="texto" size=60 value="<?php echo $telefono ?>">
					</td>
				  </tr>

				  <tr>
					<td width="10%">Provincia:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_provincia" class="texto" size=60 value="<?php echo $provincia ?>">
					</td>
				  </tr>

				  <tr>
					<td width="10%">Ciudad:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_ciudad" class="texto" size=60 value="<?php echo $ciudad ?>">
					</td>
				  </tr>


				  <tr style="display: none;">
					<td width="10%">Modelo:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_modelo" class="texto" size=60 value="<?php echo $modelo ?>">
					</td>
				  </tr>

				  <tr style="display: none;">
					<td width="10%">Plan:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_plan" class="texto" size=60 value="<?php echo $plan ?>">
					</td>
				  </tr>

				  <tr style="display: none;">
					<td width="10%">Cuotas:</td>
					<td width="90%" class="texto_negro"><input type="text" name="add_cuotas" class="texto" size=60 value="<?php echo $cuotas ?>">
					</td>
				  </tr>


			<tr>
			  <td colspan="2" class="">
			  <input type="submit" name="Submit2" value="Modificar" class="input fdo_action_call">
			  </td>
			</tr>
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
