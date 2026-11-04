import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import zlib from 'node:zlib';

export const API = process.env.ZEPLAO_BOT_API ?? 'https://api-bot.kuku.vn';
export const STATE = process.env.MATHBOT_STATE
  ?? fileURLToPath(new URL('./data/state.json', import.meta.url));
export const AUTHOR = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx';

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

// ---- stock market helpers (trần/sàn) --------------------------------------------------------

const EXCHANGE_LIMITS = {
  hose: 0.07,  // HOSE: 7%
  hnx: 0.10,   // HNX: 10%
  upcom: 0.15, // UPCOM: 15%
};

const EXCHANGE_NAMES = {
  hose: 'HOSE (7%)',
  hnx: 'HNX (10%)',
  upcom: 'UPCOM (15%)',
};

// ---- price lookup (from boco) ----------------------------------------------------------------

const FEED = process.env.BOCO_FEED ?? 'https://bgapidatafeed.vps.com.vn';
const TIMEOUT_MS = 8000;

const MARKET_TO_EXCHANGE = {
  'HOSE': 'hose',
  'HNX': 'hnx',
  'UPX': 'upcom',
  'UPCOM': 'upcom',
};

export async function fetchPrice(symbol, { feed = FEED, fetchImpl = fetch } = {}) {
  const url = `${feed}/getliststockdata/${symbol.toUpperCase()}`;
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data) || !data[0]) return null;
  const raw = data[0];
  const price = Number(raw.lastPrice) || 0;
  const reference = Number(raw.r) || 0;
  return {
    symbol: raw.sym,
    price: price > 0 ? price : reference,
    reference,
    traded: price > 0,
    exchange: MARKET_TO_EXCHANGE[raw.marketId] ?? MARKET_TO_EXCHANGE[raw.mc] ?? 'hose',
  };
}

/**
 * Parse lệnh kiểu: <mã> tran|san <giá_mục_tiêu> [sàn]
 * Ví dụ: pom tran 7, pnj san 20, vic tran 50 upcom
 */
export function parseStockLookup(text) {
  const trimmed = text.trim().toLowerCase();
  // Remove @bot prefix if present
  const withoutMention = trimmed.replace(/^@\S+\s+/, '').trim();

  // Pattern: <mã> vebo|dallas <giá_mục_tiêu> [sàn]
  const match = withoutMention.match(/^([a-z0-9]+)\s+(vebo|dallas)\s+(\d+(?:\.\d+)?)\s*(hose|hnx|upcom)?$/);
  if (!match) return null;

  return {
    symbol: match[1].toUpperCase(),
    isCeiling: match[2] === 'vebo',
    targetPrice: parseFloat(match[3]),
    exchange: match[4] || 'hose',
  };
}

/**
 * Tính số phiên trần để đạt giá mục tiêu (vebo)
 */
export function calcCeilingSessions(entryPrice, targetPrice, exchange = 'hose') {
  const limit = EXCHANGE_LIMITS[exchange.toLowerCase()] ?? EXCHANGE_LIMITS.hose;
  if (entryPrice <= 0 || targetPrice <= entryPrice) {
    return { sessions: 0, finalPrice: entryPrice, exchange, limit };
  }
  let price = entryPrice;
  let sessions = 0;
  while (price < targetPrice) {
    price = Math.round(price * (1 + limit) * 100) / 100;
    sessions++;
    if (sessions > 1000) break;
  }
  return { sessions, finalPrice: price, exchange, limit };
}

/**
 * Tính số phiên sàn để đạt giá mục tiêu
 */
export function calcFloorSessions(entryPrice, targetPrice, exchange = 'hose') {
  const limit = EXCHANGE_LIMITS[exchange.toLowerCase()] ?? EXCHANGE_LIMITS.hose;
  if (entryPrice <= 0 || targetPrice >= entryPrice) {
    return { sessions: 0, finalPrice: entryPrice, exchange, limit };
  }
  let price = entryPrice;
  let sessions = 0;
  while (price > targetPrice) {
    price = Math.round(price * (1 - limit) * 100) / 100;
    sessions++;
    if (sessions > 1000) break;
  }
  return { sessions, finalPrice: price, exchange, limit };
}

