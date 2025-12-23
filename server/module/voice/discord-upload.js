;(function() {
    const https = require('https');

    /**
     * Upload audio to Discord webhook via multipart/form-data
     * FiveM's Lua PerformHttpRequest can't handle binary data correctly,
     * so we use this JS module for proper Buffer handling.
     */
    function uploadToDiscord(data, callback) {
        // Handle FiveM's parameter injection - first arg might be source
        let params = data;
        if (typeof data === 'number') {
            params = callback;
            callback = arguments[2];
        }

        const { webhookUrl, base64Audio, reportId, senderName, botName, botAvatar } = params || {};

        if (!webhookUrl || !base64Audio) {
            if (callback) callback(false, null, 'Missing webhookUrl or base64Audio');
            return;
        }

        try {
            const audioBuffer = Buffer.from(base64Audio, 'base64');

            if (audioBuffer.length === 0) {
                if (callback) callback(false, null, 'Empty audio data');
                return;
            }

            const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
            const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
            const safeName = (senderName || 'unknown').replace(/[^a-zA-Z0-9]/g, '');
            const filename = `voice_report${reportId}_${safeName}_${timestamp}.webm`;

            const payloadJson = {
                username: botName || 'Report System',
                content: `Voice message in Report #${reportId} from ${senderName}`
            };
            if (botAvatar) {
                payloadJson.avatar_url = botAvatar;
            }

            const bodyParts = [];
            bodyParts.push(Buffer.from(
                `--${boundary}\r\n` +
                'Content-Disposition: form-data; name="payload_json"\r\n' +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(payloadJson) + '\r\n'
            ));
            bodyParts.push(Buffer.from(
                `--${boundary}\r\n` +
                `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
                'Content-Type: audio/webm\r\n\r\n'
            ));
            bodyParts.push(audioBuffer);
            bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

            const fullBody = Buffer.concat(bodyParts);
            const url = new URL(webhookUrl + '?wait=true');

            const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': fullBody.length
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const json = JSON.parse(responseData);
                            if (json.attachments?.[0]?.url) {
                                callback(true, json.attachments[0].url, null);
                            } else {
                                callback(false, null, 'No attachment URL in response');
                            }
                        } catch (e) {
                            callback(false, null, 'Failed to parse Discord response');
                        }
                    } else {
                        let errorMsg = `HTTP ${res.statusCode}`;
                        try {
                            const errorData = JSON.parse(responseData);
                            errorMsg = errorData.message || JSON.stringify(errorData);
                        } catch {
                            if (responseData) errorMsg = responseData;
                        }
                        callback(false, null, errorMsg);
                    }
                });
            });

            req.on('error', (e) => callback(false, null, e.message));
            req.write(fullBody);
            req.end();

        } catch (e) {
            if (callback) callback(false, null, e.message);
        }
    }

    exports('uploadVoiceToDiscord', uploadToDiscord);
})();
