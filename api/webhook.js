const BOT_TOKEN = process.env.BOT_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const update = req.body;

  // Подтверждение платежа — обязательно для Stars
  if (update.pre_checkout_query) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok: true,
      }),
    });
  }

  // Успешный платёж
  if (update.message && update.message.successful_payment) {
    const payment = update.message.successful_payment;
    const payload = JSON.parse(payment.invoice_payload);
    const userId = update.message.from.id;

    // Отправляем подтверждение юзеру
    const messages = {
      lives: '❤️ +5 Lives добавлено! Удачи в игре 🌸',
      hint:  '💡 3 Hints добавлено! Используй с умом ✨',
      moon:  '🌙 Moon Palace разблокирован! 20 новых уровней ждут тебя',
      magic: '🔮 Magic Realm разблокирован! Испытай себя в 30 экспертных уровнях',
    };

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userId,
        text: messages[payload.type] || '✅ Покупка успешна!',
      }),
    });
  }

  res.status(200).json({ ok: true });
}
