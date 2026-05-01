// util.js - Полная версия с автоматическим получением embed кода из Medal.tv

// Функции для YouTube
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

// Функции для Medal.tv
export function getMedalIdFromUrl(url) {
    const match = url.match(/medal\.tv\/(?:clips?|watch)\/(\d+)(?:\/[\w]+)?/);
    return match ? match[1] : '';
}

// Автоматическое получение embed кода через Medal.tv API
export async function getMedalEmbedCode(url) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) return null;
    
    try {
        // Метод 1: Используем официальное API Medal.tv
        const apiUrl = `https://medal.tv/api/clip/${clipId}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            const data = await response.json();
            
            // Из API получаем embed URL или код
            if (data.embedUrl) {
                return {
                    success: true,
                    embedUrl: data.embedUrl,
                    embedCode: `<iframe src="${data.embedUrl}" width="640" height="360" frameborder="0" allow="autoplay" allowfullscreen></iframe>`,
                    thumbnail: data.thumbnailUrl || `https://medal.tv/clip/${clipId}/thumbnail.jpg`,
                    title: data.title || 'Medal.tv Clip'
                };
            }
        }
        
        // Метод 2: Парсим страницу (если API не сработал)
        const pageResponse = await fetch(`https://medal.tv/clip/${clipId}`);
        const html = await pageResponse.text();
        
        // Ищем embed код в HTML
        const embedMatch = html.match(/<iframe[^>]+src="([^"]+)"[^>]*>/);
        if (embedMatch) {
            return {
                success: true,
                embedUrl: embedMatch[1],
                embedCode: embedMatch[0],
                thumbnail: `https://medal.tv/clip/${clipId}/thumbnail.jpg`,
                title: 'Medal.tv Clip'
            };
        }
        
        return {
            success: false,
            error: 'Embed code not found for this clip'
        };
        
    } catch (error) {
        console.error('Error fetching Medal.tv embed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Универсальная функция для получения embed кода (работает и для YouTube, и для Medal)
export async function getEmbedCode(video, options = {}) {
    if (video.includes('medal.tv')) {
        const medalResult = await getMedalEmbedCode(video);
        if (medalResult.success) {
            // Можно модифицировать embed код с параметрами
            if (Object.keys(options).length > 0) {
                const url = new URL(medalResult.embedUrl);
                Object.keys(options).forEach(key => {
                    if (options[key] !== undefined) {
                        url.searchParams.set(key, options[key] ? '1' : '0');
                    }
                });
                return `<iframe src="${url.toString()}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
            }
            return medalResult.embedCode;
        }
        return `<div class="error">Cannot embed this Medal.tv clip: ${medalResult.error}</div>`;
        
    } else if (video.includes('youtube.com') || video.includes('youtu.be')) {
        const embedUrl = embedYoutube(video);
        return `<iframe src="${embedUrl}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    
    return '<div class="error">Unsupported video URL</div>';
}

// Специальная функция для Medal.tv с кэшированием (чтобы не делать запрос каждый раз)
const medalCache = new Map();

export async function getMedalEmbedCached(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    
    // Проверяем кэш
    if (medalCache.has(clipId) && !options.forceRefresh) {
        const cached = medalCache.get(clipId);
        if (Date.now() - cached.timestamp < 3600000) { // Кэш на 1 час
            return cached.embedCode;
        }
    }
    
    // Получаем свежий embed код
    const result = await getMedalEmbedCode(url);
    
    if (result.success) {
        // Сохраняем в кэш
        medalCache.set(clipId, {
            embedCode: result.embedCode,
            timestamp: Date.now()
        });
        return result.embedCode;
    }
    
    // Fallback: показываем превью с ссылкой
    return getMedalFallbackEmbed(url, options);
}

// Fallback вариант, если embed недоступен
export function getMedalFallbackEmbed(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    const width = options.width || 640;
    const height = options.height || 360;
    
    return `
        <div style="position: relative; width: ${width}px; height: ${height}px; background: #1a1a1a; border-radius: 8px; overflow: hidden;">
            <img src="https://medal.tv/clip/${clipId}/thumbnail.jpg" 
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
    
    const embedCode = await getEmbedCode(videoUrl, options);
    container.innerHTML = embedCode;
}

// Общие функции
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

// Глобальные функции для консоли
if (typeof window !== 'undefined') {
    window.getMedalEmbedCode = getMedalEmbedCode;
    window.getEmbedCode = getEmbedCode;
    window.embedVideo = embedVideo;
    window.getMedalEmbedCached = getMedalEmbedCached;
}
