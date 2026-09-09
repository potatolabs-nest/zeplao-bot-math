import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';

export const API = process.env.ZEPLAO_BOT_API ?? 'https://api-bot.kuku.vn';
export const STATE = process.env.MATHBOT_STATE
  ?? fileURLToPath(new URL('./data/state.json', import.meta.url));

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

function fmt(v) {
  if (typeof v === 'bigint') return String(v);
  if (Number.isInteger(v)) return String(v);
  return String(Math.round((v + Number.EPSILON) * 1e10) / 1e10);
}

// ---- BigInt helpers ---------------------------------------------------------------------------

function num(v) { return typeof v === 'number' ? v : Number(v); }
function isObj(v) { return v !== null && typeof v === 'object'; }

// ---- tokenize ---------------------------------------------------------------------------------

function tokenize(input) {
  const tokens = [];
  const re = /(0[bB][01]+|0[xX][\da-fA-F]+|0[oO][0-7]+|\d+(?:\.\d+)?)|(\*\*|<<|>>|[+\-*/%&|^~()])|\s+/g;
  let m;
  for (;;) {
    m = re.exec(String(input ?? ''));
    if (!m) break;
    if (m[1]) {
      const raw = m[1];
      if (/^0[bBxXoO]/.test(raw)) tokens.push({ t: 'n', v: BigInt(raw) });
      else if (raw.includes('.')) tokens.push({ t: 'n', v: Number(raw) });
      else tokens.push({ t: 'n', v: BigInt(raw) });
    } else if (m[2]) tokens.push({ t: 'o', v: m[2] });
  }
  return tokens;
}

// ---- parser (recursive descent) ---------------------------------------------------------------
//
// precedence (low → high):
//   ^  (bitwise XOR)
//   |  (bitwise OR, implicit — not tokenized here)
//   &  (bitwise AND)
//   << >>  (shift)
//   + -
//   * / %
//   ** (power)
//   ~ - + (unary)

function parse(input) {
  const tokens = tokenize(input);
  let pos = 0;
  const pk = () => tokens[pos];
  const nx = () => tokens[pos++];
  const op = (v) => pk()?.t === 'o' && pk().v === v;

  function consume(v) { if (op(v)) { nx(); return true; } return false; }

  function expr() {
    let a = shift();
    while (true) {
      if (consume('+')) { const b = shift(); a = add(a, b); }
      else if (consume('-')) { const b = shift(); a = sub(a, b); }
      else break;
    }
    return a;
  }

  function shift() {
    let a = band();
    while (true) {
      if (consume('<<')) { const b = band(); a = doShl(a, b); }
      else if (consume('>>')) { const b = band(); a = doShr(a, b); }
      else break;
    }
    return a;
  }

  function band() {
    let a = bxor();
    while (true) {
      if (consume('&')) { const b = bxor(); a = doAnd(a, b); }
      else break;
    }
    return a;
  }

  function bxor() {
    let a = mul();
    while (true) {
      if (consume('^')) { const b = mul(); a = doXor(a, b); }
      else break;
    }
    return a;
  }

  function mul() {
    let a = power();
    while (true) {
      if (consume('*')) { const b = power(); a = doMul(a, b); }
      else if (consume('/')) { const b = power(); a = doDiv(a, b); }
      else if (consume('%')) { const b = power(); a = doMod(a, b); }
      else break;
    }
    return a;
  }

  function power() {
    let a = unary();
    if (consume('**')) { const b = power(); a = doPow(a, b); }
    return a;
  }

  function unary() {
    if (consume('~')) return doNot(atom());
    if (consume('-')) return doNeg(atom());
    if (consume('+')) return atom();
    return atom();
  }

  function atom() {
    if (consume('(')) { const v = expr(); consume(')'); return v; }
    const t = pk();
    if (t?.t === 'n') { nx(); return t.v; }
    nx();
    return NaN;
  }

  return expr();
}

// ---- arithmetic -------------------------------------------------------------------------------

function add(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a + b;
  if (typeof a === 'number' && typeof b === 'number') return a + b;
  return num(a) + num(b);
}

function sub(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a - b;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return num(a) - num(b);
}

function doMul(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a * b;
  if (typeof a === 'number' && typeof b === 'number') return a * b;
  return num(a) * num(b);
}

function doDiv(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    if (b === 0n) return NaN;
    return a / b;
  }
  const na = num(a), nb = num(b);
  return nb === 0 ? NaN : na / nb;
}

function doMod(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    if (b === 0n) return NaN;
    return a % b;
  }
  const na = num(a), nb = num(b);
  return nb === 0 ? NaN : na % nb;
}

function doPow(base, exp) {
  if (typeof base === 'bigint' && typeof exp === 'bigint') {
    if (exp < 0n) return NaN;
    return base ** exp;
  }
  if (typeof base === 'bigint' && typeof exp === 'number' && Number.isInteger(exp) && exp >= 0) {
    return base ** BigInt(exp);
  }
  return Math.pow(num(base), num(exp));
}

