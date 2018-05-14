<table id="header" width="100%" border="0" cellpadding="0" cellspacing="0" color="#ffffff" bgcolor="#000000">
	<tr>
	  <td class="level-1" align="left">
		<table width="100%" border="0" cellspacing="0" cellpadding="0">
		  <tr>
			<td width="100" valign="middle">
				<img src="images/logo-mercedes-benz.png" vspace="2" width="65" hspace="20">
			</td>
			<td valign="middle">
				<h1 class="titulo">Mercedes-Benz Plan de Ahorro</h1>
			</td>
		  </tr>
		</table>
	  </td>

	  <td class="level-1" align="right">
		  <?php if( isset($_SESSION['id_usuario']) ){ ?>
			  <div id="topadmin"><A HREF="expo-cerrar.php" class="fdo_action_call">Cerrar Sesión</A></div>
		  <?php }?>
	  </td>
	</tr>
</table>
