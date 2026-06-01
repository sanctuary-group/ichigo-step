<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>友だち追加</title>
    <style>
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
            background: #f6f7f9;
            color: #1f2937;
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .card {
            text-align: center;
            background: #fff;
            border-radius: 16px;
            padding: 32px 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,.08);
            max-width: 360px;
            width: 100%;
        }
        .spinner {
            width: 36px; height: 36px;
            border: 3px solid #e5e7eb;
            border-top-color: #06c755;
            border-radius: 50%;
            margin: 0 auto 16px;
            animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        h1 { font-size: 16px; margin: 0 0 8px; }
        p { font-size: 13px; color: #6b7280; margin: 0 0 20px; }
        .btn {
            display: inline-block;
            background: #06c755;
            color: #fff;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            padding: 12px 28px;
            border-radius: 999px;
        }
        #fallback { display: none; }
    </style>
</head>
<body>
    <div class="card">
        <div id="loading">
            <div class="spinner"></div>
            <h1>準備しています…</h1>
            <p>まもなく友だち追加画面に移動します。</p>
        </div>
        <div id="fallback">
            <h1>友だち追加</h1>
            <p>下のボタンから友だち追加してください。</p>
            <a class="btn" href="{{ $friendAddUrl }}">友だち追加する</a>
        </div>
    </div>

    <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
    <script>
        var LIFF_ID = @json($liffId);
        var ENTER_URL = @json($enterUrl);
        var FRIEND_ADD_URL = @json($friendAddUrl);

        function go(url) {
            window.location.href = url;
        }

        function showFallback() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('fallback').style.display = 'block';
        }

        async function run() {
            try {
                await liff.init({ liffId: LIFF_ID });

                if (!liff.isLoggedIn()) {
                    liff.login({ redirectUri: window.location.href });
                    return;
                }

                var accessToken = liff.getAccessToken();
                var addUrl = FRIEND_ADD_URL;

                try {
                    var res = await fetch(ENTER_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ access_token: accessToken }),
                    });
                    if (res.ok) {
                        var data = await res.json();
                        if (data.friend_add_url) addUrl = data.friend_add_url;
                    }
                } catch (e) { /* 紐付け失敗でも友だち追加は継続 */ }

                go(addUrl);
            } catch (e) {
                // LIFF 初期化失敗時は手動ボタンを出す
                showFallback();
            }
        }

        run();
        // 念のため数秒で進まなければフォールバック表示
        setTimeout(showFallback, 6000);
    </script>
</body>
</html>
