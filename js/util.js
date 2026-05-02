// util.js - Полностью рабочий код с Medal.tv

// ========== YOUTUBE ФУНКЦИИ ==========
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

// ========== MEDAL.TV ФУНКЦИИ ==========

// Извлекаем ID клипа из любой ссылки Medal.tv
export function getMedalIdFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/medal\.tv\/.+?\/clip(?:\w*)\/([a-zA-Z0-9]+)/);
    const altMatch = url.match(/medal\.tv\/clip(?:\w*)\/([a-zA-Z0-9]+)/);
    return match ? match[1] : (altMatch ? altMatch[1] : '');
}

// Преобразует любую ссылку Medal.tv в embed URL (как в скопированном коде)
export function getMedalEmbedUrl(url) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) return '';
    return `https://medal.tv/embed/${clipId}`;
}

// Возвращает полный HTML код для Medal.tv
export function getMedalEmbedHtml(url, width = 640, height = 360) {
    const embedUrl = getMedalEmbedUrl(url);
    if (!embedUrl) return '';
    return `<iframe width='${width}' height='${height}' style='border: none;' src='${embedUrl}' allow='autoplay' allowfullscreen></iframe>`;
}

// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ embed - работает и для YouTube, и для Medal!
export function getEmbedHtml(url, width = 640, height = 360) {
    // Medal.tv
    if (url && url.includes('medal.tv')) {
        return getMedalEmbedHtml(url, width, height);
    }
    
    // YouTube
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        const embedUrl = embed(url);
        if (!embedUrl) return '';
        return `<iframe width='${width}' height='${height}' src='${embedUrl}' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>`;
    }
    
    return '';
}
