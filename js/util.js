// YouTube функции (ваши, с небольшим изменением - добавим защиту)
// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    // Защита: если это Medal ссылка - сразу возвращаем пустую строку
    if (url.includes('medal.tv')) return '';
    
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
    // Защита: если это Medal ссылка - возвращаем пустую строку
    if (video.includes('medal.tv')) {
        console.warn('embed() не работает с Medal.tv. Используйте getMedalPreview()');
        return '';
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

// ========== MEDAL.TV ФУНКЦИИ (отдельно) ==========

export function getMedalIdFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/medal\.tv\/(?:clip|clips|watch)\/(\d+)/);
    return match ? match[1] : '';
}

export function getMedalThumbnailFromId(id) {
    if (!id) return '';
    return `https://medal.tv/clip/${id}/thumbnail.jpg`;
}

export function getMedalPreview(url, options = {}) {
    const clipId = getMedalIdFromUrl(url);
    if (!clipId) return '<div style="color: red; padding: 20px;">❌ Неверная ссылка Medal.tv</div>';
    
    const width = options.width || 640;
    
    return `
        <div class="medal-preview" style="position: relative; width: ${width}px; max-width: 100%; background: #000; border-radius: 8px; overflow: hidden;">
            <img 
                src="${getMedalThumbnailFromId(clipId)}" 
                alt="Medal.tv video preview"
                style="width: 100%; height: auto; display: block;"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'200\'%3E%3Crect width=\'100%25\' height=\'200\' fill=\'%23333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' fill=\'%23fff\' dy=\'.3em\' font-family=\'Arial\'%3E▶ Превью недоступно%3C/text%3E%3C/svg%3E'"
            >
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);">
                <a 
                    href="${url}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style="background: #ff4757; color: white; padding: 14px 32px; border-radius: 40px; 
                           text-decoration: none; font-family: system-ui, Arial, sans-serif; font-weight: bold;
                           font-size: 18px; display: inline-flex; align-items: center; gap: 10px;
                           transition: transform 0.2s, background 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"
                    onmouseover="this.style.transform='scale(1.05)'; this.style.background='#ff3344'"
                    onmouseout="this.style.transform='scale(1)'; this.style.background='#ff4757'"
                >
                    <span style="font-size: 22px;">▶</span> Смотреть на Medal.tv
                </a>
            </div>
        </div>
    `;
}

// Универсальная функция (сама определит тип)
export function getVideoHTML(url, options = {}) {
    // Medal.tv
    if (url.includes('medal.tv')) {
        return getMedalPreview(url, options);
    }
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = embed(url);
        const width = options.width || 640;
        const height = options.height || 360;
        return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="max-width: 100%; border-radius: 8px;"></iframe>`;
    }
    
    return '<div style="color: red; padding: 20px;">❌ Неподдерживаемый формат видео</div>';
}
