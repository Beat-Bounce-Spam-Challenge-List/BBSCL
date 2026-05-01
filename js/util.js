// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Функция для извлечения ссылки на клип Medal.tv из URL
export function getMedalClipUrl(url) {
    // Поддерживаемые форматы URL Medal.tv:
    // https://medal.tv/clips/CLIP_ID
    // https://medal.tv/games/GAME_SLUG/clips/CLIP_ID
    // https://medal.tv/users/USER_ID/clips/CLIP_ID
    const patterns = [
        /medal\.tv\/clips\/([a-zA-Z0-9]+)/,
        /medal\.tv\/[^\/]+\/clips\/([a-zA-Z0-9]+)/,
        /medal\.tv\/users\/[^\/]+\/clips\/([a-zA-Z0-9]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return `https://medal.tv/clips/${match[1]}`;
        }
    }
    return '';
}

// Проверка, является ли URL ссылкой на Medal.tv
export function isMedalUrl(url) {
    return /medal\.tv\/(clips\/|[^\/]+\/clips\/|users\/[^\/]+\/clips\/)/.test(url);
}

// Встраивание видео (универсальное)
export function embed(video) {
    const youtubeId = getYoutubeIdFromUrl(video);
    if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}`;
    }
    
    if (isMedalUrl(video)) {
        const clipUrl = getMedalClipUrl(video);
        if (clipUrl) {
            // Medal.tv использует iframe для встраивания
            // Используем их официальный embed URL
            const clipId = clipUrl.split('/').pop();
            return `https://medal.tv/embed/clip/${clipId}`;
        }
    }
    
    return '';
}

// Получение данных клипа через API Medal.tv
// Требуется API ключ: https://docs.medal.tv/gameapi/get-api-key.html [citation:1]
export async function getMedalClipData(url, apiKey) {
    if (!isMedalUrl(url)) {
        return null;
    }
    
    const clipUrl = getMedalClipUrl(url);
    if (!clipUrl) {
        return null;
    }
    
    const clipId = clipUrl.split('/').pop();
    
    // Использование Medal.tv Developer API
    // API endpoint: https://docs.medal.tv/restapi/clips/get-clip.html [citation:3]
    const apiUrl = `https://developers.medal.tv/v1/clips/${clipId}?include=content,user`;
    
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Нормализация данных в единый формат [citation:3]
        return {
            id: data.id || clipId,
            title: data.contentTitle || 'Medal.tv Clip',
            thumbnail: data.contentThumbnail || `https://cdn.medal.tv/ugcc/content-thumbnail/${clipId}`,
            views: data.contentViews || 0,
            likes: data.contentLikes || 0,
            duration: data.videoLengthSeconds || 0,
            url: data.directClipUrl || clipUrl,
            embedUrl: `https://medal.tv/embed/clip/${clipId}`,
            author: data.credits || 'Medal Creator',
            platform: 'medal'
        };
    } catch (error) {
        console.error('Error fetching Medal clip data:', error);
        // Fallback: возвращаем базовую информацию без API
        return {
            id: clipId,
            title: 'Medal.tv Clip',
            thumbnail: `https://cdn.medal.tv/ugcc/content-thumbnail/${clipId}`,
            views: 0,
            likes: 0,
            duration: 0,
            url: clipUrl,
            embedUrl: `https://medal.tv/embed/clip/${clipId}`,
            author: 'Medal Creator',
            platform: 'medal'
        };
    }
}

// Получение миниатюры (универсальное)
export function getThumbnail(video) {
    const youtubeId = getYoutubeIdFromUrl(video);
    if (youtubeId) {
        return getThumbnailFromId(youtubeId);
    }
    
    if (isMedalUrl(video)) {
        const clipUrl = getMedalClipUrl(video);
        const clipId = clipUrl?.split('/').pop();
        if (clipId) {
            // Medal.tv CDN для миниатюр [citation:3]
            return `https://cdn.medal.tv/ugcc/content-thumbnail/${clipId}`;
        }
    }
    
    return '';
}

// Оригинальная функция для YouTube (оставлена для обратной совместимости)
export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
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

// Локализация числа (оригинальная функция)
export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}
