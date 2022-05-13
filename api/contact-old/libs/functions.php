<?php

// エスケープ処理
function h( $var ) {
  if( is_array( $var ) ) {
    return array_map( 'h', $var );
  } else {
    return htmlspecialchars( $var, ENT_QUOTES, 'UTF-8' );
  }
}

// 不正データチェック
function checkInput( $var ) {
  if( is_array( $var ) ) {
    return array_map( 'checkInput', $var );
  } else {
    if( preg_match( '/\0/', $var ) ) {
      die( json_encode('不正な入力です') );
    }
    if( !mb_check_encoding( $var, 'UTF-8' ) ) {
      die( json_encode('不正な入力です') );
    }
    if( preg_match( '/\A[\r\n\t[:^cntrl:]]*\z/u', $var ) === 0 ) {
      die( json_encode('不正な入力です。制御文字は使用できません') );
    }
    return $var;
  }
}

// 改行コード削除
function deleteLf( $var ) {
  $plain = str_replace( PHP_EOL, '', $var );
  return str_replace( array("\r\n", "\r", "\n"), '', $plain );
}

// 全部空かどうかチェック
function checkAllBlank( $var ) {
  if( is_object( $var ) ) {
    foreach( $var as $key => $value ) {
      if( is_nullorwhitespace( $value ) === false ) {
        return;
      }
    }
    die( json_encode('全て空欄です') );
  }
  elseif( is_array( $var ) ) {
    foreach( $var as $item ) {
      if( is_nullorwhitespace( $item ) === false ) {
        return;
      }
    }
    die( json_encode('全て空欄です') );
  }
  else {
    if( is_nullorwhitespace( $var ) === false ) {
      return;
    }
    die( json_encode('全て空欄です') );
  }
}

if( !function_exists('is_nullorempty') ) {
  function is_nullorempty( $obj ) {
    if( $obj === 0 || $obj === "0" ) {
      return false;
    }
    return empty( $obj );
  }
}

if( !function_exists('is_nullorwhitespace') ) {
  function is_nullorwhitespace( $obj ) {
    if( is_nullorempty( $obj ) === true ) {
      return true;
    }
    if( is_string( $obj ) && mb_ereg_match( "^(\s| )+$", $obj ) ) {
      return true;
    }
    return false;
  }
}

?>