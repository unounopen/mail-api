function UnoMail( myOptions ) {
  let options =
  {
    apiUrl: myOptions.apiUrl,
    thxUrl: myOptions.thxUrl,
    requires: myOptions.requires,
    formId: myOptions.formId,
    submitId: myOptions.submitId,
    cautionId: myOptions.cautionId,
    faildText: myOptions.faildText,
  };
  let errors = {};
  let inputs = {};
  let formField = document.getElementById( options.formId );
  let submitBtn = document.getElementById( options.submitId );
  let cautionArea = document.getElementById( options.cautionId );

  // NodeListのためのfor文ラッパー関数
  var each = function ( NodeList, iteratee ) {

    for ( var i = 0; i < NodeList.length; i++ ) {

      iteratee( NodeList[ i ], i, NodeList );
    }
  }

  // テキスト要素
  this.getText = function ( id, label, error = null, flag = null ) {

    const field = document.getElementById( id );

    if ( error !== null && errors[ id ] == undefined ) {

      errors[ id ] = error;
    }

    field.addEventListener( 'change', () => {

      let value = field.value;

      inputs[ id ] = {
        label: label,
        value: value
      };

      if ( error !== null ) {

        if ( flag == null ) { // 必須チェック

          if ( value.length < 1 ) {

            errors[ id ] = error;
          }
          else if ( errors[ id ].length > 0 ) {

            errors[ id ] = '';
          }
        }
        else if ( flag == 'tel' ) { // 電話番号チェック

          if ( value.length < 7 || isNaN( Number( value ) ) ) {

            errors[ id ] = error;
            inputs[ id ] = {
              label: label,
              value: null
            };
          }
          else if ( errors[ id ].length > 0 ) {

            errors[ id ] = '';
          }
        }
        else if ( flag == 'email' ) { // メールアドレスチェック

          const reg = new RegExp(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/);

          if ( value.length < 1 || !reg.test( value ) ) {

            errors[ id ] = error;
            inputs[ id ] = {
              label: label,
              value: null
            };
          }
          else if ( errors[ id ].length > 0 ) {

            errors[ id ] = '';
          }
        }
        else if ( flag == 'postalcode' ) { // 郵便番号チェック

          if ( value.length < 7 || isNaN( Number( value ) ) ) {

            errors[ id ] = error;
            inputs[ id ] = {
              label: label,
              value: null
            };
          }
          else if ( errors[ id ].length > 0 ) {

            errors[ id ] = '';
          }
        }
      }
    } );
  }

  // ラジオボタン
  this.getRadio = function ( id, label ) {

    const radios = document.getElementsByName( id );

    each( radios, function ( radio ) {

      radio.addEventListener( 'change', () => {

        let value = null;

        if ( radio.checked ) {

          value = radio.value;
        }

        inputs[ id ] = {
          label: label,
          value: value
        };
      } );
    } );
  }

  // チェックボックス
  this.getCheckbox = function ( id, label, error = null ) {

    const checkboxes = document.getElementsByName( id );
    let values = [];

    if ( error !== null && errors[ id ] == undefined ) {

      errors[ id ] = error;
    }

    each( checkboxes, function ( checkbox ) {

      checkbox.addEventListener( 'change', () => {

        if ( checkbox.checked ) {

          values.push( checkbox.value );
        }
        else if ( values.includes( checkbox.value ) ) {

          var index = values.indexOf( checkbox.value );
          values.splice( index, 1 );
        }

        inputs[ id ] = {
          label: label,
          value: values
        };

        if ( error !== null ) {

          if ( values.length == 0 ) {

            errors[ id ] = error;
          }
          else if ( errors[ id ] !== '' ) {

            errors[ id ] = '';
          }
        }
      } );
    } );
  }

  // エラーの有無をチェック
  var isError = function () {

    let error = ( value ) => value.length > 0;
    return Object.values( errors ).some( error );
  }

  // 必須項目の入力チェック
  var isBlank = function () {

    for ( var i = 0; i < options.requires.length; i++ ) {

      var require = options.requires[ i ];

      if ( inputs[ require ].value === null || !inputs[ require ].value ) {
        return true;
      }
    }
    return false;
  }

  // エラーメッセージの出力
  var writeErrors = function () {

    let errorsText = '';

    Object.values( errors ).forEach( value => {

      if ( value !== '' ) {

        errorsText += `<p>${ value }</p>`;
      }
    } );

    cautionArea.innerHTML = errorsText;
  };

  // 読み込み時には送信ボタンが使用不可
  ( () => {

    window.addEventListener( 'DOMContentLoaded', () => {

      submitBtn.disabled = true;
    } );
  } )();

  // エラー表示と送信ボタンの切り替え
  ( () => {

    formField.addEventListener( 'change', function () {

      writeErrors();

      if ( isError() ) {

        submitBtn.disabled = true;
      }
      else {

        submitBtn.disabled = false;
      }
    } )
  } )();

  // apiとの通信
  var sendMail = async function ( url, inputs ) {

    let response = '';

    const json = JSON.stringify( inputs );
    const headers =
    {
      'Content-Type': 'application/json'
    };

    await fetch( url, { method: 'POST', headers: headers, body: json } )
    .then( ( res ) => {

      if ( !res.ok ) {

        throw new Error( `${res.status} ${res.statusText}` );
      }

      return res.json();
    } )
    .then( data => {

      response = data;
    } )
    .catch( ( reason ) => {
    } );

    return response;
  };

  // 送信ボタンの処理

  ( () => {

    submitBtn.addEventListener( 'click', async function () {

      if ( isError() || isBlank() ) {

        writeErrors();
      }
      else {

        const result = await sendMail( options.apiUrl, inputs );

        if ( result === 'complete' ) {

          location = options.thxUrl;
        }
        else {

          cautionArea.innerHTML = options.faildText;
        }
      }
    } )
  } )();


}

