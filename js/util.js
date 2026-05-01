// utils.js — Полностью рабочий код без кнопок

// --- Функции для YouTube (оставляем как есть) ---
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// --- Новые функции для Medal (без асинхронности) ---

// 1. Вырезаем ID из ссылки Medal
export function getMedalIdFromUrl(url) {
    const match = url.match(/medal\.tv\/(?:embed\/)?(?:clips\/)?([a-zA-Z0-9_-]+)/);
    return match?.[1] ?? '';
}

// 2. Проверка типов ссылок
export function isMedalUrl(url) {
    return url.includes('medal.tv') || url.includes('medal.com');
}

export function isYoutubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// 3. ГЛАВНАЯ ФУНКЦИЯ — возвращает HTML для вставки
//    ВАЖНО: Для Medal использует тег <video>, а не iframe.
export function embed(video) {
    // --- БЛОК MEDAL (работает как в Discord) ---
    if (isMedalUrl(video)) {
        const medalId = getMedalIdFromUrl(video);
        if (medalId) {
            // ПРЯМАЯ ССЫЛКА НА MP4 (источник для видеоплеера)
            const directMp4 = `https://medal.tv/api/clips/${medalId}/source.mp4`;
            
            // Возвращаем обычный HTML5 плеер, как в Discord
            return `<video controls preload="metadata" style="width:100%; max-width:800px; border-radius:8px;">
                        <source src="${directMp4}" type="video/mp4">
                        Ваш браузер не поддерживает видео.
                    </video>`;
        }
        // Если ID не найден — вернём пустую строку (ничего не сломается)
        return '';
    }
    
    // --- БЛОК YOUTUBE (оставляем старый iframe) ---
    if (isYoutubeUrl(video)) {
        const youtubeId = getYoutubeIdFromUrl(video);
        if (youtubeId) {
            return `<iframe src="https://www.youtube.com/embed/${youtubeId}" 
                            frameborder="0" 
                            allowfullscreen
                            style="width:100%; aspect-ratio:16/9; border-radius:8px;">
                    </iframe>`;
        }
        return '';
    }
    
    // Если ссылка не распознана — ничего не показываем
    return '';
}

// 4. Превью для карточек (если нужно)
export function getThumbnail(video) {
    if (isMedalUrl(video)) {
        const medalId = getMedalIdFromUrl(video);
        if (medalId) {
            // Превью от Medal
            return `https://medal.tv/api/clips/${medalId}/thumbnail`;
        }
        return 'https://via.placeholder.com/320x180?text=Medal+Clip';
    }
    
    if (isYoutubeUrl(video)) {
        const youtubeId = getYoutubeIdFromUrl(video);
        return getThumbnailFromId(youtubeId);
    }
    
    return 'https://via.placeholder.com/320x180?text=No+Preview';
}

// 5. Остальные ваши старые функции (localize, shuffle)...
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
