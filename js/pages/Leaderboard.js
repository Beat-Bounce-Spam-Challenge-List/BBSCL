import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        searchQuery: '',
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <div class="search-bar">
                        <input id="leaderboard-search" type="text" v-model="searchQuery" placeholder="Search player..." />
                    </div>
                    <table class="board" v-if="filteredLeaderboard.length">
                        <tr v-for="(ientry, i) in filteredLeaderboard">
                            <td class="rank">
                                <p class="type-label-lg">#{{ getRank(ientry) }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == getIndex(ientry) }">
                                <button @click="selected = getIndex(ientry)">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                    <p v-else style="padding: 1rem; color: #888;">No players found.</p>
                </div>
                <div class="player-container">
                    <div class="player" :key="entry ? entry.user : selected">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
        filteredLeaderboard() {
            if (!this.searchQuery) return this.leaderboard;
            const q = this.searchQuery.toLowerCase().trim();
            return this.leaderboard.filter(e => e.user && e.user.toLowerCase().includes(q));
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;

        this.$nextTick(() => {
            this.initScrollReveal();
        });
    },
    unmounted() {
        if (this.observer) this.observer.disconnect();
    },
    methods: {
        localize,
        initScrollReveal() {
            if (this.observer) this.observer.disconnect();

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            }, {
                threshold: 0.05,
                rootMargin: "0px 0px 50px 0px"
            });

            this.$nextTick(() => {
                const rows = document.querySelectorAll(".page-leaderboard .board tr, .page-leaderboard .player .table tr");
                rows.forEach((row) => this.observer.observe(row));
            });
        },
        getRank(entry) {
            return this.leaderboard.findIndex(e => e.user === entry.user) + 1;
        },
        getIndex(entry) {
            return this.leaderboard.findIndex(e => e.user === entry.user);
        },
    },
    watch: {
        filteredLeaderboard() {
            this.$nextTick(() => {
                this.initScrollReveal();
            });
        },
        selected() {
            this.$nextTick(() => {
                this.initScrollReveal();
            });
        }
    },
};
