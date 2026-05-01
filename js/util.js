// ========== YOUTUBE ==========
// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Синхронная версия для YouTube (если не нужна поддержка Medal)
export function embedSync(video) {
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

// ========== MEDAL.TV ==========
export function getMedalIdFromUrl(url) {
    const match = url.match(/medal\.tv\/clips\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

// Получаем прямые ссылки на видео и превью через API Medal (с CORS-прокси)
export async function getMedalData(clipId) {
    const apiUrl = `https://medal.tv/api/clip/${clipId}`;
    // Используем публичный CORS-прокси (для продакшена лучше поставить свой)
    const proxy = 'https://corsproxy.io/?';
    const response = await fetch(proxy + encodeURIComponent(apiUrl));
    if (!response.ok) throw new Error(`Medal API error: ${response.status}`);
    const data = await response.json();
    return {
        videoUrl: data.contentUrl,
        thumbnail: data.thumbnailUrl || `https://medal.tv/logo.png`,
    };
}

// Генерирует HTML для встраивания Medal-клипа
export function embedMedal(videoUrl, thumbnailUrl) {
    return `<video src="${videoUrl}" controls poster="${thumbnailUrl}" style="width:100%; max-width:800px; border-radius:12px;"></video>`;
}

// Асинхронная универсальная функция: возвращает HTML для YouTube или Medal
export async function embed(url) {
    // Проверяем Medal
    const medalId = getMedalIdFromUrl(url);
    if (medalId) {
        try {
            const { videoUrl, thumbnail } = await getMedalData(medalId);
            return embedMedal(videoUrl, thumbnail);
        } catch (err) {
            console.error('Medal error:', err);
            return `<p>Не удалось загрузить клип Medal. <a href="${url}" target="_blank">Открыть оригинал</a></p>`;
        }
    }
    // Иначе YouTube
    const youtubeId = getYoutubeIdFromUrl(url);
    if (youtubeId) {
        return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
    }
    return `<p>Неизвестный формат ссылки</p>`;
}

// ========== ОСТАЛЬНЫЕ ТВОИ ФУНКЦИИ (не меняются) ==========
export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
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
