export default async function handler(req, res) {
  // 1. Mobil uygulamadan gelen Token'i al
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token eksik!" });
  }

  // "Bearer XYZ..." -> "XYZ..." temizligi
  const token = authHeader.split(' ')[1]; 

  try {
    // 2. Tesla Fleet API'ye (Avrupa) Server-to-Server istek at
    // Vercel sunucusu oldugu icin Network Hatasi almazsin.
    const response = await fetch('https://fleet-api.prd.eu.tesla.com/api/1/vehicles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Eroni-Backend/1.0'
      }
    });

    const data = await response.json();

    // 3. Tesla'nin cevabini mobil uygulamaya aynen ilet
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Vercel Hatasi", details: error.message });
  }
}
