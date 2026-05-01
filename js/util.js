// YouTube функции
// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    // Защита: если это Medal ссылка - сразу возвращаем пустую строку
    if (url.includes('medal.tv')) return '';
    
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
    // Защита: если это Medal ссылка - возвращаем пустую строку (без предупреждения)
    if (video.includes('medal.tv')) {
        return '';  // Просто возвращаем пустую строку, без console.warn
    }
    
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

export function getMedalIdFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/medal\.tv\/(?:clip|clips|watch)\/(\d+)/);
    return match ? match[1] : '';
}

// Получаем рабочую обложку Medal.tv через оффициальный API превью
export function getMedalThumbnailFromId(id) {
    if (!id) return '';
    // Рабочий способ получить превью Medal.tv
    return `https://medal.tv/clip/${id}/preview.jpg`;
}

// Получаем HTML для Medal.tv с рабочей обложкой
export function getMedalPreview(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) {
        return `<div style="background: #1a1a1a; color: #fff; padding: 40px; text-align: center; border-radius: 8px;">
                    ❌ Неверная ссылка Medal.tv<br>
                    <small style="color: #888;">${escapeHtml(url)}</small>
                </div>`;
    }
    
    const width = options.width || 640;
    const thumbnailUrl = getMedalThumbnailFromId(clipId);
    
    return `
        <div style="position: relative; width: 100%; max-width: ${width}px; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none;">
                <div style="position: relative;">
                    <img 
                        src="${thumbnailUrl}" 
                        alt="Medal.tv clip preview"
                        style="width: 100%; height: auto; display: block;"
                        onerror="this.onerror=null; this.src='https://placehold.co/${width}x360/1a1a1a/ff4757?text=Medal.tv+Clip'"
                    >
                    <!-- Плей-кнопка поверх изображения -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                width: 70px; height: 70px; background: rgba(255, 71, 87, 0.9); 
                                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                                transition: transform 0.2s, background 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <span style="color: white; font-size: 35px; margin-left: 5px;">▶</span>
                    </div>
                    <!-- Затемнение при наведении -->
                    <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); transition: background 0.2s;"></div>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; 
                            background: linear-gradient(transparent, rgba(0,0,0,0.8)); 
                            color: white; font-family: system-ui, Arial, sans-serif; font-size: 14px;">
                    <span style="background: #ff4757; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        Medal.tv
                    </span>
                    <span style="margin-left: 10px;">Нажмите для просмотра →</span>
                </div>
            </a>
        </div>
    `;
}

// Универсальная функция - используйте ЭТУ функцию для всех видео
export function getVideoHTML(url, options = {}) {
    // Medal.tv
    if (url && url.includes('medal.tv')) {
        return getMedalPreview(url, options);
    }
    
    // YouTube
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        const embedUrl = embed(url);
        if (!embedUrl) {
            return '<div style="background: #1a1a1a; color: #fff; padding: 40px; text-align: center; border-radius: 8px;">❌ Неверная ссылка YouTube</div>';
        }
        const width = options.width || 640;
        const height = options.height || 360;
        return `<iframe src="${embedUrl}" width="100%" style="max-width: ${width}px; aspect-ratio: 16/9;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px;"></iframe>`;
    }
    
    return `<div style="background: #1a1a1a; color: #fff; padding: 40px; text-align: center; border-radius: 8px;">
                ❌ Неподдерживаемый формат видео<br>
                <small style="color: #888;">${escapeHtml(url || 'Без URL')}</small>
            </div>`;
}

// Вспомогательная функция для безопасности
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
