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
        const fetchEngine = async (quality, isAudio) => {
            const response = await fetch('https://api.cobalt.tools/api/json', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ 
                    url: url, 
                    vQuality: quality, 
                    isAudioOnly: isAudio 
                })
            });
            return await response.json();
        };

        const [hdData, sdData, audioData] = await Promise.all([
            fetchEngine('1080', false),
            fetchEngine('480', false),
            fetchEngine('max', true)
        ]);
        
        if (hdData.url || hdData.picker) {
            return res.status(200).json({
                success: true,
                hd: hdData.url || (hdData.picker && hdData.picker[0].url),
                sd: sdData.url || (sdData.picker && sdData.picker[0].url),
                audio: audioData.url || (audioData.picker && audioData.picker[0].url)
            });
        }
        
        return res.status(500).json({ success: false, message: 'Source extraction failed' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
