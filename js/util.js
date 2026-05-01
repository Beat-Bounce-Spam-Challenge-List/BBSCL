// Функции для YouTube
// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
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

// Функции для Medal.tv
export function getMedalIdFromUrl(url) {
    // Поддерживает форматы:
    // https://medal.tv/clip/4954893 или https://medal.tv/clip/4954893/vpkPnOp0o
    const match = url.match(/medal\.tv\/clip\/(\d+)(?:\/[\w]+)?/);
    return match ? match[1] : '';
}

export function embedMedal(clip, options = {}) {
    const clipId = getMedalIdFromUrl(clip);
    if (!clipId) return '';
    
    // Настройки по умолчанию (как в документации Medal)
    const params = new URLSearchParams();
    params.set('autoplay', options.autoplay !== undefined ? (options.autoplay ? '1' : '0') : '1');
    params.set('muted', options.muted !== undefined ? (options.muted ? '1' : '0') : '1');
    params.set('loop', options.loop !== undefined ? (options.loop ? '1' : '0') : '1');
    
    if (options.steamappid) params.set('steamappid', options.steamappid);
    if (options.cta !== undefined) params.set('cta', options.cta ? '1' : '0');
    if (options.donate !== undefined) params.set('donate', options.donate ? '1' : '0');
    
    const queryString = params.toString();
    return `https://medal.tv/clip/${clipId}${queryString ? `?${queryString}` : ''}`;
}

export function getMedalThumbnailFromId(id) {
    // Medal предоставляет превью через свой API
    return `https://medal.tv/clip/${id}/thumbnail.jpg`;
}

// Общие вспомогательные функции
export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

// Универсальная функция, которая определяет тип видео по URL
export function embed(video, options = {}) {
    if (video.includes('medal.tv')) {
        return embedMedal(video, options);
    } else if (video.includes('youtube.com') || video.includes('youtu.be')) {
        return embedYoutube(video);
    }
    return '';
}

// Универсальная функция для получения превью
export function getThumbnailFromUrl(video) {
    if (video.includes('medal.tv')) {
        const id = getMedalIdFromUrl(video);
        return id ? getMedalThumbnailFromId(id) : '';
    } else if (video.includes('youtube.com') || video.includes('youtu.be')) {
        const id = getYoutubeIdFromUrl(video);
        return id ? getYoutubeThumbnailFromId(id) : '';
    }
    return '';
}
