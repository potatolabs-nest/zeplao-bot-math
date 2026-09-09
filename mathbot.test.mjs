import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { setTimeout as wait } from 'node:timers/promises';

import { askedCalcFor, safeCalc, run, SORRY } from './mathbot.mjs';

// ---- safeCalc --------------------------------------------------------------------------------

test('1 + 1 = 2', () => assert.equal(safeCalc('1 + 1'), 2));
test('2 * 3 = 6', () => assert.equal(safeCalc('2 * 3'), 6));
test('10 / 2 = 5', () => assert.equal(safeCalc('10 / 2'), 5));
test('2 + 3 * 4 = 14', () => assert.equal(safeCalc('2 + 3 * 4'), 14));
test('(2 + 3) * 4 = 20', () => assert.equal(safeCalc('(2 + 3) * 4'), 20));
test('chồng ngoặc', () => assert.equal(safeCalc('((1 + 2) * (3 + 4))'), 21));
test('số thập phân', () => assert.equal(safeCalc('1.5 + 2.5'), 4));
test('số âm', () => assert.equal(safeCalc('-5 + 3'), -2));
test('phép chia cho 0', () => assert.ok(Number.isNaN(safeCalc('1 / 0'))));
test('biểu thức rỗng', () => assert.ok(Number.isNaN(safeCalc(''))));
test('không phải số', () => assert.ok(Number.isNaN(safeCalc('abc'))));

// ---- askedCalcFor -----------------------------------------------------------------------------

test('!calc 1 + 1 là lệnh tính toán', () => {
  const result = askedCalcFor({ text: '!calc 1 + 1' });
  assert.deepEqual(result, { expression: '1 + 1' });
});

test('!tinh 2 * 3 là lệnh tính toán', () => {
  const result = askedCalcFor({ text: '!tinh 2 * 3' });
  assert.deepEqual(result, { expression: '2 * 3' });
});

test('!calc không có biểu thức', () => {
  const result = askedCalcFor({ text: '!calc' });
  assert.deepEqual(result, { expression: '' });
});

test('không có dấu gọi thì không phải lệnh', () => assert.equal(askedCalcFor({ text: 'calc 1+1' }), null));
test('null message', () => assert.equal(askedCalcFor(null), null));

// ---- cho nó chạy thật ------------------------------------------------------------------------

async function stubApi(updates) {
  const sent = [];
  let queue = [...updates];

  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', async () => {
      const path = request.url.split('?')[0];
      const answer = (value) => {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(value));
      };

      if (path === '/getMe') return answer({ username: 'mathbot', displayName: 'Math Bot' });
      if (path === '/setCommands') return answer({ ok: true });
      if (path === '/sendMessage') {
        sent.push(JSON.parse(body));
        return answer({ messageId: `m${sent.length}` });
      }
      if (path === '/getUpdates') {
        if (queue.length) {
          const batch = queue;
          queue = [];
          return answer(batch);
        }
        await wait(20);
        return answer([]);
      }
      response.writeHead(404);
      response.end('{}');
    });
  });

  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  return { sent, api: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

async function withBot(updates, { expect = 1, settle = 200 } = {}) {
  const platform = await stubApi(updates);
  const stopping = new AbortController();

  const loop = run('token', {
    signal: stopping.signal,
    api: platform.api,
  });

  const deadline = Date.now() + 5000;
  while (platform.sent.length < expect && Date.now() < deadline) await wait(20);
  await wait(settle);

  stopping.abort();
  await loop.catch(() => {});
  platform.close();
  return platform;
}

const update = (fields, id = 1) => ({ id, kind: 'message', message: { conversationId: 'p1', conversationType: 'group', messageId: 'm1', ...fields } });

test('!calc 1 + 1 trả về 2', async () => {
  const { sent } = await withBot([update({ text: '!calc 1 + 1' })]);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].text, '2');
});

test('!calc 2 * (3 + 4) trả về 14', async () => {
  const { sent } = await withBot([update({ text: '!calc 2 * (3 + 4)' })]);
  assert.equal(sent[0].text, '14');
});

test('!tinh 100 / 3 có thập phân', async () => {
  const { sent } = await withBot([update({ text: '!tinh 100 / 3' })]);
  assert.match(sent[0].text, /^33\.3333333333$/);
});

test('biểu thức sai thì báo lỗi', async () => {
  const { sent } = await withBot([update({ text: '!calc abc' })]);
  assert.equal(sent[0].text, SORRY.calc);
});

test('!calc không có biểu thức thì báo lỗi', async () => {
  const { sent } = await withBot([update({ text: '!calc' })]);
  assert.equal(sent[0].text, SORRY.calc);
});

test('tin nhắn không có dấu gọi thì bot im', async () => {
  const { sent } = await withBot([update({ text: '1 + 1' })], { expect: 0 });
  assert.deepEqual(sent, []);
});
