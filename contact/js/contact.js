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
    disableClass: myOptions.disableClass
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

  // 入力時に値を取得してバリデーションチェック
  // ノーマル
  this.getText = function ( label ) {

    formField.addEventListener( 'change', function () {

      let field = document.getElementById( label );
      let value = field.value;

      inputs[ label ] = value;
    } );
  }

  // ラジオボタン
  this.getRadio = function ( label ) {

    formField.addEventListener( 'change', function () {
      let value = null;
      let radios = document.getElementsByName( label );

      each( radios, function ( radio ) {
        if ( radio.checked ) {

          value = radio.value;
        }
      } );
      inputs[ label ] = value;
    } );
  }

  // チェックボックス
  this.getCheckbox = function ( label ) {
    formField.addEventListener( 'change', function () {

      let values = [];
      let checkboxes = document.getElementsByName( label );

      each( checkboxes, function ( checkbox ) {
        if ( checkbox.checked ) {

          values.push( checkbox.value );
        }
      } );
      inputs[ label ] = values;
    } );
  }

  // 必須チェック
  // テキスト要素
  this.requireText = function ( label, error ) {
    formField.addEventListener( 'change', function () {

      let field = document.getElementById( label );
      let value = field.value;

      if ( value.length < 1 ) {

        errors[ label ] = error;
      }
      else if ( errors[ label ] !== '' ) {

        errors[ label ] = '';
      }

      inputs[ label ] = value;
    } );
  }

  // チェックボックス
  this.requireCheckbox = function ( label, error ) {

    formField.addEventListener( 'change', function () {

      let values = [];
      let checkboxes = document.getElementsByName( label );

      each( checkboxes, function ( checkbox ) {
        if ( checkbox.checked ) {

          values.push( checkbox.value );
        }
      } );

      if ( values.length == 0 ) {

        errors[ label ] = error;
      }
      else if ( errors[ label ] !== '' ) {

        errors[ label ] = '';
      }

      inputs[ label ] = values;
    } );
  }

  // メールアドレスチェック
  this.checkEmail = function ( label, error ) {

    formField.addEventListener( 'change', function () {

      let field = document.getElementById( label );
      let value = field.value;
      const reg = new RegExp(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/);

      if ( value.length < 1 || !reg.test( value ) ) {

        errors[ label ] = error;
        inputs[ label ] = null;
      }
      else if ( errors[ label ] !== '' ) {

        errors[ label ] = '';
        inputs[ label ] = value;
      }
      else {

        inputs[ label ] = value;
      }
    } );
  }

  // 郵便番号チェック
  this.checkPostalcode = function ( label, error ) {

    formField.addEventListener( 'change', function () {

      let field = document.getElementById( label );
      let value = field.value;

      if ( value.length < 7 || isNaN( Number( value ) ) ) {

        errors[ label ] = error;
        inputs[ label ] = null;
      }
      else if ( errors[ label ] !== '' ) {

        errors[ label ] = '';
        inputs[ label ] = value;
      }
      else {

        inputs[ label ] = value;
      }
    } );
  }

  // 電話番号チェック
  this.checkTel = function ( label, error ) {

    formField.addEventListener( 'change', function () {

      let field = document.getElementById( label );
      let value = field.value;

      if ( value.length < 6 || isNaN( Number( value ) ) ) {

        errors[ label ] = error;
        inputs[ label ] = null;
      }
      else if ( errors[ label ] !== '' ) {

        errors[ label ] = '';
        inputs[ label ] = value;
      }
      else {

        inputs[ label ] = value;
      }
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

      if ( inputs[ require ] === null || !inputs[ require ] ) {
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
  }

  // エラー表示と送信ボタンの切り替え
  this.switchSubmitBtn = function () {

    formField.addEventListener( 'change', function () {

      if ( isError() ) {

        writeErrors();
        if ( submitBtn.classList.contains( options.disableClass ) === false ) {

          submitBtn.classList.add( options.disableClass );
        }
      }
      else {

        cautionArea.innterHTML = '';
        submitBtn.classList.remove( options.disableClass );
      }
    } )
  }

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

      console.log( reason );
    } );

    return response;
  }

  // 送信ボタンの処理
  this.sendData = function () {

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
  }


}

