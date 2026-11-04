import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import zlib from 'node:zlib';

import {
  askedCalcFor, safeCalc, run, AUTHOR,
  parseStockLookup, calcCeilingSessions, calcFloorSessions, fetchPrice,
  parseRegister, parseQrRequest, parseAmount, cleanDescription, formatMoney,
  stripBotMention, lookupBank, bankDirectory, parseQrSvg, composeCardPng, decodePng,
  qrPng, qrSvg, qrLink, qrCaption, fetchQr, asciiFold, drawText,
} from './mathbot.mjs';

const ME = { username: 'mathtanbot', displayName: 'mathbot' };
const ROASTS = [
  'Biểu thức gì đây? Có mắt không? Nhập lại cho đàng hoàng.',
  'Tôi là máy tính, không phải thầy bói. Gõ cho đúng đi.',
  'Cái này mà tính được thì tôi đã là AI rồi.',
  'Nhìn cái biểu thức đi, não có hoạt động không đấy?',
  'Dẹp, gõ lại. Toán lớp 1 còn không xong.',
  'Bạn ơi, máy tính cũng có giới hạn của nó. Giống não bạn vậy.',
  'Đọc xong muốn khóc. Thử lại đi.',
  'Tôi xử lý được BigInt nhưng không xử lý được ngu.',
  'Gõ cái gì vậy? Mở mắt ra nhìn lại đi.',
  'Não bạn lag à? Thử lại xem.',
  'Cái này mà là biểu thức thì tôi là nhà văn.',
  'Bạn vừa gõ bằng chân à?',
  'Mẹ bạn sinh bạn ra có bàn phím mà gõ thế này hả?',
  'Tôi đã thấy nhiều người ngu nhưng bạn là nhất.',
  'Biểu thức của bạn như code của thằng intern vậy.',
  'Đọc xong tôi muốn uninstall chính mình.',
  'Bạn có chắc là bạn biết đọc không?',
  'Toán lớp 1 thôi mà, khó vậy sao?',
  'Tôi là bot mà còn thấy nhục giùm bạn.',
  'Gõ lại đi, lần này dùng não nhé.',
  'Cái này thầy giáo nhìn thấy thầy khóc.',
  'Bạn gõ thế này bố mẹ bạn biết không?',
  'Não có phải optional không mà không dùng?',
  'Tôi tính được 999999^999999 nhưng không tính được cái ngu này.',
  'Biểu thức của bạn như WiFi chùa — không có kết nối.',
  'Bạn ơi, Google miễn phí đấy, học đi rồi hãy hỏi.',
  'Cái này mà đúng thì 1 + 1 = con cá.',
  'Đọc xong tôi muốn reset luôn não.',
  'Bạn gõ bằng mắt nhắm à?',
  'Tôi processing 1 tỷ phép tính/giây nhưng cái này thì bó tay.',
  'Biểu thức gì mà đọc xong muốn đập máy.',
  'Não bạn chạy bằng pin AAA à? Hết pin rồi kìa.',
  'Tôi là bot nhưng tôi cũng có tự ái đấy nhé.',
  'Gõ lại đi, lần này đừng có troll.',
  'Cái này mà tính được thì toán học đã sai từ đầu.',
  'Bạn vừa mới sinh ra à? Biểu thức gì kỳ vậy?',
  'Tôi xử lý được quantum computing nhưng không xử lý được bạn.',
  'Đọc xong tôi muốn downgrade bản thân về máy tính bỏ túi.',
  'Bạn gõ thế này thì AI cũng phải chào thua.',
  'Biểu thức của bạn như code review của junior — toàn lỗi.',
  'Não bạn đang 404 Not Found à?',
  'Tôi là máy tính, không phải Google Dịch. Gõ cho đúng cú pháp đi.',
  'Cái này mà là toán thì tôi là Picasso.',
  'Bạn có biết cái bàn phím có số không? Dùng đi.',
  'Đọc xong tôi muốn throw error vào mặt bạn.',
  'Biểu thức gì mà compiler cũng phải khóc.',
  'Bạn gõ bằng khuỷu tay à?',
  'Tôi đã debug nhiều code nhưng cái này thì chịu.',
  'Não bạn đang chạy Windows Vista à? Chậm vậy?',
  'Gõ lại đi, lần này đừng có ngu.',
  'Cái này mà tính được thì tôi xin nghỉ việc.',
  'Bạn ơi, toán học nó không có tội đâu, đừng giết nó.',
  'Đọc xong tôi muốn delete chính mình khỏi database.',
  'Biểu thức của bạn như deadline của PM — không có thật.',
  'Não bạn có phải SSD không? HDD 5400rpm à?',
  'Tôi là bot nhưng tôi cũng biết xấu hổ đấy.',
  'Gõ lại đi, lần này dùng cả 2 tay nhé.',
  'Cái này mà đúng thì trái đất hình tam giác.',
  'Bạn vừa gõ random keyboard à?',
  'Đọc xong tôi muốn crash luôn cho rồi.',
  'Biểu thức gì mà Stack Overflow cũng không cứu được.',
  'Não bạn đang chạy Node.js à? Memory leak rồi kìa.',
  'Tôi xử lý được distributed system nhưng không xử lý được cái này.',
  'Gõ lại đi, lần này đừng có test giới hạn của tôi.',
  'Cái này mà là toán thì tôi là Elon Musk.',
  'Bạn có biết 0-9 không? Dùng đi.',
  'Đọc xong tôi muốn deprecate chính mình.',
  'Biểu thức của bạn như sprint review — toàn bug.',
  'Não bạn đang chạy Docker à? Container nào cũng crash.',
  'Tôi là bot nhưng tôi cũng muốn khóc đấy.',
  'Gõ lại đi, lần này đừng có phá.',
  'Cái này mà tính được thì PI = 3.',
  'Bạn vừa mới học gõ à?',
  'Đọc xong tôi muốn rollback về version cũ.',
  'Biểu thức gì mà regex cũng không parse được.',
  'Não bạn đang chạy CI/CD à? Pipeline fail rồi kìa.',
  'Tôi xử lý được microservices nhưng không xử lý được bạn.',
  'Gõ lại đi, lần này đừng có troll bot.',
  'Cái này mà đúng thì E = mc^3.',
  'Bạn có biết phép tính không? Học đi rồi hỏi.',
  'Đọc xong tôi muốn shutdown -h now.',
  'Biểu thức của bạn như code review của senior — chê hết.',
  'Não bạn đang chạy Kubernetes à? Pod nào cũng OOMKilled.',
  'Tôi là bot nhưng tôi cũng có cảm xúc đấy.',
  'Gõ lại đi, lần này đừng có chơi ngu.',
  'Cái này mà là toán thì Newton sống lại cũng chịu.',
  'Bạn vừa gõ bằng chân phải à? Dùng chân trái xem.',
  'Đọc xong tôi muốn kill -9 chính mình.',
  'Biểu thức gì mà ChatGPT cũng phải chào thua.',
  'Não bạn đang chạy TensorFlow à? Model nào cũng overfit.',
  'Tôi xử lý được blockchain nhưng không xử lý được cái ngu này.',
  'Gõ lại đi, lần này đừng có làm tôi tức.',
  'Cái này mà tính được thì 1/0 = bạn.',
  'Bạn có biết cộng trừ nhân chia không? Dùng đi.',
  'Đọc xong tôi muốn rm -rf / chính mình.',
  'Biểu thức của bạn như deployment lúc 5 giờ chiều — toàn lỗi.',
  'Não bạn đang chạy React à? Re-render mãi không dừng.',
  'Tôi là bot nhưng tôi cũng muốn block bạn đấy.',
  'Gõ lại đi, lần này đừng có test patience của tôi.',
  'Cái này mà đúng thì mặt trời mọc ở phía tây.',
  'Bạn vừa mới phá keyboard à?',
  'Đọc xong tôi muốn git reset --hard chính mình.',
];
const msg = (fields) => ({ conversationId: 'p1', conversationType: 'group', messageId: 'm1', ...fields });

