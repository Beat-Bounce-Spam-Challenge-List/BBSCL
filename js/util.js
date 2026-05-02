// util.js - Финальная рабочая версия

// ========== YOUTUBE ФУНКЦИИ ==========
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

// ========== MEDAL.TV ФУНКЦИИ (работает без iframe) ==========

export function getMedalIdFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/medal\.tv\/.+?\/clips?\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
}

// Получаем превью через API Medal.tv (работает!)
export async function getMedalThumbnail(url) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) return null;
    
    try {
        // Пытаемся получить через API
        const response = await fetch(`https://api.gomedal.com/clip/${clipId}`);
        if (response.ok) {
            const data = await response.json();
            return data.contentThumbnail || `https://cdn.medal.tv/ugcc/content-thumbnail/${clipId}.jpg`;
        }
    } catch(e) {
        console.log('API недоступен, используем fallback');
    }
    
    // Fallback
    return `https://cdn.medal.tv/ugcc/content-thumbnail/${clipId}.jpg`;
}

// Возвращает HTML карточку для Medal.tv (без iframe!)
export async function getMedalCard(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    const width = options.width || 640;
    
    if (!clipId) {
        return `<a href="${url}" target="_blank" style="color: #5865F2;">Смотреть на Medal.tv</a>`;
    }
    
    const thumbnail = await getMedalThumbnail(url);
    
    return `
        <div style="max-width: ${width}px; border-radius: 12px; overflow: hidden; 
                    background: #1e1f22; font-family: system-ui, Arial, sans-serif;">
            <a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
                <img src="${thumbnail}" alt="Medal.tv preview" 
                     style="width: 100%; display: block;"
                     onerror="this.src='https://placehold.co/${width}x360/2c2f33/fff?text=Medal.tv'">
                <div style="padding: 12px; background: #2b2d31; color: white; text-align: center;">
                    🎮 Нажмите для просмотра на Medal.tv →
                </div>
            </a>
        </div>
    `;
}

// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ
export async function getVideoHtml(url, options = {}) {
    // Medal.tv - карточка с превью и ссылкой
    if (url && url.includes('medal.tv')) {
        return await getMedalCard(url, options);
    }
    
    // YouTube - iframe плеер
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        const embedUrl = embed(url);
        const width = options.width || 640;
        const height = options.height || 360;
        return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px;"></iframe>`;
    }
    
    return `<div style="color: red;">❌ Неподдерживаемый формат видео</div>`;
}
