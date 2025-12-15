const axios = require('axios');

export default async function handler(req, res) {
  // 1. Token Kontrolü
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token eksik! Uygulamadan gonderilmedi." });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log("Tesla Fleet API'ye istek atiliyor (Axios)...");
    
    // 2. Tesla'ya İstek (Axios kullanarak)
    const response = await axios.get('https://fleet-api.prd.eu.tesla.com/api/1/vehicles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Eroni-Backend/1.0'
      }
    });

    // 3. Başarılı Cevap
    return res.status(200).json(response.data);

  } catch (error) {
    // Hata Detaylarını Yakala
    console.error("Tesla Baglanti Hatasi:", error.message);
    
    if (error.response) {
      // Tesla'dan cevap geldi ama hata kodu dondu (Orn: 401, 403)
      return res.status(error.response.status).json({
        error: "Tesla API Hatasi",
        details: error.response.data
      });
    } else if (error.request) {
      // İstek gitti ama cevap gelmedi (Network hatasi)
      return res.status(503).json({ error: "Tesla Sunucusuna Ulasilamadi", details: error.message });
    } else {
      // Kodun icinde baska bir hata oldu
      return res.status(500).json({ error: "Backend Kod Hatasi", details: error.message });
    }
  }
}
