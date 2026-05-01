// ==================== YouTube ====================
export function getYoutubeIdFromUrl(url) {
    return url.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)?.[1] ?? '';
}

// ==================== Medal.tv ====================
export function getMedalIdFromUrl(url) {
    const match = url.match(/medal\.tv\/(?:[a-z]{2}\/)?clips\/([a-zA-Z0-9_-]+)/i);
    return match?.[1] ?? '';
}

export async function getMediaDirectUrl(clipId) {
    try {
        const response = await fetch(`https://api.medal.tv/v1/clip/${clipId}`);
        if (!response.ok) throw new Error(`Medal API error: ${response.status}`);
        const data = await response.json();
        return data.contentUrl || null;
    } catch (error) {
        console.error('Medal fetch failed:', error);
        return null;
    }
}

// ==================== ГЛАВНАЯ ФУНКЦИЯ ДЛЯ ВСТАВКИ ====================
// Возвращает готовый HTML для вставки на страницу
export async function getVideoEmbedHtml(url) {
    // YouTube
    const ytId = getYoutubeIdFromUrl(url);
    if (ytId) {
        return `<iframe 
            src="https://www.youtube.com/embed/${ytId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="width:100%; aspect-ratio:16/9;">
        </iframe>`;
    }

    // Medal.tv
    const medalId = getMedalIdFromUrl(url);
    if (medalId) {
        const directUrl = await getMediaDirectUrl(medalId);
        if (directUrl) {
            return `<video 
                src="${directUrl}" 
                controls 
                style="width:100%; aspect-ratio:16/9; background:#000;"
                playsinline
            ></video>`;
        } else {
            return `<div style="color:red;">Не удалось загрузить видео с Medal.tv</div>`;
        }
    }

    // Неподдерживаемая ссылка
    return `<div style="color:orange;">Неподдерживаемый тип ссылки</div>`;
}

// ==================== СТАРАЯ ФУНКЦИЯ (только для YouTube, не используй с Medal) ====================
// Оставлена для совместимости, но для Medal выдаст null
export function embed(video) {
    const ytId = getYoutubeIdFromUrl(video);
    return ytId ? `https://www.youtube.com/embed/${ytId}` : null;
}

// ==================== ОСТАЛЬНЫЕ ТВОИ ФУНКЦИИ ====================
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
