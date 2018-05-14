<?php
	session_start(); 

	if(isset($_SESSION['id_usuario'])){
		$continuar = "True";
	}else{
		$continuar = "False";
	}

	$continuar = "True";
	if($continuar == "False"){
?>
<SCRIPT LANGUAGE="JavaScript">
		<!--
			location.href = "index.php";
		//-->
</SCRIPT>
<?php
	}
?>