const BOT_TOKEN = process.env.BOT_TOKEN;

// Простое хранилище рефералов в памяти (для продакшна нужна БД)
// Для старта достаточно — Vercel держит инстанс в памяти какое-то время
const refs = {};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { action, user_id, ref_id } = req.body;

  // Юзер зашёл по реферальной ссылке
  if (action === 'apply') {
    if (!user_id || !ref_id || user_id === ref_id) {
      return res.json({ ok: false, reason: 'invalid' });
    }
    if (refs[user_id]) {
      return res.json({ ok: false, reason: 'already_used' });
    }
    refs[user_id] = ref_id;

    // Уведомляем реферера
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ref_id,
        text: '🌸 Друг зашёл по твоей ссылке! +50 монет зачислено',
      }),
    });

    return res.json({ ok: true, bonus: 50 });
  }

  // Получить реферальную ссылку
  if (action === 'link') {
    const link = `https://t.me/sakurapixelsbot?start=ref_${user_id}`;
    return res.json({ ok: true, link });
  }

  res.status(400).json({ error: 'Unknown action' });
}
