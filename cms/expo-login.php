<?php
/*----------------------------------------------------------------------*/
/* Extracción de los datos del archivo de configuración                 */
/*----------------------------------------------------------------------*/
	include("expo-db.php");
/*----------------------------------------------------------------------*/
/* Limpio las variables													*/
/*----------------------------------------------------------------------*/
		//session_unregister('id_usuario');
		//session_unregister('u_permisos');
		unset ($id_usuario, $u_permisos);

/*----------------------------------------------------------------------*/
/* Validando acceso														*/
/*----------------------------------------------------------------------*/

	$continuar = "False";

	$db = mysql_connect(HOST, USUARIO, PASSWORD);
	mysql_select_db(DATABASE,$db);

	$sql = "SELECT t3.p_acceso, t1.u_id FROM usuarios AS t1, usuario_permiso AS t2, permisos AS t3 WHERE t1.u_id = t2.up_u_id AND t2.up_p_id = t3.p_id AND t1.u_usuario = '".$_POST['user_login']."' AND t1.u_password = '".$_POST['password_login']."';";
	$result = mysql_query($sql,$db);


	if ($myrow = mysql_fetch_array($result)) { // Si existe
		$id_usuario = $myrow["u_id"];
		$permisos = $myrow["p_acceso"];

		$redirect = "expo-contacto.php";
		$continuar = "True";
	}
/*----------------------------------------------------------------------*/

	if($continuar == "True"){
		session_start();

		$_SESSION['id_usuario'] = $id_usuario;
		$_SESSION['u_permisos'] = $permisos;

?>
<SCRIPT LANGUAGE="JavaScript">
<!--
	location.href = "<?php echo $redirect ?>";
//-->
</SCRIPT>
<html>
<body>
</body>
</html>
<?php
	}else{
?>
<!DOCTYPE html>
<html lang="es-AR" prefix="og: http://ogp.me/ns#">
<head>
<title>ExpoAgro - CRM</title>
<meta charset="UTF-8">
<link rel="stylesheet" href="styles/styles.css" type="text/css">
<script>

/* ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' */
/* '''''''''''''''       Habilita el pase          '''''''''''''''''*/
/* ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' */

function aceptar()
{
		if (blanco(document.Formulario.user_login.value))
		{
		alert("Por favor ingrese un nombre de usuario.");
				document.Formulario.user_login.focus();
				return false;
		}

		if (blanco(document.Formulario.password_login.value))
		{
		alert("Por favor ingrese una contraseña.");
				document.Formulario.password_login.focus();
				return false;
		}



	document.Formulario.submit();
	  return true;

}
/* ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''*/
/* '''''''''''''''Verifica que los campos no esten en blanco'''''''''''''''''' */
/* ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''*/

function blanco(s)
   {
	for (var i = 0; i < s.length; i++)
		{
		 var c = s.charAt(i);
		  if ((escape(c)!='%0D')&&(escape(c)!='%0A')&&(c !=" "))
				 return false;
		}
   return true
  }
/* ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' */
//-->
</script>
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
	  <td valign="top"><form action="expo-login.php" method="post" name="Formulario" onSubmit="aceptar(); return false">
	  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#282d31" height="22" align="center">
		<tr>
		  <td width="15" align="center" valign="top" height="23">&nbsp;</td>
		  <td valign="middle" height="23"><div id="topadmin">Administrador</div></td>
		</tr>
	  </table>
	  <table width="100%" border="0" cellspacing="0" cellpadding="0">
		<tr>
		  <td bgcolor="#FFFFFF" height="1"></td>
		</tr>
		<tr>
		  <td bgcolor="#00437C" height="1"></td>
		</tr>
	  </table>
	  <br>
		<table width="50%" border="0" cellspacing="3" cellpadding="0" align="center" bgcolor="#282d31">
		  <tr>
			<td valign="middle" class="texto_blanco" width="193" align="right">&#149;
			  Usuario&nbsp;</td>
			<td class="texto" width="360" valign="middle">
			  <input type="text" name="user_login" size="20" maxlength="20" class="texto" >
			</td>
		  </tr>
		  <tr>
			<td valign="middle" class="texto_blanco" width="193" align="right"> &#149;
			  Password&nbsp;</td>
			<td valign="middle" class="texto" width="360">
			  <input type="password" name="password_login" size="14" maxlength="10" class="texto" >
			</td>
		  </tr>
		  <tr>
			<td valign="middle" class="texto" colspan="2" align="center"><b><font size="2" face="Verdana">
			  <input type="submit" name="enviar datos" value="Ingresar" >
			  </font></b></td>
		  </tr>
		</table>
	  </form></td>
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

<?php
	}
?>
