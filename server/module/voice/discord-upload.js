const https = require('https');

console.log('[sws-report] Discord upload JS module loading...');

/**
 * Upload audio to Discord webhook
 */
function uploadToDiscord(data, callback) {
    console.log(`[sws-report] JS: Raw args:`, JSON.stringify(data)?.substring(0, 200));

    // Handle FiveM's parameter injection - data might be shifted
    let params = data;
    if (typeof data === 'number') {
        // First arg is source, second is our data
        params = callback;
        callback = arguments[2];
    }

    const { webhookUrl, base64Audio, reportId, senderName, botName, botAvatar } = params || {};

    console.log(`[sws-report] JS: uploadToDiscord for report #${reportId}, sender: ${senderName}`);
    console.log(`[sws-report] JS: base64 length: ${base64Audio?.length || 0}`);

    if (!webhookUrl || !base64Audio) {
        console.log('[sws-report] JS: Missing webhookUrl or base64Audio');
        if (callback) callback(false, null, 'Missing parameters');
        return;
    }

    try {
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        console.log(`[sws-report] JS: Decoded audio buffer size: ${audioBuffer.length} bytes`);

        if (audioBuffer.length === 0) {
            console.log('[sws-report] JS: Empty audio buffer after decode');
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
        console.log(`[sws-report] JS: Full body size: ${fullBody.length} bytes`);

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

        console.log('[sws-report] JS: Sending HTTP request to Discord...');

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[sws-report] JS: Discord response status: ${res.statusCode}`);

                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        if (json.attachments && json.attachments[0] && json.attachments[0].url) {
                            const cdnUrl = json.attachments[0].url;
                            console.log(`[sws-report] JS: SUCCESS! CDN URL: ${cdnUrl.substring(0, 60)}...`);
                            if (callback) callback(true, cdnUrl, null);
                        } else {
                            console.log('[sws-report] JS: No attachment URL in response');
                            if (callback) callback(false, null, 'No attachment URL');
                        }
                    } catch (e) {
                        console.log(`[sws-report] JS: Parse error: ${e.message}`);
                        if (callback) callback(false, null, 'Parse error: ' + e.message);
                    }
                } else {
                    let errorMsg = `HTTP ${res.statusCode}`;
                    try {
                        const errorData = JSON.parse(data);
                        errorMsg = errorData.message || JSON.stringify(errorData);
                    } catch {
                        errorMsg = data || errorMsg;
                    }
                    console.log(`[sws-report] JS: Discord error: ${errorMsg}`);
                    if (callback) callback(false, null, errorMsg);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`[sws-report] JS: Request error: ${e.message}`);
            if (callback) callback(false, null, e.message);
        });

        req.write(fullBody);
        req.end();

    } catch (e) {
        console.log(`[sws-report] JS: Exception: ${e.message}`);
        if (callback) callback(false, null, e.message);
    }
}

// Register export for Lua
exports('uploadVoiceToDiscord', uploadToDiscord);

console.log('[sws-report] Discord upload JS module loaded successfully');
