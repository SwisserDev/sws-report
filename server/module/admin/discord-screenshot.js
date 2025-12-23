;(function() {
    const https = require('https');
    const url = require('url');

    /**
     * Upload screenshot to Discord webhook
     * Uses multipart/form-data for binary file upload (Lua can't handle this)
     */
    function uploadScreenshotToDiscord(params, callback) {
        const { webhookUrl, base64Image, playerName, reportId, botName, botAvatar } = params;

        console.log(`[sws-report:debug] uploadScreenshotToDiscord called for ${playerName}, report #${reportId}`);
        console.log(`[sws-report:debug] Image data length: ${base64Image?.length || 0}`);

        if (!webhookUrl || !base64Image) {
            console.log('[sws-report:debug] Missing webhook or image data');
            callback(false, null, 'Missing webhook URL or image data');
            return;
        }

        // Strip data URL prefix if present and detect format
        let base64Data = base64Image;
        let contentType = 'image/png';  // Default to PNG (screenshot-basic uses PNG)
        let extension = 'png';

        if (base64Data.startsWith('data:')) {
            const matches = base64Data.match(/^data:(image\/\w+);base64,/);
            if (matches) {
                contentType = matches[1];
                extension = contentType.split('/')[1];
                base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
            }
        }

        console.log(`[sws-report:debug] Image format: ${contentType}, data length after strip: ${base64Data.length}`);

        const imageBuffer = Buffer.from(base64Data, 'base64');
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const filename = `screenshot_${reportId}_${Date.now()}.${extension}`;

        // Build multipart body - file part
        let body = '';
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
        body += `Content-Type: ${contentType}\r\n\r\n`;

        // Discord embed payload
        const payload = {
            username: botName || 'Report System',
            avatar_url: botAvatar || '',
            embeds: [{
                title: 'Screenshot Captured',
                description: `Screenshot from player: **${playerName}**\nReport ID: #${reportId}`,
                color: 3447003,
                image: { url: `attachment://${filename}` },
                timestamp: new Date().toISOString()
            }]
        };

        // Build multipart body - JSON payload part
        let payloadPart = '';
        payloadPart += `--${boundary}\r\n`;
        payloadPart += 'Content-Disposition: form-data; name="payload_json"\r\n';
        payloadPart += 'Content-Type: application/json\r\n\r\n';
        payloadPart += JSON.stringify(payload);
        payloadPart += '\r\n';

        const ending = `--${boundary}--\r\n`;

        // Combine parts: header + binary + payload + ending
        const bodyStart = Buffer.from(body);
        const bodyEnd = Buffer.from('\r\n' + payloadPart + ending);
        const fullBody = Buffer.concat([bodyStart, imageBuffer, bodyEnd]);

        // Parse webhook URL and add ?wait=true to get response with attachment info
        const parsedUrl = url.parse(webhookUrl + '?wait=true');

        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': fullBody.length
            }
        };

        console.log(`[sws-report:debug] Sending request to Discord...`);

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[sws-report:debug] Discord response status: ${res.statusCode}`);

                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        // URL is in embed image, not attachments (when using attachment:// in embed)
                        const imageUrl = response.embeds?.[0]?.image?.url
                                      || response.attachments?.[0]?.url
                                      || null;
                        console.log(`[sws-report:debug] Screenshot URL: ${imageUrl}`);
                        callback(true, imageUrl, null);
                    } catch (e) {
                        console.log(`[sws-report:debug] Failed to parse response: ${e.message}`);
                        callback(false, null, 'Failed to parse Discord response');
                    }
                } else {
                    console.log(`[sws-report:debug] Discord error response: ${data}`);
                    callback(false, null, `Discord returned status ${res.statusCode}`);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`[sws-report:debug] Request error: ${e.message}`);
            callback(false, null, e.message);
        });
        req.write(fullBody);
        req.end();
    }

    exports('uploadScreenshotToDiscord', uploadScreenshotToDiscord);
})();
