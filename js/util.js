// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
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

// ========== MEDAL.TV ФУНКЦИИ через Open Graph ==========

// Получить Open Graph мета-теги со страницы Medal.tv
export async function getMedalOpenGraphData(url) {
    try {
        // Убираем параметры отслеживания из URL для чистого запроса
        const cleanUrl = url.split('?')[0];
        
        // Запрашиваем HTML страницы
        const response = await fetch(cleanUrl);
        const html = await response.text();
        
        // Парсим Open Graph мета-теги
        const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
        const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
        const ogDescriptionMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        
        // Также ищем Twitter Card (запасной вариант)
        const twitterImageMatch = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
        
        return {
            success: true,
            title: ogTitleMatch ? ogTitleMatch[1] : 'Medal.tv Clip',
            image: ogImageMatch ? ogImageMatch[1] : (twitterImageMatch ? twitterImageMatch[1] : null),
            url: ogUrlMatch ? ogUrlMatch[1] : cleanUrl,
            description: ogDescriptionMatch ? ogDescriptionMatch[1] : 'Watch this clip on Medal.tv'
        };
    } catch (error) {
        console.error('Error fetching Medal.tv Open Graph data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Получить готовый HTML блок как в Discord (карточка с превью)
export async function getMedalCard(url, options = {}) {
    const data = await getMedalOpenGraphData(url);
    const width = options.width || 640;
    
    if (!data.success || !data.image) {
        // Fallback: показываем простую ссылку
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" 
                    style="display: inline-block; background: #2c2f33; color: #fff; 
                           padding: 12px 20px; border-radius: 8px; text-decoration: none;
                           font-family: system-ui, Arial, sans-serif;">
                    🎮 Смотреть на Medal.tv
                </a>`;
    }
    
    // Создаём карточку как в Discord
    return `
        <div style="max-width: ${width}px; border-radius: 12px; overflow: hidden; 
                    background: #1e1f22; border: 1px solid #2b2d31; font-family: system-ui, Arial, sans-serif;">
            <a href="${data.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
                <div style="position: relative;">
                    <img src="${data.image}" alt="${escapeHtml(data.title)}"
                         style="width: 100%; height: auto; display: block;"
                         onerror="this.src='https://placehold.co/${width}x360/2c2f33/fff?text=Medal.tv'">
                    <div style="position: absolute; bottom: 12px; right: 12px; 
                                background: rgba(0,0,0,0.7); border-radius: 20px; 
                                padding: 4px 10px; font-size: 12px; color: #fff;">
                        Medal.tv
                    </div>
                </div>
                <div style="padding: 14px; border-top: 1px solid #2b2d31;">
                    <div style="color: #fff; font-weight: 600; font-size: 16px; margin-bottom: 6px;">
                        ${escapeHtml(data.title)}
                    </div>
                    <div style="color: #b5bac1; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                        <span>🎮</span> Нажмите для просмотра → 
                    </div>
                </div>
            </a>
        </div>
    `;
}

// Универсальная функция для любого видео (как Discord)
export async function getVideoCard(url, options = {}) {
    // Medal.tv - парсим Open Graph
    if (url.includes('medal.tv')) {
        return await getMedalCard(url, options);
    }
    
    // YouTube - можно встроить iframe или тоже сделать карточку
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = embed(url);
        const width = options.width || 640;
        const height = options.height || 360;
        return `<iframe src="${embedUrl}" width="100%" style="max-width: ${width}px; aspect-ratio: 16/9; border-radius: 12px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    
    return `<div style="background: #1e1f22; color: #fff; padding: 40px; text-align: center; border-radius: 12px;">
                ❌ Неподдерживаемый формат видео
            </div>`;
}

// Вспомогательная функция
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
