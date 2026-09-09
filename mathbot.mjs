import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';

export const API = process.env.ZEPLAO_BOT_API ?? 'https://api-bot.kuku.vn';

export const SORRY = {
  calc: 'Không tính được. Hãy thử lại một biểu thức đơn giản như `@mathnewbot 1 + 1`.',
};

function formatResult(result) {
  if (Number.isInteger(result)) return String(result);
  const rounded = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

export function safeCalc(input) {
  const tokens = [];
  const regex = /(\d+(?:\.\d+)?)|([+\-*/()])|\s+/g;
  let match;
  for (;;) {
    match = regex.exec(String(input ?? ''));
    if (!match) break;
    if (match[1] !== undefined) {
      tokens.push({ type: 'num', value: Number(match[1]) });
    } else if (match[2] !== undefined) {
      tokens.push({ type: 'op', value: match[2] });
    }
  }

  let pos = 0;

  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }
  function expectOp(op) {
    if (peek()?.type === 'op' && peek().value === op) { consume(); return true; }
    return false;
  }

  function expr() {
    let result = term();
    while (true) {
      if (expectOp('+')) result += term();
      else if (expectOp('-')) result -= term();
      else break;
    }
    return result;
  }

  function term() {
    let result = factor();
    while (true) {
      if (expectOp('*')) result *= factor();
      else if (expectOp('/')) {
        const divisor = factor();
        if (divisor === 0) return NaN;
        result /= divisor;
      } else break;
    }
    return result;
  }

  function factor() {
    if (expectOp('(')) {
      const result = expr();
      if (!expectOp(')')) return NaN;
      return result;
    }
    if (expectOp('-')) return -factor();
    if (expectOp('+')) return factor();
    const tok = peek();
    if (tok?.type === 'num') { consume(); return tok.value; }
    return NaN;
  }

  if (!tokens.length) return NaN;
  const result = expr();
  if (pos < tokens.length || Number.isNaN(result)) return NaN;
  return result;
}

export function askedCalcFor(message, me) {
  if (!message) return null;

  const text = message.text ?? '';
  const handles = [me?.username, me?.displayName].filter(Boolean);
  const mentioned = handles.some((h) => text.toLowerCase().includes(`@${h.toLowerCase()}`));
  if (!mentioned) return null;

  let asked = text;
  for (const handle of handles) {
    asked = asked.replace(new RegExp(`@${handle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'), ' ');
  }
  asked = asked.replace(/@\S+/g, ' ').trim();

  return { expression: asked };
}

export async function run(token, { signal, api = API } = {}) {
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function call(method, body) {
    const response = await fetch(`${api}/${method}`, {
      method: body ? 'POST' : 'GET',
      headers: auth,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    if (!response.ok) {
      throw new Error(`${method} trả lời ${response.status}: ${await response.text()}`);
    }
    return response.json();
  }

  const me = await call('getMe');
  console.log(`@${me.username} đang trực`);

  for (;;) {
    if (signal?.aborted) break;

    let updates;
    try {
      updates = await call('getUpdates?timeout=30');
    } catch (problem) {
      if (signal?.aborted) break;
      console.error(String(problem));
      await wait(2000);
      continue;
    }

    for (const update of updates) {
      try {
        if (update.kind === 'message') await onMessage(update.message);
      } catch (problem) {
        console.error(String(problem));
      }
    }
  }

  async function onMessage(message) {
    const calcAsked = askedCalcFor(message, me);
    if (!calcAsked) return;

    if (!calcAsked.expression) {
      await say(message.conversationId, SORRY.calc, message.messageId);
      return;
    }

    const result = safeCalc(calcAsked.expression);
    const answer = Number.isNaN(result) ? SORRY.calc : formatResult(result);
    await say(message.conversationId, answer, message.messageId);
  }

  async function say(conversationId, text, replyToMessageId) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await call('sendMessage', { conversationId, text, replyToMessageId });
      } catch (problem) {
        if (!String(problem).includes('429') || attempt === 2) {
          console.error(String(problem));
          return null;
        }
        await wait(1100 * (attempt + 1));
      }
    }
    return null;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const token = process.env.ZEPLAO_BOT_TOKEN;
  if (!token) {
    console.error('Chưa có ZEPLAO_BOT_TOKEN. Tạo bot ở https://kuku.vn/bot rồi đặt biến này.');
    process.exit(2);
  }

  const stopping = new AbortController();
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => stopping.abort());
  }

  await run(token, { signal: stopping.signal });
}