function formatStockResult(symbol, currentPrice, result, isCeiling) {
  const { sessions, finalPrice, exchange, limit } = result;
  const exchangeName = EXCHANGE_NAMES[exchange.toLowerCase()] ?? exchange.toUpperCase();
  const action = isCeiling ? 'vebo' : 'dallas';
  const arrow = isCeiling ? '↑' : '↓';
  const percent = Math.round(limit * 100);

  if (sessions === 0) {
    return `${symbol} ${fmt(currentPrice)} — không cần phiên ${action} nào. Giá mục tiêu đã đạt.`;
  }

  // Tính từng phiên để giải thích
  const steps = [];
  let price = currentPrice;
  for (let i = 1; i <= sessions; i++) {
    const next = isCeiling
      ? Math.round(price * (1 + limit) * 100) / 100
      : Math.round(price * (1 - limit) * 100) / 100;
    steps.push(`${i}. ${fmt(price)} × ${percent}% → ${fmt(next)}`);
    price = next;
  }

  const header = `${symbol} ${fmt(currentPrice)} → ${sessions} phiên ${action} ${exchangeName}`;
  const detail = steps.join('\n');
  const footer = `${arrow} Giá cuối: ${fmt(finalPrice)}`;

  return `${header}\n${detail}\n${footer}`;
}

// ---- vietqr: tài khoản nhận tiền của từng người -----------------------------------------------
//
// Ai đó gõ `register` một lần, số tài khoản nằm lại trong state; từ đó `gen-qr` dựng mã chuyển
// tiền cho chính người ấy. Khoá theo `userId` chứ không theo username: username có thể null và
// đổi được, còn userId thì không.
//
// Ảnh lấy từ Quick Link của VietQR (https://www.vietqr.io/qr-dong) — một URL, không cần khoá, trả
// về SVG. Nền tảng bot chỉ nhận ảnh PNG hoặc SVG sạch, mà SVG của VietQR thì không sạch theo nghĩa
// nào dùng được — nên mã được dựng lại từ chính hình vector của nó (`parseQrSvg`) rồi vẽ thành PNG
// (`qrPng`). Xem chú thích ở `parseQrSvg` để biết vì sao không bóc thẳng tấm ảnh nền.

export const VIETQR_IMAGE = process.env.VIETQR_IMAGE ?? 'https://img.vietqr.io';
export const VIETQR_API = process.env.VIETQR_API ?? 'https://api.vietqr.io';
export const QR_TEMPLATE = process.env.VIETQR_TEMPLATE ?? 'compact2';

const BANK_TTL_MS = 6 * 60 * 60 * 1000;   // danh sách ngân hàng đổi rất chậm
const MOST_IMAGE_BYTES = 2_000_000;       // nền tảng từ chối ảnh quá 2 MB
const MOST_DESCRIPTION = 50;              // VietQR: nội dung tối đa 50 chữ cái

// Gốc API → { at, index }. Nhớ theo gốc chứ không nhớ chung: bộ test dựng server giả ở cổng khác
// nhau, mà một cái cache không tên sẽ trả danh sách của server trước cho server sau.
const bankCache = new Map();

function escapeForRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Bỏ đúng mention của bot, để phần còn lại là câu lệnh. */
export function stripBotMention(text, me) {
  let body = String(text ?? '');
  for (const handle of [me?.username, me?.displayName].filter(Boolean)) {
    body = body.replace(new RegExp(`@${escapeForRegExp(handle)}`, 'gi'), ' ');
  }
  return body.replace(/\s+/g, ' ').trim();
}

