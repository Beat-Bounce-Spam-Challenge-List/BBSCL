// util.js - Исправленная версия с защитой от самовставки

// Настройки
const MEDAL_API_KEY = ''; // Оставьте пустым, ключ не нужен

// Функции для YouTube
export function getYoutubeIdFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    );
    return match?.[1] ?? '';
}

export function embedYoutube(video) {
    const id = getYoutubeIdFromUrl(video);
    if (!id) return '';
    return `https://www.youtube.com/embed/${id}`;
}

export function getYoutubeThumbnailFromId(id) {
    if (!id) return '';
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function getThumbnailFromId(id) {
    return getYoutubeThumbnailFromId(id);
}

// Функции для Medal.tv
export function getMedalIdFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/medal\.tv\/(?:clip|clips|watch)\/(\d+)/);
    return match ? match[1] : '';
}

export function getMedalThumbnailFromId(id) {
    if (!id) return '';
    return `https://medal.tv/clip/${id}/thumbnail.jpg`;
}

// Проверка, является ли URL валидным для вставки
export function isValidEmbedUrl(url) {
    if (!url || typeof url !== 'string') return false;
    // Защита от вставки текущей страницы
    if (url === '' || url === window.location.href) return false;
    if (url.includes('bbscl.pages.dev')) return false;
    return true;
}

// Получение embed кода через API Medal.tv (без ключа)
export async function getMedalEmbedCode(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) return { success: false, error: 'Invalid Medal.tv URL' };
    
    try {
        // Пробуем получить embed URL из страницы
        const pageResponse = await fetch(`https://medal.tv/clip/${clipId}`);
        const html = await pageResponse.text();
        
        // Ищем embed код в HTML
        const embedMatch = html.match(/<iframe[^>]+src="(https:\/\/medal\.tv\/embed\/[^"]+)"[^>]*>/);
        if (embedMatch && embedMatch[1]) {
            let embedUrl = embedMatch[1];
            
            // Добавляем параметры если нужно
            if (options.autoplay !== undefined || options.muted !== undefined || options.loop !== undefined) {
                const urlParams = new URLSearchParams();
                if (options.autoplay !== undefined) urlParams.set('autoplay', options.autoplay ? '1' : '0');
                if (options.muted !== undefined) urlParams.set('muted', options.muted ? '1' : '0');
                if (options.loop !== undefined) urlParams.set('loop', options.loop ? '1' : '0');
                const queryString = urlParams.toString();
                embedUrl = embedUrl.split('?')[0] + (queryString ? `?${queryString}` : '');
            }
            
            return {
                success: true,
                embedUrl: embedUrl,
                embedCode: `<iframe src="${embedUrl}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="autoplay" allowfullscreen></iframe>`,
                thumbnail: getMedalThumbnailFromId(clipId),
                title: 'Medal.tv Clip'
            };
        }
        
        return {
            success: false,
            error: 'Embed code not found - clip owner may have disabled embedding'
        };
        
    } catch (error) {
        console.error('Error fetching Medal.tv embed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ОСНОВНАЯ ФУНКЦИЯ embed - возвращает URL для вставки
export async function embed(video, options = {}) {
    if (!video || typeof video !== 'string') {
        console.warn('embed: Invalid video URL');
        return '';
    }
    
    // Для Medal.tv
    if (video.includes('medal.tv')) {
        const result = await getMedalEmbedCode(video, options);
        if (result.success && result.embedUrl) {
            // Проверяем, что URL валидный и не ссылается на текущую страницу
            if (isValidEmbedUrl(result.embedUrl)) {
                return result.embedUrl;
            }
        }
        console.warn('Medal.tv embed failed:', result.error);
        return '';
    }
    
    // Для YouTube
    if (video.includes('youtube.com') || video.includes('youtu.be')) {
        const embedUrl = embedYoutube(video);
        if (embedUrl && isValidEmbedUrl(embedUrl)) {
            return embedUrl;
        }
        return '';
    }
    
    console.warn('Unsupported video URL:', video);
    return '';
}

// Получение полного HTML кода для вставки
export async function getEmbedHTML(video, options = {}) {
    if (!video || typeof video !== 'string') {
        return '<div class="error">Invalid video URL</div>';
    }
    
    // Для Medal.tv
    if (video.includes('medal.tv')) {
        const result = await getMedalEmbedCode(video, options);
        if (result.success && result.embedCode) {
            return result.embedCode;
        }
        return getMedalFallbackEmbed(video, options);
    }
    
    // Для YouTube
    if (video.includes('youtube.com') || video.includes('youtu.be')) {
        const embedUrl = embedYoutube(video);
        if (embedUrl && isValidEmbedUrl(embedUrl)) {
            return `<iframe src="${embedUrl}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
        return '<div class="error">Invalid YouTube URL</div>';
    }
    
    return '<div class="error">Unsupported video URL</div>';
}

// Fallback вариант, если embed недоступен
export function getMedalFallbackEmbed(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) {
        return '<div class="error">Invalid Medal.tv URL</div>';
    }
    
    const width = options.width || 640;
    const height = options.height || 360;
    
    return `
        <div style="position: relative; width: ${width}px; height: ${height}px; background: #1a1a1a; border-radius: 8px; overflow: hidden; max-width: 100%;">
            <img src="${getMedalThumbnailFromId(clipId)}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 alt="Video preview"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23fff\\' x=\\'50\\' y=\\'50\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3ENo preview%3C/text%3E%3C/svg%3E'">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6);">
                <a href="${url}" target="_blank" rel="noopener noreferrer" 
                   style="background: #ff4757; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; font-family: Arial, sans-serif;
                          font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; gap: 8px;">
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
        return false;
    }
    
    const embedCode = await getEmbedHTML(videoUrl, options);
    container.innerHTML = embedCode;
    return true;
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
    window.embed = embed;
    window.getEmbedHTML = getEmbedHTML;
    window.embedVideo = embedVideo;
}
