<?php
	session_start();
	//session_unregister('id_usuario');

	header("Location: index.php"); /* Redirect browser */
	exit;
?>
