// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Извлечение ID клипа Medal.tv из URL
export function getMedalIdFromUrl(url) {
    // Поддерживает форматы:
    // https://medal.tv/clips/abc123
    // https://medal.tv/games/.../clips/abc123
    // https://medal.tv/fr/clips/abc123
    const match = url.match(/medal\.tv\/(?:[a-z]{2}\/)?clips\/([a-zA-Z0-9_-]+)/i);
    return match?.[1] ?? '';
}

// Получение прямого MP4-адреса видео с Medal.tv через их API
export async function getMedalDirectUrl(clipId) {
    try {
        // Публичный API Medal (не требует токена)
        const response = await fetch(`https://api.medal.tv/v1/clip/${clipId}`);
        if (!response.ok) {
            throw new Error(`Medal API error: ${response.status}`);
        }
        const data = await response.json();
        // Поле contentUrl — прямая ссылка на видео (mp4)
        if (data.contentUrl) {
            return data.contentUrl;
        }
        throw new Error('No video URL found in Medal response');
    } catch (error) {
        console.error('Failed to fetch Medal video:', error);
        return null;
    }
}

// Основная функция: определяет тип ссылки и возвращает URL для встраивания
// Асинхронная, т.к. Medal требует запроса к API
export async function resolveVideoUrl(videoUrl) {
    const youtubeId = getYoutubeIdFromUrl(videoUrl);
    if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}`;
    }

    const medalId = getMedalIdFromUrl(videoUrl);
    if (medalId) {
        const directUrl = await getMedalDirectUrl(medalId);
        return directUrl; // Прямой MP4 (можно использовать в <video>)
    }

    // Если ссылка не распознана
    return null;
}

// Для обратной совместимости с твоим старым кодом (синхронный вариант)
// НЕ используй с Medal — он вернёт некорректный результат для Medal.
export function embed(video) {
    const youtubeId = getYoutubeIdFromUrl(video);
    if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}`;
    }
    // Для Medal вернёт null (лучше использовать resolveVideoUrl)
    return null;
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// Получение превью для Medal (можно использовать, если нужно)
export async function getMedalThumbnailUrl(clipId) {
    try {
        const response = await fetch(`https://api.medal.tv/v1/clip/${clipId}`);
        const data = await response.json();
        return data.thumbnailUrl || data.coverUrl || null;
    } catch {
        return null;
    }
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