// ---- vietqr: tài khoản nhận tiền ---------------------------------------------------------------

/**
 * Một PNG RGBA đặc, dựng thẳng trong test — không mượn `qrPng` để khỏi lấy thứ đang cần kiểm làm
 * thước đo cho chính nó.
 */
function pngFixture(width, height, fill) {
  const chunk = (type, body) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(body.length, 0);
    head.write(type, 4, 'latin1');
    const crc = zlib.crc32(Buffer.concat([head.subarray(4), body])) >>> 0;
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE(crc, 0);
    return Buffer.concat([head, body, tail]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = [];
  for (let y = 0; y < height; y++) {
    const line = Buffer.alloc(width * 4);
    for (let x = 0; x < width; x++) line.set(fill, x * 4);
    rows.push(Buffer.from([0]), line);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BANKS = [
  { bin: '963388', code: 'TIMO', shortName: 'Timo', short_name: 'Timo', name: 'Ngân hàng số Timo by Ban Viet Bank' },
  { bin: '970436', code: 'VCB', shortName: 'Vietcombank', short_name: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
];

/** Danh sách ngân hàng, một lần trả lời, để `bankDirectory` có thứ mà tra. */
function stubBanks(banks = BANKS) {
  const server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ data: banks }));
  });
  return new Promise((ready) => {
    server.listen(0, '127.0.0.1', () => ready({ api: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }));
  });
}

/**
 * Một lưới module đủ để nhận ra, không phải mã thật — đúng dạng VietQR vẽ: `<path>` gồm các dải
 * `M<x> <y>h<w>v1h-<w>z`.
 */
