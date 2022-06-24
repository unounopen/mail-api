<?php

class UnoMail
{

  // プロパティ
  private $options = [];
  private $json = NULL;
  private $inputs = NULL;
  private $inputs_text = '';
  private $mail_to = '';
  private $mail_from_address = '';
  private $mail_from_name = '';
  private $mail_body = '';
  private $header = '';
  private $result = '';
  private $reply_mail_text = '';
  private $reply_mail_signature = '';
  private $reply_mail_to_address = '';
  private $reply_mail_to_name = '';
  private $reply_mail_to = '';
  private $reply_mail_body = '';
  private $reply_header = '';
  private $reply_result = '';

  // メソッド
  // エスケープ処理
  private function h( $var ) {

    if ( is_array( $var ) ) {

      return array_map( array( $this, 'h' ), $var );
    }
    else {

      return htmlspecialchars( $var, ENT_QUOTES, 'UTF-8' );
    }
  }

  // 不正データチェック
  private function checkInput( $var ) {

    if( is_array( $var ) ) {

      return array_map( array( $this, 'checkInput' ), $var );
    }
    else {

      if ( preg_match( '/\0/', $var ) ) {

        die( json_encode( '不正な入力です', JSON_UNESCAPED_UNICODE ) );
      }
      if ( !mb_check_encoding( $var, 'UTF-8' ) ) {

        die( json_encode( '不正な入力です', JSON_UNESCAPED_UNICODE ) );
      }
      if ( preg_match( '/\A[\r\n\t[:^cntrl:]]*\z/u', $var ) === 0 ) {

        die( json_encode( '不正な入力です。制御文字は使用できません', JSON_UNESCAPED_UNICODE ) );
      }

      return $var;
    }
  }

  // 改行コード削除
  private function deleteLf( $var ) {

    $plain = str_replace( PHP_EOL, '', $var );

    return str_replace( array( '\r\n', '\r', '\n' ), '', $plain );
  }

  // 個別空欄チェック（0は除外）
  private function is_nullorempty( $var ) {

    if ( $var === 0 || $var === "0" ) {

      return false;
    }

    return empty( $var );
  }

  // 個別空欄チェック（ホワイトスペースも対象）
  private function is_nullorwhitespace( $var ) {

    if ( $this->is_nullorempty( $var ) === true ) {

      return true;
    }
    if ( is_string( $var ) && mb_ereg_match( '^(\s| )+$', $var ) ) {

      return true;
    }
    return false;
  }

  // 全空欄チェック
  private function checkAllBlank( $var ) {

    if ( is_array( $var ) ) {

      foreach ( $var as $content ) {

        if ( $this->is_nullorwhitespace( $content[ 'value' ] ) === false ) {

          return;
        }
      }
      die( json_encode( '全て空欄です', JSON_UNESCAPED_UNICODE ) );
    }

    die( json_encode( 'データが正しい形式ではありません', JSON_UNESCAPED_UNICODE ) );
  }

  // オブジェクトのテキスト変換
  private function changeObjText( $obj ) {

    foreach ( $obj as $item ) {

      $this->inputs_text .= $this->h( $item[ 'label' ] ). ': ';

      if ( is_array( $item[ 'value' ] ) ) {

        foreach ( $item[ 'value' ] as $value_item ) {

          $this->inputs_text .= $this->h( $value_item ). ',';
        }

        $this->inputs_text .= "\n";
      }
      else {

        $this->inputs_text .= $this->h( $item[ 'value' ] ). "\n";
      }
    }
  }

  // コンストラクタ
  public function __construct(
    $options = [
      'domain' => '',
      'mail_to_address' => '',
      'mail_to_name' => '',
      'mail_return_path' => '',
      'mail_subject_text' => '',
      'mail_intro_text' => '',
      'mail_from_address_id' => '',
      'mail_from_name_id' => '',
      'auto_reply' => false
  ] )
  {

    $this->options = $options;

    header("Access-Control-Allow-Origin: " . $this->options['domain'] );
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");

    $this->json = file_get_contents("php://input");

    if ( $this->json != NULL ) {

      $this->inputs = $this->checkInput( json_decode($this->json, true) );
      $this->checkAllBlank( $this->inputs );
      $this->changeObjText( $this->inputs );

    }
    else {

      header( 'content-type: application/json; charset=UTF-8' );
      die( json_encode( '情報がありません', JSON_UNESCAPED_UNICODE ) );
    }

    if ( $_SERVER['REQUEST_METHOD'] === 'POST' ) { // 運営者へのメール送信

      $this->mail_body = $this->options['mail_intro_text'] . "\n\n" . $this->inputs_text;
      $this->mail_to = mb_encode_mimeheader( $this->options['mail_to_name'] ) . "<" . $this->options['mail_to_address'] . ">";
      $this->mail_from_name = $this->deleteLf( $this->h( $this->inputs[ $this->options['mail_from_name_id'] ][ 'value'] ) );
      $this->mail_from_address = $this->deleteLf( $this->h( $this->inputs[ $this->options['mail_from_address_id'] ][ 'value'] ) );

      mb_language( 'ja' );
      mb_internal_encoding( 'UTF-8' );

      $this->header = "From: " . mb_encode_mimeheader( $this->mail_from_name ) . "<" . $this->mail_from_address . ">\n";
      $this->result = mb_send_mail( $this->mail_to, $this->options['mail_subject_text'], $this->mail_body, $this->header, '-f'. $this->options['mail_return_path'] );

      if ( $this->options['auto_reply'] ) { // 自動返信

        $this->reply_mail_text = file_get_contents( __DIR__ . '/autoreply.txt' );
        $this->reply_mail_signature = file_get_contents( __DIR__ . '/signature.txt' );

        $this->reply_mail_body = $this->reply_mail_text . "\n\n" . $this->inputs_text . "\n\n" . $this->reply_mail_signature;
        $this->reply_mail_to_name = $this->mail_from_name;
        $this->reply_mail_to_address = $this->mail_from_address;
        $this->reply_mail_to = mb_encode_mimeheader( $this->reply_mail_to_name ) . "<" . $this->reply_mail_to_address . ">";

        mb_language( 'ja' );
        mb_internal_encoding( 'UTF-8' );

        $this->reply_header = "From: " . mb_encode_mimeheader( $this->options['mail_to_name'] ) . "<" . $this->options['mail_to_address'] . ">\n";
        $this->reply_result = mb_send_mail( $this->reply_mail_to, $this->options['auto_reply_subject_text'], $this->reply_mail_body, $this->reply_header, '-f'. $this->options['mail_return_path'] );

        if( $this->result && $this->reply_result ) {

          header( 'content-type: application/json; charset=UTF-8' );
          echo json_encode("complete");
        }
        else {

          header( 'content-type: application/json; charset=UTF-8' );
          echo json_encode("fail");
        }
      }
      else {

        if( $this->result ) {

          header( 'content-type: application/json; charset=UTF-8' );
          echo json_encode("complete");
        }
        else {

          header( 'content-type: application/json; charset=UTF-8' );
          echo json_encode("fail");
        }
      }

      exit;
    }
    else {

      header( 'content-type: application/json; charset=UTF-8' );
      die( json_encode( '不正なアクセスです', JSON_UNESCAPED_UNICODE ) );
    }
  }

}

?>