function normalizeBankKey(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Danh sách ngân hàng của VietQR, tra một lần rồi nhớ. */
export async function bankDirectory({ api = VIETQR_API, fetchImpl = fetch, now = Date.now() } = {}) {
  const cached = bankCache.get(api);
  if (cached && now - cached.at < BANK_TTL_MS) return cached.index;

  const response = await fetchImpl(`${api}/v2/banks`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`danh sách ngân hàng trả lời ${response.status}`);
  const payload = await response.json();
  const banks = Array.isArray(payload?.data) ? payload.data : [];
  if (!banks.length) throw new Error('danh sách ngân hàng rỗng');

  // Một ngân hàng có nhiều tên gọi, ai gõ cái nào cũng phải ra. Trùng khoá thì tên viết tắt và mã
  // BIN thắng tên đầy đủ — người ta gõ `vcb` chứ ít ai gõ cả dòng tên pháp lý.
  const index = new Map();
  const put = (alias, bank, priority) => {
    const key = normalizeBankKey(alias);
    if (!key) return;
    const seen = index.get(key);
    if (!seen || priority > seen.priority) index.set(key, { bank, priority });
  };
  for (const bank of banks) {
    put(bank.short_name, bank, 1);
    put(bank.shortName, bank, 2);
    put(bank.bin, bank, 3);
    put(bank.code, bank, 4);
  }

  bankCache.set(api, { at: now, index });
  return index;
}

/** Ngân hàng theo đúng cách người dùng gọi tên, hoặc null nếu không có ngân hàng nào như vậy. */
export async function lookupBank(token, options = {}) {
  const found = (await bankDirectory(options)).get(normalizeBankKey(token));
  if (!found) return null;
  const { bank } = found;
  return {
    bankId: String(bank.bin || bank.code || ''),
    label: bank.shortName || bank.short_name || bank.code || String(bank.bin ?? ''),
    code: bank.code,
  };
}

/**
 * Số tiền người Việt gõ: `100000`, `100.000`, `100,000`, `100k`, `1,5tr`, `2 triệu`.
 *
 * Dấu chấm đứng giữa từng nhóm ba chữ số là dấu nghìn, còn lại là dấu thập phân. Đoán sai thì ra
 * một con số vô lý mà không ai biết là sai, nên chỉ nhận những dạng đọc được rõ ràng; còn lại trả
 * null để bot hỏi lại.
 */
export function parseAmount(raw) {
  let text = String(raw ?? '').trim().toLowerCase().replace(/\s+/g, '');
  if (!text) return null;

  const units = { k: 1e3, nghìn: 1e3, tr: 1e6, triệu: 1e6, m: 1e6, tỷ: 1e9, ty: 1e9 };
  const suffix = /(k|tr|m|triệu|nghìn|tỷ|ty)$/.exec(text);
  let unit = 1;
  if (suffix) {
    unit = units[suffix[1]];
    text = text.slice(0, -suffix[1].length);
  }
  if (!text) return null;

  if (/^\d{1,3}(?:\.\d{3})+$/.test(text) || /^\d{1,3}(?:,\d{3})+$/.test(text)) text = text.replace(/[.,]/g, '');
  else if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (!/^\d+(?:\.\d+)?$/.test(text)) return null;

  const value = Math.round(Number(text) * unit);
  if (!Number.isFinite(value) || value < 1 || value > 9_999_999_999_999) return null;   // VietQR: tối đa 13 chữ số
  return value;
}

/** Nội dung chuyển khoản: VietQR chỉ nhận chữ, số và khoảng trắng, tối đa 50 ký tự. */
export function cleanDescription(raw) {
  return String(raw ?? '')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MOST_DESCRIPTION);
}

export function formatMoney(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** `register <ngân hàng> <số tài khoản> <tên chủ tài khoản>` — tên đứng cuối nên được có dấu cách. */
export function parseRegister(text, me) {
  const match = /^register\s+(\S+)\s+(\S+)\s+(.+)$/i.exec(stripBotMention(text, me));
  if (!match) return null;
  return {
    bankToken: match[1],
    accountNo: match[2],
    name: match[3].replace(/\s+/g, ' ').trim(),
  };
}

/** `gen-qr [số tiền] [nội dung]` — không có số tiền thì mã vẫn dựng, chỉ là để trống. */
export function parseQrRequest(text, me) {
  const match = /^gen-?qr(?:\s+([\s\S]+))?$/i.exec(stripBotMention(text, me));
  if (!match) return null;
  const rest = (match[1] ?? '').trim();
  if (!rest) return { amount: null, description: '' };

  const [first, ...tail] = rest.split(/\s+/);
  const amount = parseAmount(first);
  if (amount === null) return { amount: null, description: cleanDescription(rest), unreadable: first };
  return { amount, description: cleanDescription(tail.join(' ')) };
}

/** Đường link Quick Link của một tài khoản. */
export function qrLink(account, { amount = null, description = '' } = {}, { image = VIETQR_IMAGE } = {}) {
  const query = new URLSearchParams();
  if (amount) query.set('amount', String(amount));
  if (description) query.set('addInfo', description);
  if (account.name) query.set('accountName', account.name);
  const params = query.toString();
  return `${image}/image/${account.bankId}-${account.accountNo}-${QR_TEMPLATE}.svg${params ? `?${params}` : ''}`;
}

/**
 * Tấm SVG của VietQR gồm hai phần, và chúng phải được giữ **cả hai**.
 *
 * Phần thứ nhất là một `<image>` phủ kín khung — ấy là nền: khung, logo ngân hàng, tên chủ tài
 * khoản, số tiền, nội dung. Phần thứ hai là một `<g transform="translate(x y) scale(s)">` chứa ô
 * trắng cùng một `<path>` vẽ từng module của mã.
 *
 * Tấm nguyên bản hợp lệ theo đúng luật máy chủ ghi, nên nó được gửi trước (`fetchQr`). Hàm này chỉ
 * dựng bản thay thế cho trường hợp tấm ấy bị từ chối, hoặc bị nhận mà bộ lọc của máy chủ bỏ mất
 * `<g transform>` khiến mã nằm sai chỗ.
 *
 * Bóc tấm nền ra thì người nhận thấy khung với logo mà giữa trống; bóc hình vector ra thì thấy mã
 * trơ, mất hết thông tin chuyển khoản. Nên ở đây bóc **cả hai**, rồi `composeQrSvg` ghép lại.
 */
export function parseQrSvg(svg) {
  const group = /<g\b[^>]*transform="translate\(\s*([\d.]+)[\s,]+([\d.]+)\s*\)\s*scale\(\s*([\d.]+)\s*\)"[^>]*>([\s\S]*?)<\/g>/.exec(svg);
  if (!group) return null;
  const translateX = Number(group[1]);
  const translateY = Number(group[2]);
  const scale = Number(group[3]);
  const inner = group[4];
  const box = /<rect\b[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/.exec(inner);
  const path = /<path\b[^>]*\bd="([^"]*)"/.exec(inner);
  if (!box || !path) return null;

  const size = Number(box[1]);
  if (Number(box[2]) !== size || !Number.isInteger(size) || size < 9 || size > 200) return null;
  if (!Number.isFinite(translateX) || !Number.isFinite(translateY) || !(scale > 0)) return null;

  const grid = Array.from({ length: size }, () => new Uint8Array(size));
  let runs = 0;
  for (const run of path[1].matchAll(/M(\d+)\s+(\d+)\s*h(\d+)\s*v1\s*h-\d+\s*z/g)) {
    const x = Number(run[1]), y = Number(run[2]), width = Number(run[3]);
    if (y >= size) return null;                      // chạm ra ngoài khung nghĩa là không phải mã
    for (let i = 0; i < width && x + i < size; i++) grid[y][x + i] = 1;
    runs++;
  }
  if (runs < 50) return null;

  // Nền là ảnh đầu tiên; bỏ nó đi thì tấm card mất khung, mất logo, mất tên. Kích thước của nó
  // cũng chính là khổ tấm card, nên phải lấy theo nó chứ không theo lưới mã — lưới chỉ là một phần
  // nằm trong ấy.
  const image = /<image\b([^>]*)\bhref="(data:image\/[\w+.-]+;base64,[^"]+)"([^>]*)>/.exec(svg);
  const sizeOf = (attrs, name) => Number(new RegExp(`\\b${name}="([\\d.]+)"`).exec(attrs)?.[1]);

  return {
    size,
    grid,
    version: (size - 17) / 4,
    quiet: 4,
    at: { x: translateX, y: translateY },
    scale,
    background: image ? image[2] : null,
    backgroundSize: image
      ? { width: sizeOf(image[1] + image[3], 'width'), height: sizeOf(image[1] + image[3], 'height') }
      : null,
  };
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, 'latin1');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0);
  return Buffer.concat([head, body, tail]);
}