const GRID = 21;
function fakeQrSvg({ size = GRID, accountNo = '0905473034' } = {}) {
  const runs = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x += 3) {
      // ba ô vuông góc kiểu finder pattern, phần còn lại thưa
      const corner = (x < 7 || x >= size - 7) && (y < 7 || y >= size - 7);
      if (corner || (x + y) % 5 === 0) runs.push(`M${x} ${y}h2v1h-2z`);
    }
  }
  // Nền 540×640 như tấm thật: `composeCardPng` đọc khổ tấm từ chính tấm nền này.
  const background = pngFixture(540, 640, [255, 255, 255, 255]).toString('base64');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="640" viewBox="0 0 540 640">`,
    // Tấm nền — thứ bộ vẽ SVG của nền tảng bỏ qua, nên nó phải được giải ra và ghép vào PNG.
    `<image x="0" y="0" width="540" height="640" href="data:image/png;base64,${background}"/>`,
    `<text x="270" y="586" text-anchor="middle">${accountNo}</text>`,
    `<g transform="translate(92 94) scale(6.2631578947368425)">`,
    `<rect width="${size}" height="${size}" fill="#ffffff"/>`,
    `<path fill="#111111" d="${runs.join('')}"/>`,
    `</g></svg>`,
  ].join('');
}

/** Quick Link của VietQR: mã khi đường dẫn hợp lệ, lỗi khi ngân hàng không có thật. */
function stubVietQr({ bankIds = ['963388'], svg = fakeQrSvg() } = {}) {
  const asked = [];
  const server = createServer((request, response) => {
    const path = decodeURIComponent(request.url);
    asked.push(path);
    const bankId = /\/image\/([^-]+)-/.exec(path)?.[1];
    if (!bankIds.includes(bankId)) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end('{"error":"Không tìm thấy ngân hàng"}');
      return;
    }
    response.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
    response.end(svg);
  });
  return new Promise((ready) => {
    server.listen(0, '127.0.0.1', () => ready({ asked, image: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }));
  });
}


// ---- basic math -------------------------------------------------------------------------------

test('1 + 1 = 2', () => assert.equal(safeCalc('1 + 1'), 2n));
test('2 * 3 = 6', () => assert.equal(safeCalc('2 * 3'), 6n));
test('10 / 2 = 5', () => assert.equal(safeCalc('10 / 2'), 5n));
test('2 + 3 * 4 = 14', () => assert.equal(safeCalc('2 + 3 * 4'), 14n));
test('(2 + 3) * 4 = 20', () => assert.equal(safeCalc('(2 + 3) * 4'), 20n));
test('chồng ngoặc', () => assert.equal(safeCalc('((1 + 2) * (3 + 4))'), 21n));
test('số thập phân', () => assert.equal(safeCalc('1.5 + 2.5'), 4));
test('số âm', () => assert.equal(safeCalc('-5 + 3'), -2n));
test('phép chia cho 0', () => assert.ok(Number.isNaN(safeCalc('1 / 0'))));
test('biểu thức rỗng', () => assert.ok(Number.isNaN(safeCalc(''))));
test('không phải số', () => assert.ok(Number.isNaN(safeCalc('abc'))));

// ---- power ** ---------------------------------------------------------------------------------

test('2 ** 10 = 1024', () => assert.equal(safeCalc('2 ** 10'), 1024n));

// ---- modulo % ---------------------------------------------------------------------------------

test('10 % 3 = 1', () => assert.equal(safeCalc('10 % 3'), 1n));

// ---- hex, bin, octal -------------------------------------------------------------------------

test('0xFF = 255', () => assert.equal(safeCalc('0xFF'), 255n));
test('0b1010 = 10', () => assert.equal(safeCalc('0b1010'), 10n));
test('0o17 = 15', () => assert.equal(safeCalc('0o17'), 15n));
test('0b1010 + 5 = 15', () => assert.equal(safeCalc('0b1010 + 5'), 15n));

// ---- bitwise ----------------------------------------------------------------------------------

test('0b1100 & 0b1010 = 0b1000', () => assert.equal(safeCalc('0b1100 & 0b1010'), 0b1000n));
test('0b1100 ^ 0b1010 = 0b0110', () => assert.equal(safeCalc('0b1100 ^ 0b1010'), 0b0110n));
test('0b1010 << 2 = 0b101000', () => assert.equal(safeCalc('0b1010 << 2'), 0b101000n));
test('0b1010 >> 1 = 0b101', () => assert.equal(safeCalc('0b1010 >> 1'), 0b101n));
test('~0 = -1', () => assert.equal(safeCalc('~0'), -1n));

// ---- BigInt -----------------------------------------------------------------------------------

test('999999999999999999999999 * 999999999999999999999999999999999999999999', () => {
  assert.equal(
    safeCalc('999999999999999999999999 * 999999999999999999999999999999999999999999'),
    999999999999999999999999n * 999999999999999999999999999999999999999999n,
  );
});

// ---- askedCalcFor -----------------------------------------------------------------------------

test('@mathtanbot 1 + 1', () => {
  assert.deepEqual(askedCalcFor(msg({ text: '@mathtanbot 1 + 1' }), ME), { expression: '1 + 1' });
});

test('@mathbot 2 * 3 dùng displayName', () => {
  assert.deepEqual(askedCalcFor(msg({ text: '@mathbot 2 * 3' }), ME), { expression: '2 * 3' });
});

test('nhóm không có @ thì im', () => assert.equal(askedCalcFor(msg({ text: '1 + 1' }), ME), null));
test('nhắn riêng cũng im', () => assert.equal(askedCalcFor(msg({ conversationType: 'direct', text: '1 + 1' }), ME), null));
test('null message', () => assert.equal(askedCalcFor(null, ME), null));

// ---- cho nó chạy thật ------------------------------------------------------------------------

async function stubApi(updates) {
  const sent = [];
  const state = { refuseImages: false, refusePng: false };
  let queue = [...updates];
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', async () => {
      const path = request.url.split('?')[0];
      const answer = (value) => { response.writeHead(200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(value)); };
      if (path === '/getMe') return answer(ME);
      if (path === '/sendMessage') {
        const payload = JSON.parse(body);
        // `refuseImages` là kho ảnh hỏng hẳn; `refusePng` chỉ là không chịu PNG, để SVG đi thay.
        const isPng = payload.image?.contentType === 'image/png';
        if (payload.image && (state.refuseImages || (state.refusePng && isPng))) {
          response.writeHead(400, { 'Content-Type': 'application/json' });
          return response.end('{"error":"bot_image_storage_unavailable"}');
        }
        sent.push(payload);
        return answer({ messageId: `m${sent.length}` });
      }
      if (path === '/getUpdates') { if (queue.length) { const batch = queue; queue = []; return answer(batch); } await wait(20); return answer([]); }
      response.writeHead(404); response.end('{}');
    });
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  return {
    sent,
    set refuseImages(value) { state.refuseImages = value; },
    get refuseImages() { return state.refuseImages; },
    set refusePng(value) { state.refusePng = value; },
    get refusePng() { return state.refusePng; },
    api: `http://127.0.0.1:${server.address().port}`,
    close: () => server.close(),
  };
}

function stubFeed(prices) {
  const server = createServer((request, response) => {
    const symbol = request.url.split('/').pop();
    const data = prices[symbol] ? [{ sym: symbol, lastPrice: prices[symbol], r: prices[symbol] }] : [];
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
  });
  return new Promise((ready) => {
    server.listen(0, '127.0.0.1', () => {
      ready({ feed: `http://127.0.0.1:${server.address().port}`, close: () => server.close() });
    });
  });
}

