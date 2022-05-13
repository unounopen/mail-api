const Mail = new UnoMail( {
  apiUrl: 'ドメイン/api/contact/send.php',
  thxUrl: 'ドメイン/contact/thanks.html',
  requires: [ 'content', 'name', 'email', 'type1', 'check1' ],
  formId: 'formArea',
  submitId: 'sendBtn',
  cautionId: 'errorsArea',
  faildText: '送信に失敗しました。恐れ入りますが、時間をおいて再度お試しいただくか、お電話でお問い合わせください。',
  disableClass: 'disable'
} );

// バリデーションチェックとエラーメッセージ（テキストベース）第1引数はinputやtextareaのidと揃えること。第2引数はエラーとして出力される文字列（getから始まる関数にはいらない）
// チェックが必要ないならgetText、必須チェックだけならrequireText、メアド・郵便番号・電話番号はcheckEmail・checkPostalcode・checkTel
Mail.requireText( 'content', 'お問い合わせ内容を入力してください' );
Mail.requireText( 'name', 'お名前を入力してください' );
Mail.getText( 'company' );
Mail.checkEmail( 'email', 'メールアドレスを正しい形式で入力してください');
Mail.checkPostalcode( 'postalcode', '郵便番号は7桁以上の数字で入力してください');
Mail.getText( 'address' );
Mail.checkTel( 'tel', '電話番号は6桁以上の数字で入力してください');

// バリデーションチェックとエラーメッセージ(ラジオボタン) 第1引数はラジオボタンのnameと揃えること。第2引数はエラーとして出力される文字列（getから始まる関数にはいらない）
Mail.getRadio( 'type' );

// バリデーションチェックとエラーメッセージ(チェックボックス) 第1引数はチェックボックスのnameと揃えること。第2引数はエラーとして出力される文字列（getから始まる関数にはいらない）
// 取得だけでいいならgetCheckbox、必須チェックが要るならrequireCheckbox
Mail.getCheckbox( 'check' );
Mail.requireCheckbox( 'check1', "チェックボックスを選択してください" );


// エラーと送信ボタンまわりの処理。必ずいれてね
Mail.switchSubmitBtn();
Mail.sendData();