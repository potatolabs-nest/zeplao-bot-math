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