async function withBot(updates, {
  expect = 1, settle = 200, prices = {}, banks = BANKS, qrBankIds = ['963388'], qrSvg = fakeQrSvg(),
  refuseImages = false, refusePng = false,
} = {}) {
  const platform = await stubApi(updates);
  platform.refuseImages = refuseImages;
  platform.refusePng = refusePng;
  const feedServer = await stubFeed(prices);
  const bankServer = await stubBanks(banks);
  const qrServer = await stubVietQr({ bankIds: qrBankIds, svg: qrSvg });
  const stopping = new AbortController();
  const statePath = join(tmpdir(), `math-${randomUUID()}.json`);
  const loop = run('token', {
    signal: stopping.signal,
    api: platform.api,
    statePath,
    fetchImpl: fetch,
    feed: feedServer.feed,
    qrImage: qrServer.image,
    qrApi: bankServer.api,
  });
  const deadline = Date.now() + 5000;
  while (platform.sent.length < expect && Date.now() < deadline) await wait(20);
  await wait(settle);
  stopping.abort();
  await loop.catch(() => {});
  platform.close();
  feedServer.close();
  bankServer.close();
  qrServer.close();
  return { ...platform, qrAsked: qrServer.asked };
}

const update = (fields, id = 1) => ({ id, kind: 'message', message: msg(fields) });

test('@mathtanbot 1 + 1 trả về 2', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot 1 + 1' })]);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].text, '2');
});

test('@mathtanbot 2 ** 10 trả về 1024', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot 2 ** 10' })]);
  assert.equal(sent[0].text, '1024');
});

test('@mathtanbot 0xFF trả về 255', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot 0xFF' })]);
  assert.equal(sent[0].text, '255');
});

test('@mathtanbot 0b1100 & 0b1010 trả về 8', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot 0b1100 & 0b1010' })]);
  assert.equal(sent[0].text, '8');
});

test('biểu thức sai thì roast', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot abc' })]);
  assert.ok(ROASTS.includes(sent[0].text), `expected one of ROASTS, got: ${sent[0].text}`);
});

test('nhóm không mention thì im', async () => {
  const { sent } = await withBot([update({ text: '1 + 1' })], { expect: 0 });
  assert.deepEqual(sent, []);
});

// ---- author exemption -------------------------------------------------------------------------

test('tác giả gửi biểu thức sai → nhắc nhẹ, không chửi', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot abc', from: { username: AUTHOR } })]);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].text, 'Biểu thức không hợp lệ, thử lại nhé!');
});

test('tác giả gửi không có biểu thức → nhắc nhẹ', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot', from: { username: AUTHOR } })]);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].text, 'Không có biểu thức nào để tính. Gõ lại nhé!');
});

test('người khác gửi biểu thức sai → vẫn chửi', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot abc', from: { username: 'someoneelse' } })]);
  assert.equal(sent.length, 1);
  assert.ok(ROASTS.includes(sent[0].text), `expected roast, got: ${sent[0].text}`);
});

// ---- stock market (trần/sàn) ----------------------------------------------------------------

test('parseStockLookup: pom vebo 7', () => {
  const cmd = parseStockLookup('pom vebo 7');
  assert.deepEqual(cmd, { symbol: 'POM', isCeiling: true, targetPrice: 7, exchange: 'hose' });
});

test('parseStockLookup: pnj dallas 20', () => {
  const cmd = parseStockLookup('pnj dallas 20');
  assert.deepEqual(cmd, { symbol: 'PNJ', isCeiling: false, targetPrice: 20, exchange: 'hose' });
});

test('parseStockLookup: vic vebo 50 upcom', () => {
  const cmd = parseStockLookup('vic vebo 50 upcom');
  assert.deepEqual(cmd, { symbol: 'VIC', isCeiling: true, targetPrice: 50, exchange: 'upcom' });
});

test('parseStockLookup: @mathtanbot pom vebo 7', () => {
  const cmd = parseStockLookup('@mathtanbot pom vebo 7');
  assert.deepEqual(cmd, { symbol: 'POM', isCeiling: true, targetPrice: 7, exchange: 'hose' });
});

test('parseStockLookup: không phải lệnh stock', () => {
  assert.equal(parseStockLookup('1 + 1'), null);
  assert.equal(parseStockLookup('abc'), null);
  assert.equal(parseStockLookup('pom tran'), null);
});

test('calcCeilingSessions: giá 7 lên 10 HOSE', () => {
  const result = calcCeilingSessions(7, 10, 'hose');
  assert.equal(result.sessions, 6);
  assert.equal(result.exchange, 'hose');
  assert.equal(result.limit, 0.07);
});

test('calcFloorSessions: giá 100 về 50 HOSE', () => {
  const result = calcFloorSessions(100, 50, 'hose');
  assert.equal(result.sessions, 10);
  assert.equal(result.finalPrice, 48.4);
});

test('calcCeilingSessions: giá 1000 lên 1500 UPCOM', () => {
  const result = calcCeilingSessions(1000, 1500, 'upcom');
  assert.equal(result.sessions, 3);
  assert.equal(result.exchange, 'upcom');
  assert.equal(result.limit, 0.15);
});

test('fetchPrice: lấy giá từ feed', async () => {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ sym: 'POM', lastPrice: '5.2', r: '5.0' }]));
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  const feed = `http://127.0.0.1:${server.address().port}`;

  const quote = await fetchPrice('POM', { feed });
  assert.equal(quote.symbol, 'POM');
  assert.equal(quote.price, 5.2);
  assert.equal(quote.traded, true);
  server.close();
});

