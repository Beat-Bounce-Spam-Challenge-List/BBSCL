// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function getMedalClipId(url) {
    return url.match(/medal\.tv\/(?:[^\/]+\/)*(?:clips|clip)\/([a-zA-Z0-9_-]+)/)?.[1] ?? '';
}

export function embed(video) {
    if (!video) return '';
    if (video.includes('medal.tv')) {
        const clipId = getMedalClipId(video);
        return clipId ? `https://medal.tv/games/roblox/clip/${clipId}` : video;
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

/**
 * Global momentum smooth wheel scroller for any scrollable element
 */
export function enableGlobalSmoothWheel() {
    let currentTarget = null;
    let targetScroll = 0;
    let currentScroll = 0;
    let isRunning = false;

    function animate() {
        if (!currentTarget) {
            isRunning = false;
            return;
        }

        const diff = targetScroll - currentScroll;
        if (Math.abs(diff) < 0.5) {
            currentScroll = targetScroll;
            currentTarget.scrollTop = currentScroll;
            isRunning = false;
            return;
        }

        currentScroll += diff * 0.14;
        currentTarget.scrollTop = currentScroll;
        requestAnimationFrame(animate);
    }

    function findScrollable(el) {
        let current = el;
        while (current && current !== document.body && current !== document.documentElement) {
            const style = window.getComputedStyle(current);
            const overflowY = style.overflowY;
            if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    function onWheel(e) {
        const scrollable = findScrollable(e.target);
        if (!scrollable) return;

        const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
        if (maxScroll <= 0) return;

        e.preventDefault();

        if (currentTarget !== scrollable || !isRunning) {
            currentTarget = scrollable;
            currentScroll = scrollable.scrollTop;
            targetScroll = scrollable.scrollTop;
        }

        targetScroll += e.deltaY * 0.85;
        targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));

        if (!isRunning) {
            isRunning = true;
            requestAnimationFrame(animate);
        }
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
        window.removeEventListener('wheel', onWheel);
    };
}

export const enableSmoothWheel = enableGlobalSmoothWheel;