/**
 * Lưới module thành PNG, mỗi module `scale` điểm ảnh, viền trắng `quiet` module.
 *
 * Ghi ra **RGBA**, không phải thang xám: đen trắng thì thang xám là lẽ tự nhiên, và đó chính là
 * kiểu đã bị máy chủ nhận rồi mà không hiện — ảnh nào render được cũng là RGBA. Bốn kênh là thứ
 * mọi đường xử lý ảnh đều chắc chắn đọc được, còn thang xám thì không phải đường nào cũng có.
 */
export function qrPng(grid, { scale = 8, quiet = 4 } = {}) {
  const size = grid.length;
  const side = (size + quiet * 2) * scale;
  const row = Buffer.alloc(side * 4, 0xff);   // một dòng trắng, chép lại cho mọi dòng trắng
  const rows = [];
  for (let i = 0; i < quiet * scale; i++) rows.push(row);

  for (const line of grid) {
    const pixels = Buffer.alloc(side * 4, 0xff);
    let at = quiet * scale;
    for (let x = 0; x < size; x++) {
      if (line[x]) for (let i = 0; i < scale; i++) pixels.fill(0, (at + i) * 4, (at + i) * 4 + 3);
      at += scale;
    }
    for (let i = 0; i < scale; i++) rows.push(pixels);
  }
  for (let i = 0; i < quiet * scale; i++) rows.push(row);

  const header = Buffer.alloc(13);
  header.writeUInt32BE(side, 0);
  header.writeUInt32BE(side, 4);
  header[8] = 8;    // 8 bit một kênh
  header[9] = 6;    // RGBA
  const raw = Buffer.concat(rows.map((pixels) => Buffer.concat([Buffer.from([0]), pixels])));

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Ghép nền của VietQR với lưới mã thành một tấm SVG sạch.
 *
 * Lưới được vẽ thẳng bằng toạ độ tuyệt đối, không dùng `<g transform>`: transform là thứ duy nhất
 * có mặt trong tấm SVG gốc mà tấm dựng lại không có, nên nó là nghi phạm đầu tiên cho việc mã không
 * hiện. Bỏ nó đi thì không còn gì để đoán.
 */
export function composeQrSvg(parsed) {
  const { size, grid, scale, at, background, backgroundSize } = parsed;
  const pad = parsed.quiet * scale;
  // Khổ tấm card lấy theo nền, không theo lưới mã: nền mới là cả tấm, mã chỉ nằm trong ấy.
  const width = backgroundSize?.width || pad * 2 + size * scale;
  const height = backgroundSize?.height || pad * 2 + size * scale;

  const runs = [];
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!grid[y][x]) { x++; continue; }
      let width_ = 1;
      while (x + width_ < size && grid[y][x + width_]) width_++;
      const span = (width_ * scale).toFixed(2);
      const px = (at.x + x * scale).toFixed(2);
      const py = (at.y + y * scale).toFixed(2);
      runs.push(`M${px} ${py}h${span}v${scale}h-${span}z`);
      x += width_;
    }
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '"'
    + ' width="' + width + '" height="' + height + '" shape-rendering="crispEdges">'
    + (background ? `<image x="0" y="0" width="${width}" height="${height}" href="${background}"/>` : '')
    // Không có ô trắng nào dưới mã.
    //
    // Nền đã chừa sẵn đúng khoảng trống ấy — mã khớp khít vào đó, không đè lên header, số tài khoản
    // hay tên. Thêm một ô trắng chỉ để che mất dòng "Số tài khoản" mà nền vốn đã vẽ.
    + '<path fill="#000000" d="' + runs.join('') + '"/></svg>';
}