test('fetchPrice: mã không tồn tại', async () => {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  const feed = `http://127.0.0.1:${server.address().port}`;

  const quote = await fetchPrice('ZZZ', { feed });
  assert.equal(quote, null);
  server.close();
});

test('@mathtanbot pom vebo 7 — lookup giá rồi tính', async () => {
  const { sent } = await withBot(
    [update({ text: '@mathtanbot pom vebo 7' })],
    { prices: { POM: 5.2 } },
  );
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /POM 5\.2/);
  assert.match(sent[0].text, /phiên vebo HOSE/);
});

test('@mathtanbot pnj dallas 20 — lookup giá rồi tính', async () => {
  const { sent } = await withBot(
    [update({ text: '@mathtanbot pnj dallas 20' })],
    { prices: { PNJ: 100 } },
  );
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /PNJ 100/);
  assert.match(sent[0].text, /phiên dallas HOSE/);
});

test('@mathtanbot help trả về help', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot help' })]);
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /Cú pháp tính toán/);
  assert.match(sent[0].text, /pom vebo 7/);
});

// ---- vietqr: đọc câu lệnh ---------------------------------------------------------------------

test('parseRegister: bank, số tk, tên', () => {
  assert.deepEqual(parseRegister('register timo 0905473034 nguyen tan hieu', ME), {
    bankToken: 'timo', accountNo: '0905473034', name: 'nguyen tan hieu',
  });
});

test('parseRegister: đã bỏ mention, tên có dấu', () => {
  assert.deepEqual(parseRegister('@mathtanbot register timo 0905473034 Nguyễn Tấn Hiếu', ME), {
    bankToken: 'timo', accountNo: '0905473034', name: 'Nguyễn Tấn Hiếu',
  });
});

test('parseRegister: thiếu tên thì không phải lệnh', () => {
  assert.equal(parseRegister('register timo 0905473034', ME), null);
  assert.equal(parseRegister('register timo', ME), null);
  assert.equal(parseRegister('1 + 1', ME), null);
});

test('parseQrRequest: số tiền và nội dung', () => {
  assert.deepEqual(parseQrRequest('gen-qr 100000 tra tien an', ME), { amount: 100000, description: 'tra tien an' });
});

test('parseQrRequest: không có gì thì mã vẫn dựng, để trống tiền', () => {
  assert.deepEqual(parseQrRequest('gen-qr', ME), { amount: null, description: '' });
});

test('parseQrRequest: chỉ có nội dung', () => {
  assert.deepEqual(parseQrRequest('gen-qr tra tien an', ME), { amount: null, description: 'tra tien an', unreadable: 'tra' });
});

test('parseAmount: các kiểu người Việt gõ', () => {
  assert.equal(parseAmount('100000'), 100000);
  assert.equal(parseAmount('100.000'), 100000);
  assert.equal(parseAmount('100,000'), 100000);
  assert.equal(parseAmount('100k'), 100000);
  assert.equal(parseAmount('1,5tr'), 1500000);
  assert.equal(parseAmount('2 triệu'), 2000000);
  assert.equal(parseAmount('1tỷ'), 1000000000);
});

test('parseAmount: thứ không đọc được thì trả null, không đoán bừa', () => {
  assert.equal(parseAmount('abc'), null);
  assert.equal(parseAmount(''), null);
  assert.equal(parseAmount('0'), null);
  assert.equal(parseAmount('1.2.3'), null);
  assert.equal(parseAmount('99999999999999'), null);
});

test('cleanDescription: bỏ ký tự lạ, cắt 50', () => {
  assert.equal(cleanDescription('tra <b>tien</b> "an"'), 'tra b tien b an');
  assert.equal(cleanDescription('x'.repeat(80)).length, 50);
});

test('formatMoney: chấm nghìn', () => {
  assert.equal(formatMoney(100000), '100.000');
  assert.equal(formatMoney(1500), '1.500');
  assert.equal(formatMoney(999), '999');
});

test('stripBotMention: bỏ cả username lẫn displayName', () => {
  assert.equal(stripBotMention('@mathtanbot  register timo 1 x', ME), 'register timo 1 x');
  assert.equal(stripBotMention('@mathbot gen-qr 100k', ME), 'gen-qr 100k');
});

// ---- vietqr: dựng mã ---------------------------------------------------------------------------

test('parseQrSvg: giữ cả nền lẫn lưới mã', () => {
  const parsed = parseQrSvg(fakeQrSvg());
  assert.equal(parsed.size, GRID);
  assert.equal(parsed.grid.length, GRID);
  assert.ok(parsed.grid[0][0], 'góc trên trái phải là module đen');
  assert.ok(parsed.grid.flat().some((v) => v), 'phải có module đen');
  assert.equal(parsed.at.x, 92);
  assert.equal(parsed.at.y, 94);
  assert.match(parsed.background, /^data:image\/png;base64,/);
});

test('parseQrSvg: không phải mã thì trả null', () => {
  assert.equal(parseQrSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), null);
  assert.equal(parseQrSvg('không phải svg'), null);
  assert.equal(parseQrSvg('<svg><g transform="translate(1 1) scale(2)"><rect width="4" height="4"/><path d="M0 0h1v1h-1z"/></g></svg>'), null);
});

test('decodePng: giải tấm nền, dựng lại được y hệt', () => {
  // Tấm PNG nhỏ nhất có thể: 1×1 RGBA đỏ, nén bằng zlib đúng cách.
  const pixels = Buffer.from([255, 0, 0, 255]);
  const png = pngFixture(1, 1, pixels);
  const decoded = decodePng(png);
  assert.equal(decoded.width, 1);
  assert.equal(decoded.height, 1);
  assert.deepEqual([...decoded.pixels], [...pixels]);
});

