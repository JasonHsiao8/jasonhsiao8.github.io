# 個人網站與本機履歷編輯器

公開網站：https://jasonhsiao8.github.io/

## 開啟
在 Windows 安裝 Node.js 22 以上及 Git for Windows（含 Git Credential Manager）。本機已有這兩項工具。
雙擊「啟動編輯器.cmd」，若瀏覽器開啟時服務尚未就緒，重新整理即可。使用期間請保持啟動視窗開啟；關閉視窗即停止編輯器。
其他系統可在此資料夾執行 `node editor/server.mjs`，瀏覽 http://127.0.0.1:5190/。

## 使用
1. 選中文或 English，填寫基本資料、學歷、經歷、專案、論文等。
2. 按「儲存草稿與預覽」，檢查下方正式版型。
3. 按「發布至 GitHub」。首次可能由 Git Credential Manager 開啟 GitHub 登入，請用 JasonHsiao8 帳號完成。
4. 上傳完成後，點「部署進度」等 GitHub Actions 成功，公開網站才更新。

編輯器只在 127.0.0.1 開放，訪客無法存取。沒有 Decap Turbo 或 ChatGPT 的執行依賴。
資料保存在 content/en.json 與 content/zh.json；儲存前自動備份到 .local/。
「發布」會產生網站、提交網站原始碼與資料，GitHub Actions 再產生並發布正式 HTML。
圖片目前可填 https 網址。中英文分開填寫，不會自動翻譯。

## 備份與換電腦
按「匯出資料備份」保存中英文資料。也可備份整個資料夾（不要分享 .local/）。
換電腦後下載自己的 GitHub 儲存庫，安裝 Node.js 和 Git，再開啟編輯器。
不同電腦輪流編輯時，開始前按「載入 GitHub 最新資料」。如果發布時發現遠端有更新，工具會停止，不會強制覆蓋。
本工具不是手機線上後台，手機不能直接連入這個僅限本機的服務。

## 檢查
`node --test scripts/test.mjs editor/test.mjs`
`node scripts/build.mjs`

網站版型維持 Home / Projects / Publications / Experience，提供中英切換。
