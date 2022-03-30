<?php

// ドメインを使用サイトのものに書き換える
header("Access-Control-Allow-Origin: 使用サイト");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

require "libs/functions.php";

$json = file_get_contents("php://input");
$api_header = header( 'content-type: application/json; charset=UTF-8' );

if( $json ) {
  $inputs = checkInput( json_decode($json, true) );
  $inputs_text = "";

  checkAllBlank( $inputs );

  foreach( $inputs as $key => $value ) {
    $inputs_text .= h( $key ). ": ". h( $value ). "\n";
  }
} else {
  $api_header;
  echo json_encode('情報がありません');
}

if( $_SERVER["REQUEST_METHOD"] === 'POST' ) {

  require "libs/mailvars.php";

  $subject = MAIL_SUBJECT_TEXT;
  $mail_body = MAIL_INTRO_TEXT. "\n\n". $inputs_text;

  $mailTo = mb_encode_mimeheader( MAIL_TO_NAME ) . "<" . MAIL_TO . ">";
  $returnMail = MAIL_RETURN_PATH;
  $mailName = deleteLf( h( $inputs[ MAIL_FROM_NAME ] ) );
  $mailAddress = deleteLf( h( $inputs[ MAIL_FROM ] ) );

  mb_language( 'ja' );
  mb_internal_encoding( 'UTF-8' );

  $header = "From: " . mb_encode_mimeheader( $mailName ) . "<" . $mailAddress . ">\n";
  //$header .= "Cc: " . mb_encode_mimeheader( MAIL_CC_NAME ) . "<" . MAIL_CC . ">\n";
  //$header .= "Bcc: <" . MAIL_BCC . ">";

  $result = mb_send_mail( $mailTo, $subject, $mail_body, $header, '-f'. $returnMail );

  if( $result ) {
    $api_header;
    echo json_encode("complete");
  } else {
    $api_header;
    echo json_encode("fail");
  }

  exit;

} else {
  $api_header;
  echo json_encode('不正なアクセスです');
}

?>