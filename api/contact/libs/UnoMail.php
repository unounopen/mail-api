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

  // メソッド
  // エスケープ処理
  private function h( $var ) {

    if ( is_array( $var ) ) {

      return array_map( 'h', $var );
    }
    else {

      return htmlspecialchars( $var, ENT_QUOTES, 'UTF-8' );
    }
  }

  // 不正データチェック
  private function checkInput( $var ) {

    if( is_array( $var ) ) {

      return array_map( 'checkInput', $var );
    }
    else {

      if ( preg_match( '/\0/', $var ) ) {

        die( json_encode('不正な入力です') );
      }
      if ( !mb_check_encoding( $var, 'UTF-8' ) ) {

        die( json_encode('不正な入力です') );
      }
      if ( preg_match( '/\A[\r\n\t[:^cntrl:]]*\z/u', $var ) === 0 ) {

        die( json_encode('不正な入力です。制御文字は使用できません') );
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

    if ( is_object( $var ) ) {

      foreach ( $var as $key => $value ) {

        if ( $this->is_nullorwhitespace( $value ) === false ) {

          return;
        }
      }
      die( json_encode('全て空欄です') );
    }
    elseif ( is_array( $var ) ) {

      foreach ( $var as $item ) {

        if ( $this->is_nullorwhitespace( $item ) === false ) {

          return;
        }
      }
      die( json_encode('全て空欄です') );
    }
    else {

      if ( $this->is_nullorwhitespace( $var ) === false ) {

        return;
      }
      die( json_encode('全て空欄です') );
    }
  }

  // オブジェクトのテキスト変換
  private function changeObjText( $obj ) {

    foreach ( $obj as $key => $value ) {

      if ( is_array( $value ) ) {

        $this->inputs_text .= $this->h( $key ). ": ";

        foreach( $value as $item ) {

          $this->inputs_text .= $this->h( $item ). ", ";
        }

        $this->inputs_text .= "\n";
      }
      else {

        $this->inputs_text .= $this->h( $key ). ": ". $this->h( $value ). "\n";
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
      'mail_from_name_id' => ''
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
      echo json_encode('情報がありません');
    }

    if ( $_SERVER['REQUEST_METHOD'] === 'POST' ) {

      $this->mail_body = $this->mail_intro_text . "\n\n" . $this->inputs_text;
      $this->mailTo = mb_encode_mimeheader( $this->options['mail_to_name'] ) . "<" . $this->options['mail_to_address'] . ">";
      $this->mail_from_name = $this->deleteLf( $this->h( $this->inputs[ $this->options['mail_from_name_id'] ] ) );
      $this->mail_from_address = $this->deleteLf( $this->h( $this->inputs[ $this->options['mail_from_address_id'] ] ) );

      mb_language( 'ja' );
      mb_internal_encoding( 'UTF-8' );

      $this->header = "From: " . mb_encode_mimeheader( $this->mail_from_name ) . "<" . $this->mail_from_address . ">\n";
      $this->result = mb_send_mail( $this->mail_to, $this->options['mail_subject_text'], $this->mail_body, $this->header, '-f'. $this->options['mail_return_path'] );

      if( $this->result ) {

        header( 'content-type: application/json; charset=UTF-8' );
        echo json_encode("complete");
      }
      else {

        header( 'content-type: application/json; charset=UTF-8' );
        echo json_encode("fail");
      }

      exit;
    }
    else {

      header( 'content-type: application/json; charset=UTF-8' );
      echo json_encode('不正なアクセスです');
    }
  }

}

?>