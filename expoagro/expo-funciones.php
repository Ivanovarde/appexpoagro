<?php
/*--------------------------------------------------------------------*/
/*    Convierte fecha de normal(Dia-Mes-Año) a MySql(Año-Mes-Dia)     */
/*--------------------------------------------------------------------*/

	function cambiaf_a_mysql($fecha) {
		ereg( "([0-9]{1,2})/([0-9]{1,2})/([0-9]{2,4})", $fecha, $mifecha);
		$lafecha=$mifecha[3]."-".$mifecha[2]."-".$mifecha[1];

		if(!empty($mifecha[4])){
			$lafecha .= " ".$mifecha[4].":".$mifecha[5];
		}


		if($lafecha == "--"){
			return "0000-00-00";
		}
		return $lafecha;
	}

	function cambiaf_a_mysql_c_hora($fecha) {
		ereg( "([0-9]{1,2})/([0-9]{1,2})/([0-9]{2,4}) ([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})", $fecha, $mifecha);
		$lafecha=$mifecha[3]."-".$mifecha[2]."-".$mifecha[1];

		if(!empty($mifecha[4])){
			$lafecha .= " ".$mifecha[4].":".$mifecha[5];
		}


		if($lafecha == "--"){
			return "0000-00-00";
		}
		return $lafecha;
	}


/*-------------------------------------------------------------------------*/
/* FUNCION QUE convierte fecha de MySql(Año-Mes-Dia) a normal(Dia-Mes-Año) */
/*-------------------------------------------------------------------------*/

	function cambiaf_a_normal($fecha) {
		ereg( "([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})", $fecha, $mifecha);
		$lafecha=$mifecha[3]."/".$mifecha[2]."/".$mifecha[1];

		if(!empty($mifecha[4])){
			$lafecha .= " ".$mifecha[4].":".$mifecha[5];
		}

		if($lafecha == "//"){
			return "00/00/0000";
		}

		return $lafecha;
	}

	function cambiaf_a_normal_c_hora($fecha) {
		ereg( "([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2}) ([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})", $fecha, $mifecha);
		$lafecha=$mifecha[3]."/".$mifecha[2]."/".$mifecha[1];

//print_r($mifecha);
//echo $lafecha;

		if(!empty($mifecha[4])){
			$lafecha .= " ".$mifecha[4].":".$mifecha[5];
		}

		if($lafecha == "//"){
			return "00/00/0000";
		}

		return $lafecha;
	}

/*--------------------------------------------------------------------*/
/*	Muestro un Combo Especifico										  */
/*--------------------------------------------------------------------*/

	function mostrarSelect($tipo_combo, $id_seleccionado = ""){

		$db = mysql_connect(HOST, USUARIO, PASSWORD);
		mysql_select_db(DATABASE,$db);

		switch($tipo_combo){
			case "formato_banner":
				$sql = "SELECT t1.id_formato_banner AS id_aux, t1.nombre_formato AS nombre_aux FROM formato_banner AS t1 ORDER BY t1.nombre_formato";
				break;

			case "ubicacion_banner":
				$sql = "SELECT t1.id_ubicacion AS id_aux, t1.nombre_ubicacion AS nombre_aux FROM ubicacion_banners AS t1 ORDER BY t1.nombre_ubicacion";
				break;

			case "autores":
				$sql = "SELECT t1.id_autor AS id_aux, t1.nombre_autor AS nombre_aux FROM autores AS t1 ORDER BY t1.nombre_autor";
				break;

			case "perfiles":
				$sql = "SELECT t1.id_perfil AS id_aux, t1.nombre_perfil_esp AS nombre_aux FROM perfiles AS t1 ORDER BY t1.nombre_perfil_esp";
				break;

		}

		$result = mysql_query($sql,$db);

		if ($myrow = mysql_fetch_array($result)) {
			do {
				$id_aux = $myrow["id_aux"];
				$nombre_aux = $myrow["nombre_aux"];

				if($id_aux == $id_seleccionado){
					$txt_selected = " selected ";
				}else{
					$txt_selected = " ";
				}

				echo '<option value="'.$id_aux.'"'.$txt_selected.'>'.$nombre_aux;

			}while ($myrow = mysql_fetch_array($result));
		}
	}

/*--------------------------------------------------------------------*/
/*	Muestro SELECT booleano											  */
/*--------------------------------------------------------------------*/

	function MostrarBooleano($booleano_seleccionar = ""){

		switch($booleano_seleccionar){
			case "S":
				echo '
						<option value="S" selected>Sí
						<option value="N">No
				';
				break;
			case "N":
				echo '
						<option value="S">Sí
						<option value="N" selected>No
				';
				break;
			default:
				echo '
						<option value="S">Sí
						<option value="N">No
				';
				break;
		}
	}

/*--------------------------------------------------------------------*/
/*	esUnArchivoValido: Funcion que chequea la extension del nombre    */
/*  del archivo que recibe y devuelve true si es valida               */
/*  y false si es invalida.                                           */
/*--------------------------------------------------------------------*/

	function esUnArchivoValido($nombre_archivo){

		$extensiones_validas = array("doc","pdf");

		if(in_array(obtenerExtension($nombre_archivo), $extensiones_validas)){
			return true;
		}
		return false;
	}

/*--------------------------------------------------------------------*/
/*	esUnaImagenValida: Funcion que chequea la extension del nombre    */
/*  del archivo que recibe y devuelve true si es valida               */
/*  y false si es invalida.                                           */
/*--------------------------------------------------------------------*/

	function esUnaImagenValida($nombre_imagen){

		$extensiones_validas = array("jpg","jpeg","gif","png","JPG","GIF","PNG");

		if(in_array(obtenerExtension($nombre_imagen), $extensiones_validas)){
			return true;
		}
		return false;
	}

/*--------------------------------------------------------------------*/
/*	obtenerExtension: devuelve la extensión de un archivo y           */
/*	devuelve 0 si no tiene extensión.								  */
/*--------------------------------------------------------------------*/

	function obtenerExtension($nombre_archivo){

		$posicion_punto = strrpos($nombre_archivo,".");

		if(!$posicion_punto == FALSE){
			return substr($nombre_archivo, 1 + $posicion_punto);
		}else{
			return 0;
		}
	}
/*-------------------------------------------------------------------------*/
?>
