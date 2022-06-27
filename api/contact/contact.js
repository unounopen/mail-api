const Mail = new UnoMail( {
  apiUrl: '/api/contact/send.php',
  thxUrl: '/contact/thanks.html',
  formId: 'formArea',
  submitId: 'sendBtn',
  cautionId: 'errorsArea',
  faildText: '送信に失敗しました。恐れ入りますが、時間をおいて再度お試しいただくか、お電話でお問い合わせください。',
} );

// バリデーションチェックとエラーメッセージ（テキストベース）
// 第一引数はid、第二引数はメールに表示する項目名、第三引数（任意）はエラーメッセージ
// 第四引数（任意）は条件付きバリデーションチェックのためのフラグ（電話番号：tel、メールアドレス：email、郵便番号：postalcode）
Mail.getText( 'content', 'お問い合わせ内容', 'お問い合わせ内容を入力してください' );
Mail.getText( 'name', 'お名前', 'お名前を入力してください' );
Mail.getText( 'company', '法人名' );
Mail.getText( 'email', 'メールアドレス', 'メールアドレスを正しい形式で入力してください', 'email' );
Mail.getText( 'postalcode', '郵便番号', '郵便番号は7桁以上の数字で入力してください', 'postalcode' );
Mail.getText( 'address', 'ご住所' );
Mail.getText( 'tel', '電話番号', '電話番号は6桁以上の数字で入力してください', 'tel' );

// バリデーションチェックとエラーメッセージ(ラジオボタン)
// 第1引数はラジオボタンのname。第2引数はメールに表示する項目名
Mail.getRadio( 'type', 'タイプ' );

// バリデーションチェックとエラーメッセージ(チェックボックス)
// 第1引数はチェックボックスのname。第二引数はメールに表示する項目名、第三引数（任意）はエラーメッセージ
Mail.getCheckbox( 'check1', 'チェック1' );
Mail.getCheckbox( 'check2', 'チェック2', "チェックボックスを選択してください" );