function doAnd(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a & b;
  return BigInt(num(a)) & BigInt(num(b));
}

function doXor(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a ^ b;
  return BigInt(num(a)) ^ BigInt(num(b));
}

function doShl(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a << b;
  return BigInt(num(a)) << BigInt(num(b));
}

function doShr(a, b) {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a >> b;
  return BigInt(num(a)) >> BigInt(num(b));
}

function doNot(a) {
  if (typeof a === 'bigint') return ~a;
  return ~BigInt(num(a));
}

function doNeg(a) {
  if (typeof a === 'bigint') return -a;
  if (typeof a === 'number') return -a;
  return -num(a);
}

// ---- public API -------------------------------------------------------------------------------

export function safeCalc(input) {
  const result = parse(input);
  if (typeof result === 'number' && Number.isNaN(result)) return NaN;
  return result;
}

export function askedCalcFor(message, me) {
  if (!message) return null;
  const text = message.text ?? '';
  const handles = [me?.username, me?.displayName].filter(Boolean);
  const mentioned = handles.some((h) => text.toLowerCase().includes(`@${h.toLowerCase()}`));
  if (!mentioned) return null;
  let asked = text;
  for (const h of handles) {
    asked = asked.replace(new RegExp(`@${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'), ' ');
  }
  asked = asked.replace(/@\S+/g, ' ').trim();
  return { expression: asked };
}

// ---- bot loop ---------------------------------------------------------------------------------

export async function run(token, { signal, api = API, statePath = STATE } = {}) {
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function call(method, body) {
    const r = await fetch(`${api}/${method}`, {
      method: body ? 'POST' : 'GET',
      headers: auth,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    if (!r.ok) throw new Error(`${method} trả lời ${r.status}: ${await r.text()}`);
    return r.json();
  }

  const me = await call('getMe');
  const state = loadState(statePath);
  let offset = Number(state.offset) || 0;
  console.log(`@${me.username} đang trực | offset=${offset}`);

  for (;;) {
    if (signal?.aborted) break;
    let updates;
    try {
      updates = await call(`getUpdates?offset=${offset}&timeout=30`);
    } catch (problem) {
      if (signal?.aborted) break;
      console.error(String(problem));
      await wait(2000);
      continue;
    }

    if (updates.length) console.log(`nhận ${updates.length} cập nhật, offset hiện tại=${offset}`);

    for (const update of updates) {
      offset = update.id;
      saveState(statePath, { offset });
      try {
        if (update.kind === 'message') {
          const m = update.message;
          const mentioned = [me.username, me.displayName].some((h) => (m.text ?? '').toLowerCase().includes(`@${h.toLowerCase()}`));
          console.log(`  [${update.id}] từ=${m.from?.username ?? '?'} trong=${m.conversationId} text="${(m.text ?? '').slice(0, 80)}"`);
          if (!mentioned) { console.log('    -> bỏ qua (không mention)'); continue; }
          await onMessage(m);
        } else {
          console.log(`  [${update.id}] ${update.kind} trong=${update.membership?.conversationId ?? '?'}`);
        }
      } catch (problem) { console.error(String(problem)); }
    }
  }

  async function onMessage(message) {
    const asked = askedCalcFor(message, me);
    if (!asked) return;
    if (!asked.expression) {
      const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
      console.log(`    -> @${me.username} nhưng không có biểu thức → chửi`);
      await say(message.conversationId, roast, message.messageId);
      return;
    }
    const result = safeCalc(asked.expression);
    if (typeof result === 'number' && Number.isNaN(result)) {
      const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
      console.log(`    -> "${asked.expression}" → biểu thức sai → chửi`);
      await say(message.conversationId, roast, message.messageId);
      return;
    }
    const answer = fmt(result);
    console.log(`    -> "${asked.expression}" → ${answer}`);
    await say(message.conversationId, answer, message.messageId);
  }

  async function say(conversationId, text, replyToMessageId) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await call('sendMessage', { conversationId, text, replyToMessageId });
        console.log(`    -> đã gửi vào ${conversationId}`);
        return result;
      } catch (problem) {
        const msg = String(problem);
        if (!msg.includes('429') || attempt === 2) { console.error(`    -> gửi thất bại vào ${conversationId}: ${msg}`); return null; }
        await wait(1100 * (attempt + 1));
      }
    }
    return null;
  }
}

// ---- state ------------------------------------------------------------------------------------

function loadState(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return { offset: 0 }; }
}

function saveState(path, state) {
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(`${path}.tmp`, JSON.stringify(state));
    renameSync(`${path}.tmp`, path);
  } catch (problem) { console.error(`không ghi được trạng thái: ${problem}`); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const token = process.env.ZEPLAO_BOT_TOKEN;
  if (!token) { console.error('Chưa có ZEPLAO_BOT_TOKEN.'); process.exit(2); }
  const stopping = new AbortController();
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => stopping.abort());
  await run(token, { signal: stopping.signal });
}
