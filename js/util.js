// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Функция для получения ID Medal.tv из URL
export function getMedalIdFromUrl(url) {
    // Поддерживаемые форматы:
    // https://medal.tv/clips/12345678
    // https://medal.tv/games/valorant/clips/12345678
    // https://medal.tv/clips/12345678/abcdefghijkl
    // https://medal.tv/clips/12345678?invite=xxx
    const patterns = [
        /medal\.tv\/clips\/([^\/\?#]+)/,
        /medal\.tv\/[^\/]+\/clips\/([^\/\?#]+)/,
        /medal\.tv\/clips\/([^\?]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return '';
}

// Функция для определения типа видео
export function getVideoType(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    } else if (url.includes('medal.tv')) {
        return 'medal';
    }
    return 'unknown';
}

// Функция для получения embed URL
export function embed(video) {
    const type = getVideoType(video);
    
    if (type === 'youtube') {
        return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
    } else if (type === 'medal') {
        const medalId = getMedalIdFromUrl(video);
        return `https://medal.tv/clips/${medalId}/embed`;
    }
    
    return '';
}

// Функция для получения данных о клипе Medal.tv через API
export async function getMedalClipData(medalId) {
    try {
        // Medal.tv публичный API для получения информации о клипе
        const response = await fetch(`https://api.medal.tv/clip/${medalId}?include=user`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            id: data.id,
            title: data.title || 'Medal.tv Clip',
            thumbnailUrl: data.thumbnailUrl || `https://medal.tv/clips/${medalId}/thumbnail`,
            videoUrl: data.contentUrl,
            views: data.views,
            duration: data.duration,
            userName: data.user?.username,
            createdAt: data.createdAt
        };
    } catch (error) {
        console.error('Error fetching Medal.tv clip data:', error);
        return null;
    }
}

// Функция для получения превью (совместимая с существующей)
export function getThumbnailFromId(id, type = 'youtube') {
    if (type === 'youtube') {
        return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    } else if (type === 'medal') {
        // Для Medal.tv возвращаем URL превью, который будет загружен асинхронно
        // или синхронно, если ID - это clip ID
        return `https://medal.tv/clips/${id}/thumbnail`;
    }
    return '';
}

// Асинхронная версия для получения превью с реальными данными
export async function getMedalThumbnailFromId(medalId) {
    const clipData = await getMedalClipData(medalId);
    return clipData?.thumbnailUrl || `https://medal.tv/clips/${medalId}/thumbnail`;
}

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

// Дополнительная функция для пакетной обработки видео URL
export async function getVideoInfo(url) {
    const type = getVideoType(url);
    
    if (type === 'youtube') {
        const youtubeId = getYoutubeIdFromUrl(url);
        return {
            type: 'youtube',
            id: youtubeId,
            embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
            thumbnailUrl: getThumbnailFromId(youtubeId, 'youtube')
        };
    } else if (type === 'medal') {
        const medalId = getMedalIdFromUrl(url);
        const clipData = await getMedalClipData(medalId);
        
        return {
            type: 'medal',
            id: medalId,
            embedUrl: `https://medal.tv/clips/${medalId}/embed`,
            thumbnailUrl: clipData?.thumbnailUrl || getThumbnailFromId(medalId, 'medal'),
            title: clipData?.title,
            views: clipData?.views,
            duration: clipData?.duration,
            userName: clipData?.userName
        };
    }
    
    return null;
}

// Пример использования:
/*
import { embed, getVideoInfo, getVideoType } from './video-utils.js';

// Синхронное использование для получения embed URL
const youtubeEmbed = embed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
const medalEmbed = embed('https://medal.tv/clips/12345678');

// Асинхронное использование для получения полной информации
const videoInfo = await getVideoInfo('https://medal.tv/clips/12345678');
console.log(videoInfo);
*/
