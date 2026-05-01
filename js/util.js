// util.js - Полная версия с поддержкой API ключа Medal.tv и обратной совместимостью

// ========== НАСТРОЙКИ ==========
// Сюда вставьте ваш API ключ от Medal.tv (если есть)
// Получить можно здесь: https://medal.tv/developer
const MEDAL_API_KEY = 'pub_V4KfwqZJyOK5FtQRDgIKjtnmcOGU9Lh4'; // Вставьте ваш API ключ сюда

// ========== Функции для YouTube ==========
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embedYoutube(video) {
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

export function getYoutubeThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function getThumbnailFromId(id) {
    return getYoutubeThumbnailFromId(id);
}

// ========== Функции для Medal.tv ==========
export function getMedalIdFromUrl(url) {
    const match = url.match(/medal\.tv\/(?:clips?|watch)\/(\d+)(?:\/[\w]+)?/);
    return match ? match[1] : '';
}

export function getMedalThumbnailFromId(id) {
    return `https://medal.tv/clip/${id}/thumbnail.jpg`;
}

// Получение embed кода через API Medal.tv с поддержкой API ключа
export async function getMedalEmbedCode(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) return { success: false, error: 'Invalid Medal.tv URL' };
    
    try {
        // Подготавливаем заголовки
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Добавляем API ключ, если он предоставлен
        const apiKey = options.apiKey || MEDAL_API_KEY;
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        
        // Метод 1: Пробуем официальное API Medal.tv
        const apiUrl = `https://medal.tv/api/clip/${clipId}`;
        const response = await fetch(apiUrl, { headers });
        
        if (response.ok) {
            const data = await response.json();
            
            // Из API получаем embed URL
            if (data.embedUrl || data.embed_code) {
                const embedUrl = data.embedUrl || data.embed_code;
                return {
                    success: true,
                    embedUrl: embedUrl,
                    embedCode: `<iframe src="${embedUrl}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="autoplay" allowfullscreen></iframe>`,
                    thumbnail: data.thumbnailUrl || getMedalThumbnailFromId(clipId),
                    title: data.title || 'Medal.tv Clip'
                };
            }
        }
        
        // Метод 2: Парсим страницу (fallback)
        const pageResponse = await fetch(`https://medal.tv/clip/${clipId}`);
        const html = await pageResponse.text();
        
        // Ищем embed код в HTML
        const embedMatch = html.match(/<iframe[^>]+src="([^"]+)"[^>]*>/);
        if (embedMatch) {
            return {
                success: true,
                embedUrl: embedMatch[1],
                embedCode: embedMatch[0],
                thumbnail: getMedalThumbnailFromId(clipId),
                title: 'Medal.tv Clip'
            };
        }
        
        return {
            success: false,
            error: 'Embed code not found for this clip. The clip owner may have disabled embedding.'
        };
        
    } catch (error) {
        console.error('Error fetching Medal.tv embed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ========== УНИВЕРСАЛЬНАЯ ФУНКЦИЯ embed (для обратной совместимости) ==========
// ЭТО ТО, ЧТО ВАМ НУЖНО - функция embed работает и для YouTube, и для Medal
export async function embed(video, options = {}) {
    // Для Medal.tv
    if (video.includes('medal.tv')) {
        const result = await getMedalEmbedCode(video, options);
        if (result.success) {
            // Если переданы параметры autoplay/muted/loop, добавляем их
            if (options.autoplay !== undefined || options.muted !== undefined || options.loop !== undefined) {
                const url = new URL(result.embedUrl);
                if (options.autoplay !== undefined) url.searchParams.set('autoplay', options.autoplay ? '1' : '0');
                if (options.muted !== undefined) url.searchParams.set('muted', options.muted ? '1' : '0');
                if (options.loop !== undefined) url.searchParams.set('loop', options.loop ? '1' : '0');
                return url.toString();
            }
            return result.embedUrl;
        }
        console.warn('Medal.tv embed failed:', result.error);
        return '';
    }
    
    // Для YouTube
    if (video.includes('youtube.com') || video.includes('youtu.be')) {
        return embedYoutube(video);
    }
    
    return '';
}

// Получение полного HTML кода для вставки
export async function getEmbedHTML(video, options = {}) {
    if (video.includes('medal.tv')) {
        const result = await getMedalEmbedCode(video, options);
        if (result.success) {
            // Модифицируем embed код с параметрами
            let embedCode = result.embedCode;
            if (options.autoplay !== undefined || options.muted !== undefined || options.loop !== undefined) {
                const url = new URL(result.embedUrl);
                if (options.autoplay !== undefined) url.searchParams.set('autoplay', options.autoplay ? '1' : '0');
                if (options.muted !== undefined) url.searchParams.set('muted', options.muted ? '1' : '0');
                if (options.loop !== undefined) url.searchParams.set('loop', options.loop ? '1' : '0');
                embedCode = `<iframe src="${url.toString()}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
            }
            return embedCode;
        }
        return getMedalFallbackEmbed(video, options);
    }
    
    if (video.includes('youtube.com') || video.includes('youtu.be')) {
        const embedUrl = embedYoutube(video);
        return `<iframe src="${embedUrl}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    
    return '<div class="error">Unsupported video URL</div>';
}

// Fallback вариант, если embed недоступен
export function getMedalFallbackEmbed(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    const width = options.width || 640;
    const height = options.height || 360;
    
    return `
        <div style="position: relative; width: ${width}px; height: ${height}px; background: #1a1a1a; border-radius: 8px; overflow: hidden;">
            <img src="${getMedalThumbnailFromId(clipId)}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 alt="Video preview">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6);">
                <a href="${url}" target="_blank" rel="noopener noreferrer" 
                   style="background: #ff4757; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; font-family: Arial, sans-serif;
                          font-weight: bold; font-size: 16px; transition: transform 0.2s;
                          display: inline-flex; align-items: center; gap: 8px;">
                    <span>▶</span> Watch on Medal.tv
                </a>
            </div>
        </div>
    `;
}

// Простая функция для вставки на страницу
export async function embedVideo(elementId, videoUrl, options = {}) {
    const container = document.getElementById(elementId);
    if (!container) {
        console.error(`Element with id "${elementId}" not found`);
        return;
    }
    
    const embedCode = await getEmbedHTML(videoUrl, options);
    container.innerHTML = embedCode;
}

// Кэширование для Medal.tv
const medalCache = new Map();

export async function getMedalEmbedCached(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    
    if (medalCache.has(clipId) && !options.forceRefresh) {
        const cached = medalCache.get(clipId);
        if (Date.now() - cached.timestamp < 3600000) {
            return cached.embedCode;
        }
    }
    
    const result = await getMedalEmbedCode(url, options);
    
    if (result.success) {
        medalCache.set(clipId, {
            embedCode: result.embedCode,
            timestamp: Date.now()
        });
        return result.embedCode;
    }
    
    return getMedalFallbackEmbed(url, options);
}

// ========== Общие функции ==========
export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}

// ========== Глобальные функции для консоли ==========
if (typeof window !== 'undefined') {
    window.embed = embed;
    window.getEmbedHTML = getEmbedHTML;
    window.embedVideo = embedVideo;
    window.getMedalEmbedCode = getMedalEmbedCode;
    window.getMedalEmbedCached = getMedalEmbedCached;
}
