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

// Синхронная версия embed для Medal.tv (возвращает fallback URL)
export function embedMedal(clip, options = {}) {
    const clipId = getMedalIdFromUrl(clip);
    if (!clipId) return '';
    
    const params = new URLSearchParams();
    params.set('autoplay', options.autoplay !== undefined ? (options.autoplay ? '1' : '0') : '1');
    params.set('muted', options.muted !== undefined ? (options.muted ? '1' : '0') : '1');
    params.set('loop', options.loop !== undefined ? (options.loop ? '1' : '0') : '1');
    
    const queryString = params.toString();
    return `https://medal.tv/clip/${clipId}${queryString ? `?${queryString}` : ''}`;
}

// Асинхронное получение embed кода через Medal.tv API
export async function getMedalEmbedCode(url) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) return null;
    
    try {
        const apiUrl = `https://medal.tv/api/clip/${clipId}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            const data = await response.json();
            
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

// ОСНОВНАЯ ФУНКЦИЯ embed (синхронная, для совместимости)
export function embed(video, options = {}) {
    if (video.includes('medal.tv')) {
        console.warn('Medal.tv: Используется fallback URL. Для embed кода используйте embedAsync()');
        return embedMedal(video, options);
    } else if (video.includes('youtube.com') || video.includes('youtu.be')) {
        return embedYoutube(video);
    }
    return '';
}

// Асинхронная версия embed (рекомендуется для Medal.tv)
export async function embedAsync(video, options = {}) {
    if (video.includes('medal.tv')) {
        const result = await getMedalEmbedCode(video);
        if (result.success) {
            if (Object.keys(options).length > 0) {
                const url = new URL(result.embedUrl);
                Object.keys(options).forEach(key => {
                    if (options[key] !== undefined) {
                        url.searchParams.set(key, options[key] ? '1' : '0');
                    }
                });
                return url.toString();
            }
            return result.embedUrl;
        }
        return embedMedal(video, options);
    } else if (video.includes('youtube.com') || video.includes('youtu.be')) {
        return embedYoutube(video);
    }
    return '';
}

// Универсальная функция для получения полного embed HTML кода
export async function getEmbedCode(video, options = {}) {
    if (video.includes('medal.tv')) {
        const medalResult = await getMedalEmbedCode(video);
        if (medalResult.success) {
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
        // Fallback если embed недоступен
        const fallbackUrl = embedMedal(video, options);
        return `<div style="position: relative; width: ${options.width || 640}px; height: ${options.height || 360}px; background: #1a1a1a; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <a href="${fallbackUrl}" target="_blank" rel="noopener noreferrer" 
               style="background: #ff4757; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                ▶ Watch on Medal.tv
            </a>
        </div>`;
        
    } else if (video.includes('youtube.com') || video.includes('youtu.be')) {
        const embedUrl = embedYoutube(video);
        return `<iframe src="${embedUrl}" width="${options.width || 640}" height="${options.height || 360}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    
    return '<div class="error">Unsupported video URL</div>';
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
    window.embed = embed;
    window.embedAsync = embedAsync;
    window.getMedalEmbedCode = getMedalEmbedCode;
    window.getEmbedCode = getEmbedCode;
    window.embedVideo = embedVideo;
    window.embedMedal = embedMedal;
    window.embedYoutube = embedYoutube;
}
