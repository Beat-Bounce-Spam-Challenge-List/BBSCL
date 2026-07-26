import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    
    template: `

        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <div class="search-bar">
                     <input type="text" v-model="searchQuery" placeholder="Search levels..." />
                </div>
                <table class="list" v-if="filteredList.length">
                    <tr v-for="([level, err], i) in filteredList" :key="i">
                        <td class="rank">
                            <p v-if="i + 1 <= 100" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
                <p v-if="filteredList.length === 0">No levels match your search.</p>
            </div>
            <div class="level-container" v-if="selectedLevel">
                <div class="level">
                    <h1>{{ selectedLevel.name }}</h1>
                    <LevelAuthors :author="selectedLevel.author" :creators="selectedLevel.creators" :verifier="selectedLevel.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="embed(this.selectedLevel.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, selectedLevel.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ selectedLevel.id }}</p>
                        </li>
                        <li>
                              <div class="type-title-sm">FPS</div>
                              <p>{{ selectedLevel.fps || 'Any' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ selectedLevel.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in selectedLevel.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                <p>(ノಠ益ಠ)ノ彡┻━┻</p>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>
                        Achieved the record without using hacks
                    </p>
                    <p>
                        You are allowed to use any methods of spamming, but certain methods are disallowed for specific levels.
                    </p>
                    <p>
                        Have either source audio or clicks/taps in the video. Edited audio only does not count
                    </p>
                    <p>
                        The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this
                    </p>
                    <p>
                        The recording must also show the player level complete menu, or the completion will be invalidated.
                    </p>
                    <p>
                        Do not use secret routes or bug routes
                    </p>
                    <p>
                        Once a level falls onto the Legacy List, we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level
                    </p>
                     <p>
                        You must beat a level on its listed FPS (E.G. if a level requires 120 FPS, beating it on 60 or 30 will not be considered a completion).
                    </p>
                     <p>
                        The difficulty must be almost all in the spam of the level. You are allowed to put a triple spike or a timing at the end or beginning.
                    </p>
                     <p>
                        It may say Spam "Challenge" List, however there is not really a time limit.
                    </p>
                     <p>
                        To prevent list flooding, the levels must have effort put into them, such as good decoration or music.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        searchQuery: "",
        roleIconMap,
        store
    }),
    computed: {
        filteredList() {    
            if (!this.searchQuery) return this.list;
            return this.list.filter(([level, err]) => {
                if (!level || !level.name) return false;
                return level.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        },

        selectedLevel() {
            return this.filteredList[this.selected]
                ? this.filteredList[this.selected][0]
                : null;
        },

        selectedIndexInFullList() {
            if (!this.selectedLevel) return this.selected + 1;
            return (
                this.list.findIndex(
                (item) => item[0] && item[0].id === this.selectedLevel.id
                ) + 1
            );
        },
    },
    watch: {
        searchQuery() {
            this.selected = 0;
        },
    },
    methods: {
        embed,
        score,
        getOriginalRank(level) {
            let index = this.list.findIndex(
                (item) => item[0] && item[0].id === level.id
            );
            return index >= 0 ? index + 1 : this.selected + 1;
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