/**
 * Cùng lưới ấy, vẽ thành SVG trơ — chỉ mã, không nền.
 *
 * Đường lùi cuối: tấm ghép bị từ chối vì tấm nền thì tấm này vẫn còn. Mất khung lẫn logo, nhưng vẫn
 * quét được.
 */
export function qrSvg(grid) {
  const size = grid.length;
  const runs = [];
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!grid[y][x]) { x++; continue; }
      let width = 1;
      while (x + width < size && grid[y][x + width]) width++;
      runs.push(`M${x} ${y}h${width}v1h-${width}z`);
      x += width;
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '"'
    + ' width="' + size * 8 + '" height="' + size * 8 + '" shape-rendering="crispEdges">'
    + '<rect width="' + size + '" height="' + size + '" fill="#ffffff"/>'
    + '<path fill="#000000" d="' + runs.join('') + '"/></svg>';
}

/**
 * Chữ trơn thành một khối rich.
 *
 * Tin **có ảnh** phải đi kèm chữ dưới dạng rich, không phải `text` trần. Chữ của một tin có ảnh
 * được client vẽ bằng markup của chính nó, và chỉ chữ trong markup ấy mới được xử lý đàng hoàng;
 * bot chứng khoán trong nhóm gửi chart theo đúng lối này. Gửi `text` trần cạnh `image` là lối đi
 * chưa ai chạy thử.
 */
function asRich(text) {
  return { text, rich: { blocks: [{ type: 'paragraph', text }] } };
}

/**
 * Ảnh QR và đường link của nó.
 *
 * `images` là danh sách ứng viên theo thứ tự thử, và rỗng khi VietQR từ chối dựng hoặc câu trả lời
 * không còn là mã dựng lại được — lúc ấy `link` vẫn còn nguyên để gửi kèm, vì một cái link bấm được
 * vẫn hơn một câu xin lỗi.
 */
