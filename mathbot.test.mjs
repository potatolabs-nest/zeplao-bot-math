import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';

import { askedCalcFor, safeCalc, run } from './mathbot.mjs';

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
  let queue = [...updates];
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', async () => {
      const path = request.url.split('?')[0];
      const answer = (value) => { response.writeHead(200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(value)); };
      if (path === '/getMe') return answer(ME);
      if (path === '/sendMessage') { sent.push(JSON.parse(body)); return answer({ messageId: `m${sent.length}` }); }
      if (path === '/getUpdates') { if (queue.length) { const batch = queue; queue = []; return answer(batch); } await wait(20); return answer([]); }
      response.writeHead(404); response.end('{}');
    });
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  return { sent, api: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

async function withBot(updates, { expect = 1, settle = 200 } = {}) {
  const platform = await stubApi(updates);
  const stopping = new AbortController();
  const statePath = join(tmpdir(), `math-${randomUUID()}.json`);
  const loop = run('token', { signal: stopping.signal, api: platform.api, statePath });
  const deadline = Date.now() + 5000;
  while (platform.sent.length < expect && Date.now() < deadline) await wait(20);
  await wait(settle);
  stopping.abort();
  await loop.catch(() => {});
  platform.close();
  return platform;
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
