# mathbot

A math calculator bot for group chat. Mention `@mathnewbot` with an expression and it replies with the result.

```
@mathnewbot 1 + 1
→ 2

@mathnewbot 2 * (3 + 4)
→ 14
```

## Usage

| Gõ | Được gì |
| --- | --- |
| `@mathnewbot 1 + 1` | Tính toán và trả kết quả |
| `@mathnewbot 2 * (3 + 4)` | Hỗ trợ ngoặc, `+`, `-`, `*`, `/` |
| `@mathnewbot 1.5 + 2.5` | Số thập phân |

Bot chỉ phản hồi khi được **mention** (`@mathnewbot`). Tin nhắn không mention sẽ bị bỏ qua.

## Chạy

Tạo bot ở [kuku.vn/bot](https://kuku.vn/bot), lấy token, rồi:

```bash
ZEPLAO_BOT_TOKEN=<token> npm start
```

Lên đúng thì nó in `@mathnewbot đang trực`. Bất cứ gì khác là token sai.

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

Trạng thái lưu **offset** — đã xử lý tới cập nhật nào. Khởi động lại không phát lại những câu hỏi cũ vào phòng.

## Test

```bash
npm test
```

## Bố cục

| File | Là gì |
| --- | --- |
| `mathbot.mjs` | Toán học, vòng lặp, đọc mention, gửi tin |
| `mathbot.test.mjs` | Bộ test |
| `Dockerfile` | Đóng gói, có volume cho state |
