// util.js - Рабочая версия с API Medal.tv

// ========== YOUTUBE ФУНКЦИИ (без изменений) ==========
// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
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

// ========== MEDAL.TV API ФУНКЦИИ (БЕЗ КЛЮЧА!) ==========

// Извлекает ID клипа из URL Medal.tv
export function getMedalIdFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/medal\.tv\/clips?\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
}

// Получает данные клипа через API Medal.tv (публичный эндпоинт, ключ не нужен!)
export async function getMedalClipData(url) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) {
        return { success: false, error: 'Неверный ID клипа' };
    }
    
    try {
        // Используем публичный API эндпоинт (не требует ключа!)
        const apiUrl = `https://api.gomedal.com/clip/${clipId}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API вернул статус: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            success: true,
            clipId: data.contentId || clipId,
            title: data.contentTitle || 'Medal.tv Clip',
            thumbnail: data.contentThumbnail || `https://cdn.medal.tv/ugcc/content-thumbnail/${clipId}.jpg`,
            views: data.contentViews || 0,
            likes: data.contentLikes || 0,
            duration: data.videoLengthSeconds || 0,
            directUrl: data.directClipUrl || url,
            embedCode: data.embedIframeCode || '',
            rawVideoUrl: data.rawFileUrl || null
        };
    } catch (error) {
        console.error('Ошибка получения данных Medal.tv:', error);
        return { success: false, error: error.message };
    }
}

// Получает популярные клипы из категории (без ключа!)
export async function getTrendingMedalClips(categoryId = null, limit = 10) {
    try {
        let apiUrl = `https://api.gomedal.com/botclips?limit=${limit}`;
        if (categoryId) {
            apiUrl += `&categoryId=${categoryId}`;
        }
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        
        const data = await response.json();
        return { success: true, clips: data };
    } catch (error) {
        console.error('Ошибка получения трендовых клипов:', error);
        return { success: false, error: error.message };
    }
}

// Создаёт красивую карточку для вставки на сайт
export async function getMedalEmbedCard(url, options = {}) {
    const data = await getMedalClipData(url);
    const width = options.width || 640;
    
    if (!data.success) {
        // Fallback - простая ссылка
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" 
                    style="display: inline-block; background: #5865F2; color: white; 
                           padding: 12px 24px; border-radius: 8px; text-decoration: none;
                           font-family: system-ui, Arial, sans-serif;">
                    🎮 Смотреть на Medal.tv
                </a>`;
    }
    
    // Форматируем просмотры
    const views = data.views >= 1000 ? `${(data.views / 1000).toFixed(1)}K` : data.views;
    
    return `
        <div style="max-width: ${width}px; border-radius: 12px; overflow: hidden; 
                    background: #1e1f22; border: 1px solid #2b2d31; 
                    font-family: system-ui, -apple-system, Arial, sans-serif;">
            <a href="${data.directUrl}" target="_blank" rel="noopener noreferrer" 
               style="text-decoration: none; display: block;">
                <div style="position: relative;">
                    <img src="${data.thumbnail}" alt="${escapeHtml(data.title)}"
                         style="width: 100%; height: auto; display: block;"
                         onerror="this.src='https://placehold.co/${width}x360/2c2f33/fff?text=Medal.tv'">
                    <!-- Плей-кнопка -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                width: 60px; height: 60px; background: rgba(0,0,0,0.7); 
                                border-radius: 50%; display: flex; align-items: center; 
                                justify-content: center; border: 2px solid white;">
                        <span style="color: white; font-size: 24px; margin-left: 4px;">▶</span>
                    </div>
                    <!-- Длительность видео -->
                    ${data.duration > 0 ? `
                    <div style="position: absolute; bottom: 12px; right: 12px;
                                background: rgba(0,0,0,0.75); padding: 4px 8px;
                                border-radius: 6px; font-size: 12px; color: white;">
                        ${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}
                    </div>
                    ` : ''}
                </div>
                <div style="padding: 14px;">
                    <div style="color: #fff; font-weight: 600; font-size: 16px; margin-bottom: 8px;">
                        ${escapeHtml(data.title)}
                    </div>
                    <div style="color: #b5bac1; font-size: 13px; display: flex; gap: 16px;">
                        <span>👁️ ${views} просмотров</span>
                        <span>❤️ ${data.likes || 0} лайков</span>
                        <span>🎮 Medal.tv</span>
                    </div>
                </div>
            </a>
        </div>
    `;
}

// Универсальная функция - определяет тип видео и возвращает HTML
export async function getVideoEmbed(url, options = {}) {
    // Medal.tv через API
    if (url.includes('medal.tv')) {
        return await getMedalEmbedCard(url, options);
    }
    
    // YouTube - iframe
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = embed(url);
        const width = options.width || 640;
        const height = options.height || 360;
        return `<iframe src="${embedUrl}" width="100%" style="max-width: ${width}px; aspect-ratio: 16/9; border-radius: 12px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    
    return `<div style="background: #1e1f22; color: #fff; padding: 40px; text-align: center; border-radius: 12px;">
                ❌ Неподдерживаемый формат видео
            </div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
