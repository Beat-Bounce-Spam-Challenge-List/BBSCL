// ========== СУЩЕСТВУЮЩИЕ ФУНКЦИИ ==========
export function getYoutubeIdFromUrl(url) {
    return url.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)?.[1] ?? '';
}

export function getMedalIdFromUrl(url) {
    const patterns = [
        /medal\.tv\/clips\/([^\/\?#]+)/,
        /medal\.tv\/[^\/]+\/clips\/([^\/\?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return '';
}

export function getVideoType(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('medal.tv')) return 'medal';
    return 'unknown';
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// ========== НОВЫЕ ФУНКЦИИ ДЛЯ MEDAL.TV ==========

// Получение прямого MP4 URL через API
export async function getDirectMedalUrl(medalId) {
    try {
        const response = await fetch(`https://api.medal.tv/clip/${medalId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.unbrandedFileUrl || data.rawFileUrl || null;
    } catch (error) {
        console.error('Failed to get direct URL:', error);
        return null;
    }
}

// Создание HTML для встраивания (выбирает лучший метод автоматически)
export async function createVideoEmbed(videoUrl) {
    const type = getVideoType(videoUrl);
    
    if (type === 'youtube') {
        const id = getYoutubeIdFromUrl(videoUrl);
        return `<iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen style="width:100%; aspect-ratio:16/9;"></iframe>`;
    }
    
    if (type === 'medal') {
        const id = getMedalIdFromUrl(videoUrl);
        const directUrl = await getDirectMedalUrl(id);
        
        if (directUrl) {
            return `<video controls style="width:100%; max-width:800px; border-radius:8px;">
                        <source src="${directUrl}" type="video/mp4">
                        Ваш браузер не поддерживает видео
                    </video>`;
        }
        
        // Если не удалось получить прямой URL, предлагаем открыть в новом окне
        return `<div style="padding:20px; background:#f0f0f0; border-radius:8px; text-align:center;">
                    <p>⚠️ Видео не может быть встроено из-за ограничений безопасности.</p>
                    <a href="https://medal.tv/clips/${id}" target="_blank" rel="noopener noreferrer">
                        🔗 Открыть видео в Medal.tv
                    </a>
                </div>`;
    }
    
    return '<p>❌ Неподдерживаемый формат видео</p>';
}

// Асинхронная версия embed (заменяет старую синхронную)
export async function embed(video) {
    const type = getVideoType(video);
    
    if (type === 'youtube') {
        return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
    }
    
    if (type === 'medal') {
        const medalId = getMedalIdFromUrl(video);
        const directUrl = await getDirectMedalUrl(medalId);
        // Возвращаем объект с информацией, а не просто URL
        return { type: 'medal', directUrl, embedUrl: null, requiresPopup: !directUrl };
    }
    
    return '';
}

// Функция для открытия в новом окне (обход ограничений)
export function openMedalInNewWindow(videoUrl) {
    const medalId = getMedalIdFromUrl(videoUrl);
    if (medalId) {
        window.open(`https://medal.tv/clips/${medalId}`, '_blank', 'noopener,noreferrer');
    }
}
