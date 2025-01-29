const axios = require('axios');
const { URL } = require('url');

class HlsProxyManager {
    constructor(config) {
        this.config = config;
        this.proxyCache = new Map();
        this.lastCheck = new Map();
    }

    async validateProxyUrl(url) {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    }

    async checkProxyHealth(proxyUrl) {
        try {
            const response = await axios.head(proxyUrl, {
                timeout: 5000,
                validateStatus: status => status === 200 || status === 302
            });
            return response.status === 200 || response.status === 302;
        } catch {
            return false;
        }
    }

    buildProxyUrl(streamUrl, headers) {
        if (!this.config.PROXY_URL || !this.config.PROXY_PASSWORD) {
            return null;
        }

        const params = new URLSearchParams({
            api_password: this.config.PROXY_PASSWORD,
            d: streamUrl
        });

        if (headers) {
            // Se ci sono header specifici, li utilizziamo direttamente
            Object.entries(headers).forEach(([key, value]) => {
                params.append(`h_${key}`, value);
            });
        }

        return `${this.config.PROXY_URL}/proxy/hls/manifest.m3u8?${params.toString()}`;
    }

    async getProxyStreams(channel) {
        const streams = [];

        if (!this.config.PROXY_URL || !this.config.PROXY_PASSWORD) {
            return streams;
        }

        try {
            const proxyUrl = this.buildProxyUrl(channel.url, channel.headers);

            const cacheKey = `${channel.name}_${proxyUrl}`;
            const lastCheck = this.lastCheck.get(cacheKey);
            const cacheValid = lastCheck && (Date.now() - lastCheck) < 5 * 60 * 1000;

            if (cacheValid && this.proxyCache.has(cacheKey)) {
                return [this.proxyCache.get(cacheKey)];
            }

            if (!await this.checkProxyHealth(proxyUrl)) {
                console.log('Proxy non attivo per:', channel.name);
                return [];
            }

            const proxyStream = {
                name: `${channel.name} (Proxy)`,
                title: `${channel.name} (Proxy HLS)`,
                url: proxyUrl,
                behaviorHints: {
                    notWebReady: false,
                    bingeGroup: "tv"
                }
            };

            this.proxyCache.set(cacheKey, proxyStream);
            this.lastCheck.set(cacheKey, Date.now());

            streams.push(proxyStream);
        } catch (error) {
            console.error('Errore proxy per il canale:', channel.name, error.message);
            console.error('URL richiesto:', proxyUrl);
            console.error('Headers:', channel.headers);
        }

        return streams;
    }
}

module.exports = HlsProxyManager;
