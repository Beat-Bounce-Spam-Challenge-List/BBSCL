// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Функция для получения ID видео из Medal
export function getMedalIdFromUrl(url) {
    // Medal ссылки бывают в формате:
    // https://medal.tv/clips/1234567890
    // https://medal.tv/games/.../clips/1234567890
    // https://medal.tv/embed/clips/1234567890
    const match = url.match(/medal\.tv\/(?:embed\/)?(?:clips\/)?([a-zA-Z0-9]+)/);
    return match?.[1] ?? '';
}

// Проверка, является ли ссылка Medal
export function isMedalUrl(url) {
    return url.includes('medal.tv') || url.includes('medal.com');
}

// Проверка, является ли ссылка YouTube
export function isYoutubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// Главная функция для создания embed
export function embed(video) {
    if (isMedalUrl(video)) {
        const medalId = getMedalIdFromUrl(video);
        return `https://medal.tv/embed/clips/${medalId}`;
    }
    
    if (isYoutubeUrl(video)) {
        return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
    }
    
    // Если ссылка не распознана, возвращаем как есть
    return video;
}

// Функция для получения превью (миниатюры)
export function getThumbnail(video) {
    if (isMedalUrl(video)) {
        const medalId = getMedalIdFromUrl(video);
        // Medal предоставляет превью в формате:
        return `https://medal.tv/embed/clips/${medalId}/thumbnail`;
        // Альтернативно, можно использовать:
        // return `https://medal.tv/clips/${medalId}/thumbnail`;
    }
    
    if (isYoutubeUrl(video)) {
        const youtubeId = getYoutubeIdFromUrl(video);
        return getThumbnailFromId(youtubeId);
    }
    
    // Дефолтное изображение, если не найдено
    return 'https://via.placeholder.com/320x180?text=No+Preview';
}

// Оригинальная функция для YouTube (оставляем для обратной совместимости)
export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
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
