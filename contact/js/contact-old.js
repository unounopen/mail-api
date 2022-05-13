window.addEventListener('load', function() {

  // apiのurl
  const api = "ドメイン/api/contact/send.php";
  // サンクスページのurl
  const thx = "ドメイン/contact/thanks.html";

  const errors = {};
  const inputs = {};

  // 必須にしたい要素のid集（必要に応じて書き換える）
  const requires = [ 'content', 'name', 'email', 'type1', 'check1' ];

  // formタグに設定したidを括弧の中に入れる
  const formField = document.getElementById('formArea');

  // buttonタグに設定したidを括弧の中に入れる
  const sendBtn = document.getElementById('sendBtn');

  // エラー表示箇所に設定したidを括弧の中に入れる
  const errorsArea = document.getElementById('errorsArea');

  // 送信失敗メッセージ
  const failedText = "送信に失敗しました。恐れ入りますが、時間をおいて再度お試しいただくか、お電話でお問い合わせください。"

  // バリデーションチェックとエラーメッセージ（テキストベース）第1引数はinputやtextareaのidと揃えること。第2引数はエラーとして出力される文字列（getから始まる関数にはいらない）
  // チェックが必要ないならgetText、必須チェックだけならrequireText、メアド・郵便番号・電話番号はcheckEmail・checkPostalcode・checkTel
  requireText( 'content', 'お問い合わせ内容を入力してください' );
  requireText( 'name', 'お名前を入力してください' );
  getText( 'company' );
  checkEmail( 'email', 'メールアドレスを正しい形式で入力してください');
  checkPostalcode( 'postalcode', '郵便番号は7桁以上の数字で入力してください');
  getText( 'address' );
  checkTel( 'tel', '電話番号は6桁以上の数字で入力してください');
  // バリデーションチェックとエラーメッセージ(ラジオボタン) 第1引数はラジオボタンのnameと揃えること。第2引数はエラーとして出力される文字列（getから始まる関数にはいらない）
  // 取得だけでいいならgetRadio、必須チェックが要るならrequireRadio
  getRadio( 'type' );
  requireRadio( 'type1', "ラジオボタンを選択してください" );
  // バリデーションチェックとエラーメッセージ(チェックボックス) 第1引数はチェックボックスのnameと揃えること。第2引数はエラーとして出力される文字列（getから始まる関数にはいらない）
  // 取得だけでいいならgetCheckbox、必須チェックが要るならrequireCheckbox
  getCheckbox( 'check' );
  requireCheckbox( 'check1', "チェックボックスを選択してください" );





  // ここから下は基本的に触らない。必要に応じてカスタマイズ


  // フォームが変更になるたびにerrorsAreaを更新し、エラーの有無でsendBtnのスタイルを変更
  formField.addEventListener( 'change', function() {
    if( isError() ) {
      writeErrors();
      if( sendBtn.classList.contains("disable") === false ) {
        sendBtn.classList.add("disable");
      }
    } else {
      errorsArea.innerHTML = "";
      sendBtn.classList.remove("disable");
    }
  });

  // 送信ボタンの処理
  sendBtn.addEventListener('click', async function() {

    if( isError() || isBlank() ) {

      writeErrors();

    } else {

      const result = await send( api, inputs );

      if( result === "complete" ) {
        location = thx;
      } else {
        errorsArea.innerHTML = failedText;
      }
    }

  });

  // 入力時に値を取得してバリデーションチェック
  // ノーマル
  function getText( label ) {

    formField.addEventListener( 'change', function() {
      let field = document.getElementById(label);
      let value = field.value;
      inputs[label] = value;
    });
  }

  // ラジオボタン
  function getRadio( label ) {

    formField.addEventListener( 'change', function() {
      let value = null;
      let radios = document.getElementsByName(label);
      each( radios, function(radio) {
        if( radio.checked ) {
          value = radio.value;
        }
      });
      inputs[label] = value;
    });
  }

  // チェックボックス
  function getCheckbox( label ) {

    formField.addEventListener( 'change', function() {
      let values = [];
      let checkboxes = document.getElementsByName(label);
      each( checkboxes, function(checkbox) {
        if( checkbox.checked ) {
          values.push(checkbox.value);
        }
      });
      inputs[label] = values;
    });
  }

  // 必須チェック(テキスト要素)
  function requireText( label, error ) {

    formField.addEventListener( 'change', function() {
      let field = document.getElementById(label);
      let value = field.value;

      if( value.length < 1 ) {

        errors[label] = error;

      } else if( errors[label] !== "" ) {

        errors[label] = "";

      }
      inputs[label] = value;
    });
  }

  // 必須チェック（ラジオボタン）
  function requireRadio( label, error ) {

    formField.addEventListener( 'change', function() {
      let value = null;
      let radios = document.getElementsByName(label);
      each( radios, function(radio) {
        if( radio.checked ) {
          value = radio.value;
        }
      });
      if( value === null ) {

        errors[label] = error;

      } else if( errors[label] !== "" ) {
        errors[label] = "";

      }
      inputs[label] = value;
    });
  }

  // 必須チェック（チェックボックス）
  function requireCheckbox( label, error ) {

    formField.addEventListener( 'change', function() {
      let values = [];
      let checkboxes = document.getElementsByName(label);
      each( checkboxes, function(checkbox) {
        if( checkbox.checked ) {
          values.push(checkbox.value);
        }
      });
      if( values.length == 0 ) {

        errors[label] = error;

      } else if( errors[label] !== "" ) {
        errors[label] = "";

      }
      inputs[label] = values;
    });
  }

  // アドレスチェック
  function checkEmail( label, error ) {

    formField.addEventListener( 'change', function() {
      let field = document.getElementById(label);
      let value = field.value;
      const reg = new RegExp(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/);

      if( value.length < 1 || !reg.test(value) ) {

        errors[label] = error;
        inputs[label] = null;

      } else if( errors[label] !== "" ) {

        errors[label] = "";
        inputs[label] = value;

      } else {

        inputs[label] = value;
      }
    });
  }

  // 郵便番号チェック
  function checkPostalcode( label, error ) {

    formField.addEventListener( 'change', function() {
      let field = document.getElementById(label);
      let value = field.value;

      if( value.length < 7 || isNaN(Number(value)) ) {

        errors[label] = error;
        inputs[label] = null;

      } else if( errors[label] !== "" ) {

        errors[label] = "";
        inputs[label] = value;

      } else {

        inputs[label] = value;
      }
    });
  }

  // 電話番号チェック
  function checkTel( label, error ) {

    formField.addEventListener( 'change', function() {
      let field = document.getElementById(label);
      let value = field.value;

      if( value.length < 6 || isNaN(Number(value)) ) {

        errors[label] = error;
        inputs[label] = null;

      } else if( errors[label] !== "" ) {

        errors[label] = "";
        inputs[label] = value;

      } else {

        inputs[label] = value;
      }
    });
  }

  // エラーの有無チェック
  function isError() {
    const error = (value) => value.length > 0;
    return Object.values(errors).some( error );
  }

  // 必須項目の入力チェック
  function isBlank() {
    for(var i = 0; i < requires.length; i++) {
      var require = requires[i];
      if(inputs[require] === null || !inputs[require]) {
        return true;
      }
    }
    return false;
  }

  // エラーメッセージの出力
  function writeErrors() {
    var errorsText = "";
    Object.values(errors).forEach(value => {
      if( value !== "" ) {
        errorsText += `<p>${value}</p>`;
      }
    });
    errorsArea.innerHTML = errorsText;
  }

  // apiとの通信
  async function send( url, inputs ) {
    let response = "";
    const json = JSON.stringify(inputs);
    const headers = {
      'Content-Type':'application/json'
    };
    await fetch( url, { method: 'POST', headers: headers, body: json } )
    .then((res)=> {
      if(!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      response = data;
    })
    .catch((reason) => {
      console.log(reason);
    });
    return response;
  }
});

// NodeListのためのfor文ラッパー関数
var each = function ( NodeList, iteratee ) {
  for( var i = 0; i < NodeList.length; i++ ) {
    iteratee(NodeList[i], i, NodeList);
  }
};