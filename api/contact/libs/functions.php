<?php

class UnoMail 
{

  // プロパティ
  public $json = NULL;
  public $mail_to = '';
  public $mail_to_name = '';
  public $mail_return_path = '';
  public $mail_subject_text = '';
  public $mail_intro_text = '';
  public $mail_from = '';
  public $mail_from_name = '';

  // メソッド
  public function api_header() {
    return header( 'content-type: application/json; charset=UTF-8' );
  }

  public function json() {
    file_get_contents("php://input");
  }

  // エスケープ処理
  public function h( $var ) {

    if ( is_array( $var ) ) {

      return array_map( 'h', $var );
    }
    else {

      return htmlspecialchars( $var, ENT_QUOTES, 'UTF-8' );
    }
  }

  // 不正データチェック
  public function checkInput( $var ) {

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
  public function deleteLf( $var ) {

    $plain = str_replace( PHP_EOL, '', $var );

    return str_replace( array( '\r\n', '\r', '\n' ), '', $plain );
  }

  // 全空欄チェック
  public function checkAllBlank( $var ) {

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

}

?>