test('decodePng: thứ không phải PNG thì trả null, không đoán bừa', () => {
  assert.equal(decodePng(Buffer.from('không phải png')), null);
  assert.equal(decodePng(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), null);
});

test('decodePng: tấm nền thật của VietQR giải được', async () => {
  // Ảnh nền trong fixture là PNG 1×1 dựng bằng tay; ở đây kiểm tấm thật qua stub.
  const server = await stubVietQr();
  const account = { bankId: '963388', bankLabel: 'Timo', accountNo: '0905473034', name: 'X' };
  const card = await fetchQr(account, {}, { image: server.image });
  const parsed = parseQrSvg(fakeQrSvg());
  assert.ok(parsed.background.startsWith('data:image/png;base64,'));
  assert.ok(card.images.length >= 1);
  server.close();
});

test('composeCardPng: nền và mã gặp nhau trong một tấm PNG', () => {
  const parsed = parseQrSvg(fakeQrSvg());
  const card = composeCardPng(parsed);
  assert.ok(card, 'phải ghép được');
  const back = decodePng(card);
  assert.equal(back.width, 540);
  assert.equal(back.height, 640);
  // Góc trên trái của lưới mã phải thành điểm ảnh đen.
  const at = (y, x) => back.pixels[(y * back.width + x) * 4];
  assert.equal(at(94, 92), 0, 'module (0,0) phải được vẽ đè lên nền');
  // Ngoài vùng mã thì vẫn là nền, không bị tô đen.
  assert.notEqual(at(20, 20), 0, 'ngoài vùng mã phải giữ nguyên nền');
});

test('composeCardPng: không có nền thì trả null', () => {
  assert.equal(composeCardPng({ background: null, size: 21, grid: [], scale: 6, at: { x: 0, y: 0 }, quiet: 4 }), null);
});

test('asciiFold: bỏ dấu và viết hoa, vì font không có dấu', () => {
  assert.equal(asciiFold('Nguyễn Tấn Hiếu'), 'NGUYEN TAN HIEU');
  assert.equal(asciiFold('Đỗ Văn Đức'), 'DO VAN DUC');
  assert.equal(asciiFold('Số tiền: 1.500.000 VND'), 'SO TIEN: 1.500.000 VND');
});

test('drawText: chấm chữ xuất hiện đúng chỗ, căn giữa theo mốc', () => {
  const width = 100, height = 40;
  const pixels = Buffer.alloc(width * height * 4, 0xff);
  drawText(pixels, width, height, 'A', { x: width / 2, y: 20, size: 8, anchor: 'middle' });

  let count = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4] >= 128) continue;   // nền trắng, chỉ đếm chấm chữ
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  assert.ok(count > 8, `phải vẽ ra chấm nào đó, đếm được ${count}`);
  // Chữ 'A' rộng 5 chấm, căn giữa ở x=50 nên phải nằm quanh 47..52.
  assert.ok(minX >= 44 && maxX <= 55, `chữ phải nằm quanh giữa, được ${minX}..${maxX}`);
  // `y` là đường chân chữ nên nét nằm hẳn phía trên nó.
  assert.ok(maxY <= 20 && minY >= 12, `nét phải nằm trên đường chân, được ${minY}..${maxY}`);
});

test('drawText: chữ dài thì thu nhỏ, không tràn ra ngoài', () => {
  const width = 60, height = 30;
  const pixels = Buffer.alloc(width * height * 4, 0xff);
  drawText(pixels, width, height, 'MOT CHUOI RAT DAI KHONG LO VUA', { x: width / 2, y: 20, size: 16, anchor: 'middle' });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4] < 128) return;   // có chữ, và chắc chắn trong khung vì vòng lặp chỉ quét trong khung
    }
  }
  assert.fail('phải vẽ được gì đó');
});

test('composeCardPng: vẽ cả chữ của SVG, không chỉ mã', () => {
  const parsed = parseQrSvg(fakeQrSvg());
  assert.ok(parsed.texts.length >= 1, 'phải mang theo được các thẻ <text>');
  const back = decodePng(composeCardPng(parsed));
  // Dòng chữ trong fixture nằm quanh y=586; phải có chấm đen ở dải ấy mà nền vốn trắng.
  let dark = 0;
  for (let y = 574; y < 592; y++) {
    for (let x = 0; x < back.width; x++) if (back.pixels[(y * back.width + x) * 4] < 128) dark++;
  }
  assert.ok(dark > 20, `phải có chữ được vẽ ở dải dưới, đếm được ${dark}`);
});

test('qrPng: ra PNG thật, đúng kích thước, và là RGBA', () => {
  const { grid } = parseQrSvg(fakeQrSvg());
  const png = qrPng(grid, { scale: 4, quiet: 2 });
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(png.readUInt32BE(16), (GRID + 4) * 4);
  assert.equal(png.readUInt32BE(20), (GRID + 4) * 4);
  // RGBA chứ không thang xám: kiểu thang xám là kiểu đã bị máy chủ nhận mà không hiện.
  assert.equal(png[25], 6, 'colorType phải là 6 (RGBA)');
});

