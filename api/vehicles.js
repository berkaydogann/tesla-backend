// Node.js'in kendi icindeki https modulu. Kurulum gerektirmez.
const https = require('https');

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token bulunamadi" });
  }

  const token = authHeader.split(' ')[1];

  // Promise yapisi kuruyoruz cunku https modulu callback ile calisir
  const makeRequest = () => {
    return new Promise((resolve, reject) => {
      
      const options = {
        hostname: 'fleet-api.prd.eu.tesla.com',
        path: '/api/1/vehicles',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Eroni-Backend/1.0'
        }
      };

      const reqTesla = https.request(options, (resTesla) => {
        let data = '';

        // Veri parca parca gelir, onlari topluyoruz
        resTesla.on('data', (chunk) => {
          data += chunk;
        });

        // Veri bitince
        resTesla.on('end', () => {
          try {
            // Gelen veri JSON mi diye kontrol et
            if (!data || data.trim() === '') {
                return resolve({ status: resTesla.statusCode, body: {} });
            }
            const jsonData = JSON.parse(data);
            resolve({ status: resTesla.statusCode, body: jsonData });
          } catch (e) {
            reject(new Error("Tesla'dan gelen veri JSON degil: " + data));
          }
        });
      });

      reqTesla.on('error', (error) => {
        reject(error);
      });

      reqTesla.end();
    });
  };

  try {
    console.log("Tesla Fleet API'ye istek atiliyor (Native HTTPS)...");
    const response = await makeRequest();

    // Basarili donus
    return res.status(response.status).json(response.body);

  } catch (error) {
    console.error("Baglanti Hatasi:", error.message);
    return res.status(500).json({ error: "Sunucu Baglanti Hatasi", details: error.message });
  }
}
