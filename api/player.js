export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { uid, region } = req.query;

  if (!uid || !region) {
    return res.status(400).json({
      error: true,
      message: "Missing required parameters: 'uid' and 'region'.",
    });
  }

  const targetUrl = `https://info-vip-api.vercel.app/info?uid=${uid}&region=${region}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "XitexeInfoAPI/1.0",
      },
    });

    const data = await response.json();

    if (!response.ok || (data.error && data.error === true)) {
      return res.status(response.status || 400).json({
        error: true,
        message: data.message || "Player not found or external API error.",
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error. Unable to communicate with the provider.",
    });
  }
