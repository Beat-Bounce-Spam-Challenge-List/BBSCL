import routes from './routes.js';
import { enableGlobalSmoothWheel } from './util.js';

enableGlobalSmoothWheel();

const initialDark = JSON.parse(localStorage.getItem('dark')) || false;
if (initialDark) {
    document.documentElement.classList.add('dark');
}

export const store = Vue.reactive({
    dark: initialDark,
    toggleDark() {
        this.dark = !this.dark;
        if (this.dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');
