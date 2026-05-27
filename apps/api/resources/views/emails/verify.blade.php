<x-mail::message>
# アカウント登録のご確認

ichigo-step へのご登録ありがとうございます。

下記のボタンをクリックして、アカウント登録を続けてください。

<x-mail::button :url="$verifyUrl">
アカウント登録を続ける
</x-mail::button>

このリンクは **24 時間** で無効になります。

もしご自身でリクエストされていない場合は、このメールを無視してください。

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
