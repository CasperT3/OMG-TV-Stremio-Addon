const config = {
    // Server configuration
    port: process.env.PORT || 10000,
    
    // Content sources
    M3U_URL: 'https://raw.githubusercontent.com/mccoy88f/OMG-TV-Stremio-Addon/refs/heads/beta/link.playlist', // URL del file con le playlist M3U
    EPG_URL: process.env.EPG_URL || 'https://raw.githubusercontent.com/mccoy88f/OMG-TV-Stremio-Addon/refs/heads/beta/link.epg', // URL del file con gli EPG
    
    // Feature flags
    enableEPG: true, // EPG attivo di default
    
    // Proxy configuration
    PROXY_URL: process.env.PROXY_URL || null,
    PROXY_PASSWORD: process.env.PROXY_PASSWORD || null,
    FORCE_PROXY: process.env.FORCE_PROXY === 'yes',
    
    // Cache settings
    cacheSettings: {
        updateInterval: 12 * 60 * 60 * 1000, // 12 ore
        maxAge: 24 * 60 * 60 * 1000, // 24 ore
        retryAttempts: 3,
        retryDelay: 5000 // 5 secondi
    },
    
    // EPG settings
    epgSettings: {
        maxProgramsPerChannel: 50,
        updateInterval: 12 * 60 * 60 * 1000, // 12 ore
        cacheExpiry: 24 * 60 * 60 * 1000 // 24 ore
    },
    
    // Manifest configuration
    manifest: {
        id: 'org.mccoy88f.omgtv',
        version: '1.6.0', // Aggiornato alla versione 1.6.0
        name: 'OMG TV',
        description: 'Un add-on per Stremio con playlist di canali M3U predefinita, senza personalizzazione.',
        logo: 'https://github.com/mccoy88f/OMG-TV-Stremio-Addon/blob/main/tv.png?raw=true',
        resources: ['stream', 'catalog', 'meta'],
        types: ['tv'],
        idPrefixes: ['tv'],
        catalogs: [
            {
                type: 'tv',
                id: 'omg_tv',
                name: 'OMG TV',
                extra: [
                    {
                        name: 'genre',
                        isRequired: false,
                        options: [] // Lasciamo vuoto l'array dei generi
                    },
                    {
                        name: 'search',
                        isRequired: false
                    },
                    {
                        name: 'skip',
                        isRequired: false
                    }
                ]
            }
        ]
    }
};

// Funzione per aggiornare l'URL dell'EPG
config.updateEPGUrl = function(url) {
    if (!this.EPG_URL && url) {  // Aggiorna solo se non è già impostato tramite variabili d'ambiente
        this.EPG_URL = url;
    }
};

module.exports = config;
