export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: error });
  }

  if (!code) {
    return res.status(400).json({ error: "Code bulunamadi" });
  }

  try {
    // Axios yerine yerel FETCH kullaniyoruz (Kurulum gerektirmez)
    const response = await fetch('https://auth.tesla.com/oauth2/v3/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.TESLA_CLIENT_ID,
        client_secret: process.env.TESLA_CLIENT_SECRET,
        code: code,
        redirect_uri: 'https://tesla-backend-sigma.vercel.app/api/callback', // Kendi adresin oldugundan emin ol
        audience: 'https://fleet-api.prd.eu.tesla.com'
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(JSON.stringify(data));
    }

    const { access_token, refresh_token } = data;

    // Mobil uygulamaya geri donus
    res.redirect(`eroni://auth-success?access_token=${access_token}&refresh_token=${refresh_token}`);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token hatasi", details: err.message || err });
  }
}