export async function fetchQr(account, { amount = null, description = '' } = {}, { image = VIETQR_IMAGE, fetchImpl = fetch } = {}) {
  const link = qrLink(account, { amount, description }, { image });
  const response = await fetchImpl(link, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  const body = await response.text();
  if (!response.ok) return { link, images: [], status: response.status };

  const parsed = parseQrSvg(body);
  if (!parsed) return { link, images: [], status: response.status, reason: 'unreadable_qr' };

  const name = `vietqr-${account.accountNo}`;
  // Bốn ứng viên, thử lần lượt cho tới khi một cái đi được.
  //
  // 1. Tấm nguyên bản của VietQR. Chưa từng thử gửi lần nào, nhưng nó hợp lệ theo đúng luật máy chủ
  //    ghi: có thẻ `svg`, không script, không foreignObject, không handler, không link ngoài (mọi
  //    `href` đều là `data:`). Nếu máy chủ nhận thì đây là tấm đẹp nhất — không có gì phải dựng lại.
  // 2. Tấm ghép: đúng nội dung ấy, vẽ lại bằng toạ độ tuyệt đối, không `transform`. Dành cho trường
  //    hợp máy chủ nhận tấm 1 nhưng bộ lọc của nó bỏ `<g transform>` — khi ấy mã sẽ nằm sai chỗ.
  // 3. SVG trơ: chỉ mã, không nền.
  // 4. PNG.
  const images = [
    { fileName: `${name}.svg`, contentType: 'image/svg+xml', svg: body },
    { fileName: `${name}-composed.svg`, contentType: 'image/svg+xml', svg: composeQrSvg(parsed) },
    { fileName: `${name}-qr.svg`, contentType: 'image/svg+xml', svg: qrSvg(parsed.grid) },
  ];
  const png = qrPng(parsed.grid);
  if (png.length <= MOST_IMAGE_BYTES) {
    images.push({ fileName: `${name}.png`, contentType: 'image/png', dataBase64: png.toString('base64') });
  }

  return { link, images, status: response.status, version: parsed.version };
}

/**
 * Chữ đi kèm ảnh QR — số tiền và nội dung phải đọc được cả khi không mở ảnh.
 *
 * Link in kèm ở cuối, có chủ đích: nó là **nguyên văn** thứ bot đã hỏi VietQR, nên nhìn nó là biết
 * ngay số tài khoản, số tiền hay nội dung đã đi sai ở đâu — không phải mở log máy chủ ra dò.
 */
export function qrCaption(account, amount, description, link = null) {
  const lines = [`QR chuyển tiền — ${account.bankLabel} ${account.accountNo}`, account.name];
  lines.push(amount === null ? 'Số tiền: để trống, người chuyển tự nhập' : `Số tiền: ${formatMoney(amount)}đ`);
  if (description) lines.push(`Nội dung: ${description}`);
  if (link) lines.push('', link);
  return lines.join('\n');
}

// ---- help -------------------------------------------------------------------------------------

const usageRegister = (bot) => `Cú pháp: @${bot} register <ngân hàng> <số tài khoản> <tên chủ tài khoản>
Ví dụ: @${bot} register timo 0905473034 nguyen tan hieu`;

const usageQr = (bot) => `Cú pháp: @${bot} gen-qr <số tiền> <nội dung>
Ví dụ: @${bot} gen-qr 100k tra tien an trua
Số tiền hiểu được: 100000, 100.000, 100k, 1,5tr, 2 triệu.`;

const HELP_TEXT = `Cú pháp tính toán:
@mathtanbot <biểu thức> — ví dụ: @mathtanbot 2 + 3 * 4

Đăng ký tài khoản nhận tiền, một lần:
@mathtanbot register <ngân hàng> <số tài khoản> <tên chủ tài khoản>
Ví dụ: @mathtanbot register timo 0905473034 nguyen tan hieu

Xem mã QR chuyển tiền của chính mình:
@mathtanbot gen-qr <số tiền> <nội dung>
Ví dụ: @mathtanbot gen-qr 100k tra tien an trua
Số tiền hiểu được: 100000, 100.000, 100k, 1,5tr, 2 triệu.

Cú pháp tính phiên vebo/dallas (tự động lấy giá hiện tại):
@mathtanbot <mã> vebo <giá_mục_tiêu> [sàn]
@mathtanbot <mã> dallas <giá_mục_tiêu> [sàn]

Lưu ý: giá_mục_tiêu ĐẶT TRƯỚC, sàn ĐẶT SAU.

Sàn giao dịch (mặc định: hose):
• hose — HOSE (7%)
• hnx — HNX (10%)
• upcom — UPCOM (15%)

Ví dụ:
@mathtanbot pom vebo 7 — POM cần bao nhiêu phiên vebo để đạt giá 7
@mathtanbot pnj dallas 20 — PNJ cần bao nhiêu phiên dallas để về giá 20
@mathtanbot vic vebo 50 upcom — VIC vebo trên UPCOM (15%)`;

export function askedHelpFor(message, me) {
  if (!message) return null;
  const text = (message.text ?? '').toLowerCase();
  const handles = [me?.username, me?.displayName].filter(Boolean);
  const mentioned = handles.some((h) => text.includes(`@${h.toLowerCase()}`));
  if (!mentioned) return null;
  return text.includes('help') ? { addressed: true } : null;
}

// ---- askedCalcFor -----------------------------------------------------------------------------

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

export async function run(token, {
  signal,
  api = API,
  statePath = STATE,
  fetchImpl = fetch,
  feed = FEED,
  qrImage = VIETQR_IMAGE,
  qrApi = VIETQR_API,
} = {}) {
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
  const accounts = state.accounts ?? {};
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
      saveState(statePath, { offset, accounts });
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

  /**
   * Lưu tài khoản rồi trả về chính mã QR của nó để người gõ nhìn mà kiểm.
   *
   * Đọc ảnh người dùng gửi là chuyện nền tảng không cho (`messageType` chỉ có text và sticker),
   * nên không có cách nào tự bóc mã QR của họ ra. Đổi lại: sai thì thấy ngay trong tấm card vừa
   * gửi, và gõ lại `register` là xong — rẻ hơn nhiều so với việc phát hiện lúc đã có người chuyển
   * tiền vào một số tài khoản không phải của mình.
   */
  async function onRegister(message, registration) {
    const userId = message.from?.userId;
    if (!userId) return;

    let bank;
    try {
      bank = await lookupBank(registration.bankToken, { api: qrApi, fetchImpl });
    } catch (problem) {
      console.error(`    -> tra danh sách ngân hàng hỏng: ${problem}`);
      await say(message.conversationId, 'Chưa tra được danh sách ngân hàng, thử lại sau nhé.', message.messageId);
      return;
    }
    if (!bank) {
      await say(
        message.conversationId,
        `Không có ngân hàng nào tên "${registration.bankToken}". Thử tên viết tắt hoặc mã BIN, ví dụ: timo, vcb, tcb, 970436.`,
        message.messageId,
      );
      return;
    }

    // Số tài khoản dính liền dấu gạch vì người ta hay gõ `090-547-3034`; cắt hết trước khi kiểm.
    const accountNo = registration.accountNo.replace(/[.\-\s]/g, '');
    if (!/^[A-Za-z0-9]{4,19}$/.test(accountNo)) {
      await say(
        message.conversationId,
        `Số tài khoản "${registration.accountNo}" không hợp lệ. VietQR nhận 4–19 ký tự chữ hoặc số.`,
        message.messageId,
      );
      return;
    }

    const account = { bankId: bank.bankId, bankLabel: bank.label, accountNo, name: registration.name };
    accounts[userId] = account;
    saveState(statePath, { offset, accounts });

    // Thử dựng luôn tấm xác nhận. Ngân hàng tra được mà mã không dựng nổi thì số tài khoản nhiều
    // khả năng sai — đừng lưu một thứ chưa từng dựng được thành mã.
    let card;
    try {
      card = await fetchQr(account, {}, { image: qrImage, fetchImpl });
    } catch (problem) {
      console.error(`    -> dựng QR xác nhận hỏng: ${problem}`);
      card = { images: [], link: qrLink(account) };
    }

    console.log(`    -> register ${bank.label} ${accountNo} ${card.images.length ? '(có mã xác nhận)' : '(không dựng được mã)'}`);
    console.log(`       ${card.link}`);

    const confirmed = card.images.length
      ? `Đã lưu tài khoản nhận tiền:\n${bank.label} · ${accountNo} · ${account.name}\n\nMã dưới đây là của chính tài khoản này — sai thì gõ lại register.`
      : `Đã lưu ${bank.label} · ${accountNo} · ${account.name}, nhưng chưa dựng được mã QR để xác nhận. Kiểm lại số tài khoản nếu thấy sai.`;

    // Link đi kèm cả hai trường hợp: có mã thì nó là đường mở mã khi ảnh không hiện, không có mã thì
    // nó là thứ duy nhất nói ra bot vừa hỏi VietQR cái gì mà bị từ chối.
    await say(message.conversationId, `${confirmed}\n\n${card.link}`, message.messageId, { images: card.images });
  }

  /** Mã QR chuyển tiền của người đang gõ. */
  async function onGenQr(message, asked) {
    const userId = message.from?.userId;
    const account = userId ? accounts[userId] : null;
    if (!account) {
      await say(message.conversationId, `Bạn chưa đăng ký tài khoản nhận tiền.\n${usageRegister(me.username)}`, message.messageId);
      return;
    }

    let card;
    try {
      card = await fetchQr(account, { amount: asked.amount, description: asked.description }, { image: qrImage, fetchImpl });
    } catch (problem) {
      console.error(`    -> dựng QR hỏng: ${problem}`);
      await say(message.conversationId, 'Chưa dựng được mã QR, thử lại sau nhé.', message.messageId);
      return;
    }

    // Số tiền gõ vào mà đọc không ra thì nói thẳng, đừng lặng lẽ bỏ đi: người ta sẽ tưởng bot nhận
    // rồi, và chỉ phát hiện lúc có người chuyển thiếu tiền.
    if (asked.unreadable) {
      console.log(`    -> số tiền "${asked.unreadable}" không đọc được`);
      await say(
        message.conversationId,
        `Không đọc được số tiền "${asked.unreadable}", nên mã dưới đây để trống số tiền.\n${usageQr(me.username)}`,
        message.messageId,
      );
    }

    const caption = qrCaption(account, asked.amount, asked.description, card.link);
    console.log(`    -> gen-qr ${account.bankLabel} ${account.accountNo} amount=${asked.amount}`);
    console.log(`       ${card.link}`);

    if (card.images.length) {
      await say(message.conversationId, caption, message.messageId, { images: card.images });
      return;
    }

    // Không dựng được mã thì chữ vẫn đi, kèm một dòng nói ra vì sao — người hỏi còn biết đường thử lại.
    const why = card.reason === 'unreadable_qr'
      ? 'VietQR trả về thứ không đọc ra mã được'
      : card.reason === 'too_large' ? 'mã quá lớn để gửi' : 'VietQR không dựng được mã';
    await say(message.conversationId, `${caption}\n(${why}.)`, message.messageId);
  }

  async function onMessage(message) {
    // Check for help request first
    const helpAsked = askedHelpFor(message, me);
    if (helpAsked) {
      console.log(`    -> help request`);
      await say(message.conversationId, HELP_TEXT, message.messageId);
      return;
    }

    // Đăng ký tài khoản nhận tiền
    const registration = parseRegister(message.text ?? '', me);
    if (registration) {
      await onRegister(message, registration);
      return;
    }

    // Mã QR chuyển tiền của người đang gõ
    const askedQr = parseQrRequest(message.text ?? '', me);
    if (askedQr) {
      await onGenQr(message, askedQr);
      return;
    }

    // Check for stock market commands: <mã> tran|san <giá> [sàn]
    const stockLookup = parseStockLookup(message.text ?? '');
    if (stockLookup) {
      const { symbol, isCeiling, targetPrice } = stockLookup;
      let { exchange } = stockLookup;

      try {
        const quote = await fetchPrice(symbol, { feed, fetchImpl });
        if (!quote) {
          await say(message.conversationId, `Không tìm thấy giá ${symbol}.`, message.messageId);
          return;
        }

        // Dùng sàn từ feed nếu user không chỉ định sàn
        const userSpecifiedExchange = /\s+(hose|hnx|upcom)\s*$/i.test((message.text ?? '').trim());
        if (!userSpecifiedExchange && quote.exchange) {
          exchange = quote.exchange;
        }

        console.log(`    -> stock lookup: ${symbol} ${isCeiling ? 'vebo' : 'dallas'} ${targetPrice} ${exchange}`);

        const result = isCeiling
          ? calcCeilingSessions(quote.price, targetPrice, exchange)
          : calcFloorSessions(quote.price, targetPrice, exchange);

        const answer = formatStockResult(symbol, quote.price, result, isCeiling);
        console.log(`    -> ${answer}`);
        await say(message.conversationId, answer, message.messageId);
      } catch (problem) {
        console.error(`    -> stock lookup failed: ${problem}`);
        await say(message.conversationId, `Không lấy được giá ${symbol}. Thử lại sau.`, message.messageId);
      }
      return;
    }

    const asked = askedCalcFor(message, me);
    if (!asked) return;
    const isAuthor = message.from?.username === AUTHOR;
    if (!asked.expression) {
      if (isAuthor) {
        console.log(`    -> @${me.username} nhưng không có biểu thức → tác giả, nhắc nhẹ`);
        await say(message.conversationId, 'Không có biểu thức nào để tính. Gõ lại nhé!', message.messageId);
      } else {
        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        console.log(`    -> @${me.username} nhưng không có biểu thức → chửi`);
        await say(message.conversationId, roast, message.messageId);
      }
      return;
    }
    const result = safeCalc(asked.expression);
    if (typeof result === 'number' && Number.isNaN(result)) {
      if (isAuthor) {
        console.log(`    -> "${asked.expression}" → biểu thức sai → tác giả, nhắc nhẹ`);
        await say(message.conversationId, 'Biểu thức không hợp lệ, thử lại nhé!', message.messageId);
      } else {
        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        console.log(`    -> "${asked.expression}" → biểu thức sai → chửi`);
        await say(message.conversationId, roast, message.messageId);
      }
      return;
    }
    const answer = fmt(result);
    console.log(`    -> "${asked.expression}" → ${answer}`);
    await say(message.conversationId, answer, message.messageId);
  }

  /**
   * Nói một câu, kèm ảnh nếu có.
   *
   * Tin có ảnh đi kèm chữ dưới dạng rich, và ảnh thử lần lượt từng ứng viên — SVG trước, PNG sau —
   * rồi mới tới chữ không ảnh. Máy chủ từ chối vì bất cứ lý do gì thì nấc sau đi thay, và câu trả
   * lời vẫn tới nơi: một câu trả lời thiếu hình vẫn hơn im lặng, và người hỏi chưa biết là bot hỏng.
   */
  async function say(conversationId, text, replyToMessageId, { images = [] } = {}) {
    for (const image of images) {
      const posted = await send(conversationId, { ...asRich(text), image }, replyToMessageId);
      if (posted) return posted;
      console.error(`    -> ảnh ${image.contentType} không gửi được, thử kiểu kế tiếp`);
    }
    if (images.length) console.error('    -> không gửi được ảnh nào, gửi lại bằng chữ');
    return send(conversationId, { text }, replyToMessageId);
  }

  async function send(conversationId, content, replyToMessageId) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await call('sendMessage', { conversationId, ...content, replyToMessageId });
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
