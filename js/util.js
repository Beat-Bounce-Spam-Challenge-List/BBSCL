// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Функция для получения ID видео из Medal
export function getMedalIdFromUrl(url) {
    const match = url.match(/medal\.tv\/(?:embed\/)?(?:clips\/)?([a-zA-Z0-9_-]+)/);
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

// Функция для получения прямой ссылки на MP4 из Medal
export function getDirectMedalMp4(url) {
    const medalId = getMedalIdFromUrl(url);
    if (!medalId) return null;
    // Прямая ссылка на видеофайл
    return `https://medal.tv/api/clips/${medalId}/source.mp4`;
    // Альтернативный вариант, если первый не работает:
    // return `https://cdn.medal.tv/clips/${medalId}/source.mp4`;
}

// Главная функция для получения embed/видео HTML
export function getVideoHtml(video) {
    if (isMedalUrl(video)) {
        const directMp4 = getDirectMedalMp4(video);
        if (directMp4) {
            // Возвращаем HTML5 video тег вместо iframe
            return `<video controls style="width:100%; max-width:800px; border-radius:8px;">
                        <source src="${directMp4}" type="video/mp4">
                        Ваш браузер не поддерживает видео.
                    </video>`;
        }
        // Если не удалось получить MP4, показываем ссылку
        return `<a href="${video}" target="_blank" rel="noopener noreferrer">
                    🎮 Смотреть клип на Medal.tv (откроется в новом окне)
                </a>`;
    }
    
    if (isYoutubeUrl(video)) {
        return `<iframe src="https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}" 
                        frameborder="0" 
                        allowfullscreen
                        style="width:100%; aspect-ratio:16/9; border-radius:8px;">
                </iframe>`;
    }
    
    // Если ссылка не распознана
    return `<a href="${video}" target="_blank">Смотреть видео</a>`;
}

// Функция для получения превью (миниатюры)
export function getThumbnail(video) {
    if (isMedalUrl(video)) {
        const medalId = getMedalIdFromUrl(video);
        // Превью от Medal (может работать или нет)
        return `https://medal.tv/api/clips/${medalId}/thumbnail`;
        // Запасной вариант:
        // return `https://img.medal.tv/clips/${medalId}/thumbnail.jpg`;
    }
    
    if (isYoutubeUrl(video)) {
        const youtubeId = getYoutubeIdFromUrl(video);
        return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    }
    
    // Дефолтное изображение
    return 'https://via.placeholder.com/320x180?text=No+Preview';
}

// Резервная функция для YouTube (на случай, если понадобится отдельно)
export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

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
