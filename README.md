# mathbot

A math calculator bot for group chat, with bank QR codes. Mention `@mathtanbot` with an expression and it replies with the result.

```
@mathtanbot 1 + 1
→ 2

@mathtanbot 2 * (3 + 4)
→ 14
```

## Usage

| Gõ | Được gì |
| --- | --- |
| `@mathtanbot 1 + 1` | Tính toán và trả kết quả |
| `@mathtanbot 2 * (3 + 4)` | Hỗ trợ ngoặc, `+`, `-`, `*`, `/` |
| `@mathtanbot 1.5 + 2.5` | Số thập phân |
| `@mathtanbot register timo 0905473034 nguyen tan hieu` | Lưu tài khoản nhận tiền của bạn |
| `@mathtanbot gen-qr 100k tra tien an trua` | Mã QR chuyển tiền của chính bạn |

Bot chỉ phản hồi khi được **mention** (`@mathtanbot`). Tin nhắn không mention sẽ bị bỏ qua.

## QR chuyển tiền

`register` lưu **một** tài khoản cho mỗi người, khoá theo `userId` — đăng ký lại là ghi đè. Câu trả
lời là chính mã QR của tài khoản vừa lưu, kèm đường link đã hỏi VietQR: nhìn tấm card là biết số tài
khoản có đúng không, và link thì nói ra sai ở đâu khi mã không dựng nổi.

```
@mathtanbot register timo 0905473034 nguyen tan hieu
→ Đã lưu tài khoản nhận tiền:
  Timo · 0905473034 · nguyen tan hieu
  https://img.vietqr.io/image/963388-0905473034-compact2.svg?accountName=nguyen+tan+hieu
  [mã QR]
```

`gen-qr` lấy tài khoản của **người đang gõ**, không phải của người được nhắc:

```
@mathtanbot gen-qr 100k tra tien an trua
→ QR chuyển tiền — Timo 0905473034
  nguyen tan hieu
  Số tiền: 100.000đ
  Nội dung: tra tien an trua
  https://img.vietqr.io/image/963388-0905473034-compact2.svg?amount=100000&addInfo=tra+tien+an+trua...
  [mã QR]
```

Số tiền hiểu được: `100000`, `100.000`, `100k`, `1,5tr`, `2 triệu`. Gõ số tiền mà bot không đọc ra
thì nó nói thẳng và dựng mã để trống tiền, chứ không lặng lẽ bỏ đi. Bỏ số tiền cũng được — mã vẫn
dựng, người chuyển tự nhập.

Ảnh do người dùng gửi **không tới được bot** (`messageType` chỉ có `text` và `sticker`), nên không
có cách nào đọc mã QR ai đó gửi lên. Đổi lại, `register` trả về ngay mã của tài khoản vừa lưu.

Mã QR lấy từ [Quick Link của VietQR](https://www.vietqr.io/qr-dong) — một URL, không cần khoá.
VietQR trả về SVG gồm ba phần, và **không phần nào gửi thẳng đi được**:

- một `<image>` phủ kín khung — nền: khung, logo ngân hàng, các nhãn "Chủ tài khoản:", "Nội dung
  chuyển khoản:"
- vài thẻ `<text>` — tên chủ tài khoản, số tài khoản, số tiền
- một `<path>` vẽ từng module của mã, nằm trong `<g transform>`

Bộ vẽ SVG của nền tảng bỏ qua cả `<image>` lẫn `<text>`. Gửi SVG thì người nhận thấy mỗi mã trơ trên
nền trắng — mất khung, mất logo, mất tên, mất số tài khoản, mất số tiền. Ảnh raster thì nó vẽ được.

Nên `composeCardPng` dựng lại **một tấm PNG duy nhất**: `decodePng` giải tấm nền ra, lưới mã được vẽ
đè lên (`paintRect`), rồi các dòng `<text>` được vẽ bằng font bitmap 5×7 (`drawText`, `asciiFold` bỏ
dấu vì font không có dấu). Đó là đường duy nhất có đủ mọi thứ, nên nó đi trước:

1. `composeCardPng` — nền + mã + chữ, một tấm PNG
2. `qrPng` — chỉ mã, dạng PNG
3. `qrSvg` — chỉ mã, dạng SVG

Cuối cùng mới tới chữ không ảnh. Chữ của tin có ảnh đi kèm dưới dạng `rich`, không phải `text` trần.
Tin nhắn **không in link** — link chỉ hữu ích khi ảnh không hiện, mà lúc ấy một URL dài cũng không
giúp gì; nó vẫn được ghi vào log máy chủ để tra khi cần.

## Chạy

Tạo bot ở [kuku.vn/bot](https://kuku.vn/bot), lấy token, rồi:

```bash
ZEPLAO_BOT_TOKEN=<token> npm start
```

Lên đúng thì nó in `@mathtanbot đang trực`. Bất cứ gì khác là token sai.

### Bằng image

```bash
docker run -d --name mathbot --restart unless-stopped \
  -e ZEPLAO_BOT_TOKEN=<token> \
  -v mathbot-data:/app/data \
  ghcr.io/hule-prime/zeplao-bot-math
```

| Biến môi trường | Để làm gì |
| --- | --- |
| `ZEPLAO_BOT_TOKEN` | Bắt buộc. Token của bot |
| `ZEPLAO_BOT_API` | Nền tảng bot. Mặc định `https://api-bot.kuku.vn` |
| `MATHBOT_STATE` | Chỗ ghi trạng thái. Mặc định `/app/data/state.json` |
| `VIETQR_IMAGE` | Chỗ dựng mã QR. Mặc định `https://img.vietqr.io` |
| `VIETQR_API` | Danh sách ngân hàng. Mặc định `https://api.vietqr.io` |
| `VIETQR_TEMPLATE` | Kiểu tấm card, chỉ để dựng link. Mặc định `compact2` |

Trạng thái lưu **offset** — đã xử lý tới cập nhật nào — và **accounts** — tài khoản nhận tiền của
từng người. Khởi động lại không phát lại những câu hỏi cũ vào phòng, và không ai phải đăng ký lại.

## Test

```bash
npm test
```

## Bố cục

| File | Là gì |
| --- | --- |
| `mathbot.mjs` | Toán học, mã QR, vòng lặp, đọc mention, gửi tin |
| `mathbot.test.mjs` | Bộ test |
| `Dockerfile` | Đóng gói, có volume cho state |
