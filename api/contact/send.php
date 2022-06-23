<?php

require dirname(__FILE__) . '/libs/UnoMail.php';

$mail = new UnoMail([
  'domain' => '',
  'mail_to_address' => '',
  'mail_to_name' => '差出人の名前（サイト名など）',
  'mail_return_path' => '',
  'mail_subject_text' => 'サイトからのお問い合わせ',
  'mail_intro_text' => '以下の内容でお問い合わせがありました',
  'mail_from_address_id' => 'email',
  'mail_from_name_id' => 'name'
]);

?>