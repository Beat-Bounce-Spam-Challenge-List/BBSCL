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

// Функции для Medal.tv с обходом X-Frame-Options через прокси
export function getMedalIdFromUrl(url) {
    const match = url.match(/medal\.tv\/clip\/(\d+)(?:\/[\w]+)?/);
    return match ? match[1] : '';
}

export function embedMedal(clip, options = {}) {
    const clipId = getMedalIdFromUrl(clip);
    if (!clipId) return '';
    
    const params = new URLSearchParams();
    params.set('autoplay', options.autoplay !== undefined ? (options.autoplay ? '1' : '0') : '1');
    params.set('muted', options.muted !== undefined ? (options.muted ? '1' : '0') : '1');
    params.set('loop', options.loop !== undefined ? (options.loop ? '1' : '0') : '1');
    
    if (options.steamappid) params.set('steamappid', options.steamappid);
    if (options.cta !== undefined) params.set('cta', options.cta ? '1' : '0');
    if (options.donate !== undefined) params.set('donate', options.donate ? '1' : '0');
    
    const queryString = params.toString();
    const originalUrl = `https://medal.tv/clip/${clipId}${queryString ? `?${queryString}` : ''}`;
    
    // Используем прокси для обхода X-Frame-Options
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${originalUrl}`;
    return proxyUrl;
}

export function getMedalThumbnailFromId(id) {
    return `https://medal.tv/clip/${id}/thumbnail.jpg`;
}

// Общие вспомогательные функции
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

// Универсальная функция
export function embed(video, options = {}) {
    if (video.includes('medal.tv')) {
        return embedMedal(video, options);
    } else if (video.includes('youtube.com') || video.includes('youtu.be')) {
        return embedYoutube(video);
    }
    return '';
}

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

export function getEmbedHTML(video, options = {}, width = 640, height = 360) {
    const embedUrl = embed(video, options);
    if (!embedUrl) return '';
    
    if (video.includes('medal.tv')) {
        return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
    }
    
    return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

// Глобальные функции для консоли
if (typeof window !== 'undefined') {
    window.embed = embed;
    window.getEmbedHTML = getEmbedHTML;
    window.embedMedal = embedMedal;
    window.embedYoutube = embedYoutube;
}