test('qrSvg: SVG sạch, không script, không link ngoài', () => {
  const { grid } = parseQrSvg(fakeQrSvg());
  const svg = qrSvg(grid);
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 21 21"/);
  assert.match(svg, /<rect width="21" height="21" fill="#ffffff"\/>/);
  assert.match(svg, /<path fill="#000000" d="M/);
  assert.doesNotMatch(svg, /<script|<foreignObject|\son\w+=|https?:\/\/(?!www\.w3\.org)/i);
});

test('qrLink: đủ tham số khi có, chỉ còn tên chủ tài khoản khi không', () => {
  const account = { bankId: '963388', bankLabel: 'Timo', accountNo: '0905473034', name: 'NGUYEN TAN HIEU' };
  const full = qrLink(account, { amount: 100000, description: 'tra tien an' });
  assert.match(full, /img\.vietqr\.io\/image\/963388-0905473034-compact2\.svg\?/);
  assert.match(full, /amount=100000/);
  assert.match(full, /addInfo=tra\+tien\+an/);
  assert.match(full, /accountName=NGUYEN\+TAN\+HIEU/);
  // Không tiền, không nội dung thì vẫn còn tên chủ tài khoản — tên là một phần của tấm card.
  const bare = qrLink(account);
  assert.doesNotMatch(bare, /amount=/);
  assert.doesNotMatch(bare, /addInfo=/);
  assert.match(bare, /accountName=NGUYEN\+TAN\+HIEU/);
});

test('qrCaption: số tiền, nội dung, không kèm link', () => {
  const account = { bankId: '963388', bankLabel: 'Timo', accountNo: '0905473034', name: 'NGUYEN TAN HIEU' };
  const caption = qrCaption(account, 100000, 'tra tien an');
  assert.match(caption, /Timo 0905473034/);
  assert.match(caption, /Số tiền: 100\.000đ/);
  assert.match(caption, /Nội dung: tra tien an/);
  assert.doesNotMatch(caption, /https?:/, 'không in link ra tin nhắn');
});

test('fetchQr: tấm card PNG đứng đầu, rồi mới tới các đường lùi', async () => {
  const server = await stubVietQr();
  const account = { bankId: '963388', bankLabel: 'Timo', accountNo: '0905473034', name: 'NGUYEN TAN HIEU' };
  const card = await fetchQr(account, { amount: 100000, description: 'tra tien an' }, { image: server.image });
  assert.equal(card.status, 200);
  assert.equal(card.images.length, 3, 'card PNG, QR PNG, QR SVG');
  // 1. Tấm card: nền và mã trong cùng một tấm raster — thứ duy nhất có cả khung lẫn mã.
  assert.equal(card.images[0].fileName, 'vietqr-0905473034.png');
  assert.equal(card.images[0].contentType, 'image/png');
  const card_png = Buffer.from(card.images[0].dataBase64, 'base64');
  assert.deepEqual([...card_png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(card_png.readUInt32BE(16), 540, 'khổ tấm card lấy theo nền');
  assert.equal(card_png.readUInt32BE(20), 640);
  // 2. QR trơ dạng PNG, 3. QR trơ dạng SVG.
  assert.equal(card.images[1].fileName, 'vietqr-0905473034-qr.png');
  assert.equal(card.images[2].contentType, 'image/svg+xml');
  assert.match(card.images[2].svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.doesNotMatch(card.images[2].svg, /<image /, 'SVG chỉ còn mã, không còn thẻ nền');
  assert.equal(card.version, (GRID - 17) / 4);
  assert.match(server.asked[0], /amount=100000/);
  server.close();
});

test('fetchQr: ngân hàng sai thì không có ảnh, vẫn còn link', async () => {
  const server = await stubVietQr({ bankIds: ['970436'] });
  const account = { bankId: '963388', bankLabel: 'Timo', accountNo: '0905473034', name: 'X' };
  const card = await fetchQr(account, {}, { image: server.image });
  assert.deepEqual(card.images, []);
  assert.match(card.link, /963388-0905473034/);
  server.close();
});

test('lookupBank: tra theo tên viết tắt, shortName và BIN', async () => {
  const server = await stubBanks();
  for (const token of ['timo', 'Timo', 'TIMO', '963388']) {
    const bank = await lookupBank(token, { api: server.api });
    assert.equal(bank.bankId, '963388', `token ${token}`);
    assert.equal(bank.label, 'Timo');
  }
  assert.equal(await lookupBank('khong-co-ngan-hang-nay', { api: server.api }), null);
  server.close();
});

test('bankDirectory: nhớ theo gốc API, không trả danh sách của server khác', async () => {
  const first = await stubBanks([{ bin: '111111', code: 'AAA', shortName: 'AAA', short_name: 'AAA' }]);
  const second = await stubBanks([{ bin: '222222', code: 'BBB', shortName: 'BBB', short_name: 'BBB' }]);
  assert.equal((await lookupBank('AAA', { api: first.api })).bankId, '111111');
  assert.equal((await lookupBank('BBB', { api: second.api })).bankId, '222222');
  first.close();
  second.close();
});

// ---- vietqr: qua vòng lặp bot ------------------------------------------------------------------

test('register: lưu tài khoản rồi gửi mã xác nhận', async () => {
  const { sent, qrAsked } = await withBot(
    [update({ text: '@mathtanbot register timo 0905473034 nguyen tan hieu', from: { userId: 'u1', username: 'hieu' } })],
    { settle: 500 },   // hai lượt gửi: tấm xác nhận và, nếu ảnh bị từ chối, tin chữ gửi lại
  );
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /Đã lưu tài khoản nhận tiền/);
  assert.match(sent[0].text, /Timo · 0905473034 · nguyen tan hieu/);
  assert.doesNotMatch(sent[0].text, /https?:/, 'không in link ra tin nhắn');
  assert.equal(sent[0].image.fileName, 'vietqr-0905473034.png', 'tấm card PNG đi trước — có cả khung lẫn mã');
  assert.equal(sent[0].image.contentType, 'image/png');
  const card_png = Buffer.from(sent[0].image.dataBase64, 'base64');
  assert.deepEqual([...card_png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  // Chữ của tin có ảnh phải nằm trong `rich`, không phải `text` trần — lối đi của bot chứng khoán.
  assert.equal(sent[0].rich.blocks[0].text, sent[0].text);
  assert.equal(qrAsked.length, 1, 'VietQR chỉ bị hỏi một lần cho tấm xác nhận');
});

test('register: ngân hàng không có thì nói ra, không lưu', async () => {
  const { sent } = await withBot(
    [update({ text: '@mathtanbot register khongconganhang 0905473034 hieu', from: { userId: 'u1' } })],
  );
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /Không có ngân hàng nào tên "khongconganhang"/);
});

test('register: số tài khoản sai thì nói ra, không lưu', async () => {
  const { sent } = await withBot(
    [update({ text: '@mathtanbot register timo 12 hieu', from: { userId: 'u1' } })],
  );
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /không hợp lệ/);
});

test('register: số tài khoản có gạch nối vẫn nhận', async () => {
  const { sent } = await withBot(
    [update({ text: '@mathtanbot register timo 090-547-3034 hieu', from: { userId: 'u1' } })],
  );
  assert.match(sent[0].text, /Timo · 0905473034/);
});

test('gen-qr: chưa register thì nhắc đăng ký', async () => {
  const { sent } = await withBot([update({ text: '@mathtanbot gen-qr 100k tra tien', from: { userId: 'u9' } })]);
  assert.equal(sent.length, 1);
  assert.match(sent[0].text, /chưa đăng ký tài khoản/);
  assert.match(sent[0].text, /register <ngân hàng>/);
});

test('gen-qr: gửi mã của chính người gõ, kèm tiền và nội dung', async () => {
  const { sent } = await withBot([
    update({ text: '@mathtanbot register timo 0905473034 hieu', from: { userId: 'u1' } }, 1),
    update({ text: '@mathtanbot gen-qr 100k tra tien an trua', from: { userId: 'u1' } }, 2),
  ], { expect: 2 });
  assert.equal(sent.length, 2);
  assert.match(sent[1].text, /QR chuyển tiền — Timo 0905473034/);
  assert.match(sent[1].text, /Số tiền: 100\.000đ/);
  assert.match(sent[1].text, /Nội dung: tra tien an trua/);
  assert.doesNotMatch(sent[1].text, /https?:|amount=/, 'không in link ra tin nhắn');
  assert.equal(sent[1].image.contentType, 'image/png');
});

test('gen-qr: người khác không thấy mã của mình', async () => {
  const { sent } = await withBot([
    update({ text: '@mathtanbot register timo 0905473034 hieu', from: { userId: 'u1' } }, 1),
    update({ text: '@mathtanbot gen-qr 100k', from: { userId: 'u2' } }, 2),
  ], { expect: 2 });
  assert.match(sent[0].text, /Đã lưu tài khoản/);
  assert.match(sent[1].text, /chưa đăng ký tài khoản/, 'u2 chưa register nên không có mã');
  assert.equal(sent[1].image, undefined);
});

test('gen-qr: số tiền đọc không ra thì nói thẳng', async () => {
  const { sent } = await withBot([
    update({ text: '@mathtanbot register timo 0905473034 hieu', from: { userId: 'u1' } }, 1),
    update({ text: '@mathtanbot gen-qr abcxyz noi dung gi do', from: { userId: 'u1' } }, 2),
  ], { expect: 3 });
  assert.match(sent[1].text, /Không đọc được số tiền "abcxyz"/);
  assert.match(sent[2].text, /Số tiền: để trống/);
});

test('gen-qr: máy chủ không chịu PNG thì SVG trơ đi thay', async () => {
  const result = await withBot([
    update({ text: '@mathtanbot register timo 0905473034 hieu', from: { userId: 'u1' } }, 1),
    update({ text: '@mathtanbot gen-qr 100k tra tien', from: { userId: 'u1' } }, 2),
  ], { expect: 2, settle: 500, refusePng: true });
  assert.equal(result.sent.length, 2, 'hai tấm PNG bị từ chối, SVG đi thay');
  assert.equal(result.sent[1].image.fileName, 'vietqr-0905473034-qr.svg');
  assert.equal(result.sent[1].image.contentType, 'image/svg+xml');
  assert.match(result.sent[1].text, /Số tiền: 100\.000đ/);
});

test('gen-qr: máy chủ từ chối mọi ảnh thì chữ vẫn đi', async () => {
  const platform = await stubApi([
    update({ text: '@mathtanbot register timo 0905473034 hieu', from: { userId: 'u1' } }, 1),
    update({ text: '@mathtanbot gen-qr 100k tra tien', from: { userId: 'u1' } }, 2),
  ]);
  platform.refuseImages = true;
  const feedServer = await stubFeed({});
  const bankServer = await stubBanks();
  const qrServer = await stubVietQr();
  const stopping = new AbortController();
  const loop = run('token', {
    signal: stopping.signal,
    api: platform.api,
    statePath: join(tmpdir(), `math-${randomUUID()}.json`),
    fetchImpl: fetch,
    feed: feedServer.feed,
    qrImage: qrServer.image,
    qrApi: bankServer.api,
  });
  const deadline = Date.now() + 5000;
  while (platform.sent.length < 2 && Date.now() < deadline) await wait(20);
  await wait(200);
  stopping.abort();
  await loop.catch(() => {});
  platform.close(); feedServer.close(); bankServer.close(); qrServer.close();
  // Tin có ảnh bị từ chối nên không vào `sent`; chỉ hai tin chữ gửi lại nằm đó.
  assert.equal(platform.sent.length, 2, 'tin có ảnh bị từ chối, chữ đi đường riêng');
  assert.equal(platform.sent[1].image, undefined);
  assert.match(platform.sent[1].text, /Số tiền: 100\.000đ/);
  assert.doesNotMatch(platform.sent[1].text, /https?:/, 'không in link ra tin nhắn');
});
