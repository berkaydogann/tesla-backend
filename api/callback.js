const axios = require('axios');

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: "Tesla hatasi: " + error });
  }

  if (!code) {
    return res.status(400).send("Kod bulunamadi.");
  }

  try {
    // Tesla'dan Token Istiyoruz
    const response = await axios.post('https://auth.tesla.com/oauth2/v3/token', {
      grant_type: 'authorization_code',
      client_id: process.env.TESLA_CLIENT_ID,       
      client_secret: process.env.TESLA_CLIENT_SECRET,
      code: code,
      redirect_uri: 'https://tesla-backend-sigma.vercel.app/api/callback', 
      audience: 'https://fleet-api.prd.eu.tesla.com'
    });

    const { access_token, refresh_token } = response.data;
    
    // Ekrana basiyoruz
    res.status(200).json({
      message: "Basarili! Tokenlari kopyala.",
      access_token: access_token,
      refresh_token: refresh_token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Hata olustu", details: err.message });
  }
}
