export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    try {
        // Safe Mode: சர்வர் பிளாக் ஆவதைத் தடுக்க ஒற்றை ரிக்குவெஸ்ட் மட்டும் அனுப்பப்படுகிறது
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({ 
                url: url, 
                vQuality: '1080', 
                isAudioOnly: false 
            })
        });

        const data = await response.json();
        
        if (data.url) {
            return res.status(200).json({
                success: true,
                hd: data.url,
                sd: data.url,
                audio: data.url 
            });
        } else if (data.picker && data.picker.length > 0) {
            return res.status(200).json({
                success: true,
                hd: data.picker[0].url,
                sd: data.picker[0].url,
                audio: data.picker[0].url
            });
        }
        
        return res.status(500).json({ success: false, message: 'Extraction blocked' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
