const BOT_TOKEN = process.env.BOT_TOKEN;

const PRODUCTS = {
  lives: { title: '❤️ +5 Lives', description: 'Keep playing without waiting', amount: 25 },
  hint:  { title: '💡 3 Hints',  description: 'Reveal one correct cell',      amount: 15 },
  moon:  { title: '🌙 Moon Palace', description: '20 hard 8×8 puzzles unlocked', amount: 99 },
  magic: { title: '🔮 Magic Realm', description: '30 expert 10×10 puzzles',      amount: 149 },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, user_id } = req.body;
  const product = PRODUCTS[type];
  if (!product) return res.status(400).json({ error: 'Unknown product' });

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        description: product.description,
        payload: JSON.stringify({ type, user_id }),
        currency: 'XTR', // Telegram Stars
        prices: [{ label: product.title, amount: product.amount }],
      }),
    });
    const data = await response.json();
    if (!data.ok) return res.status(500).json({ error: data.description });
    res.json({ url: data.result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
