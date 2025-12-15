const axios = require('axios');

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token bulunamadi" });
  }

  // "Bearer XYZ" -> "XYZ"
  const token = authHeader.split(' ')[1];

  try {
    console.log("Tesla Fleet API'ye istek atiliyor...");
    
    // Axios, Node.js ortaminda SSL ve Baglantilari daha iyi yonetir
    const response = await axios.get('https://fleet-api.prd.eu.tesla.com/api/1/vehicles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Eroni-Backend/1.0'
      }
    });

    // Tesla'dan gelen cevabi aynen ilet
    return res.status(200).json(response.data);

  } catch (error) {
    console.error("Tesla Baglanti Hatasi:", error.message);
    
    // Eger Tesla hata donerse detayini gorelim
    if (error.response) {
      return res.status(error.response.status).json({
        error: "Tesla API Hatasi",
        details: error.response.data
      });
    }

    return res.status(500).json({ error: "Vercel Sunucu Hatasi", details: error.message });
  }
}
