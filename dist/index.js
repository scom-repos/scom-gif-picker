var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-gif-picker/translations.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-gif-picker/translations.json.ts'/> 
    exports.default = {
        "en": {
            "auto-play_GIFs": "Auto-play GIFs",
            "search_for_GIFs": "Search for GIFs",
        },
        "zh-hant": {
            "auto-play_GIFs": "自動播放 GIFs",
            "search_for_GIFs": "搜索 GIFs",
        },
        "vi": {
            "auto-play_GIFs": "Tự động phát GIFs",
            "search_for_GIFs": "Tìm kiếm GIFs",
        }
    };
});
define("@scom/scom-gif-picker/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-gif-picker/model.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GifModel = void 0;
    class GifModel {
        constructor() {
            this._gifsMapper = {};
        }
        get apiKey() {
            return this._apiKey;
        }
        set apiKey(value) {
            this._apiKey = value;
        }
        async getReactions() {
            if (!this._categories) {
                this._categories = await this.fetchReactionGifs();
            }
            return this._categories;
        }
        async getGifs(params) {
            const { q, offset = 0 } = params;
            return this._gifsMapper[`${q}_${offset}`] || await this.fetchGifs(params);
        }
        async fetchGifs(params) {
            if (!params.offset)
                params.offset = 0;
            if (!params.limit)
                params.limit = 20;
            params.api_key = this.apiKey;
            const queries = params ? new URLSearchParams({
                ...params
            }).toString() : '';
            try {
                const response = await fetch(`https://api.giphy.com/v1/gifs/search?${queries}`);
                const result = await response.json();
                this._gifsMapper[`${params.q}_${params.offset}`] = result;
                return result;
            }
            catch {
                return null;
            }
        }
        async fetchReactionGifs() {
            try {
                const response = await fetch(`https://api.giphy.com/v1/gifs/categories/reactions?api_key=${this.apiKey}`);
                const { data = [] } = await response.json();
                return data;
            }
            catch {
                return [];
            }
        }
    }
    exports.GifModel = GifModel;
});
define("@scom/scom-gif-picker", ["require", "exports", "@ijstech/components", "@scom/scom-gif-picker/translations.json.ts", "@scom/scom-gif-picker/model.ts"], function (require, exports, components_1, translations_json_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomGifPicker = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    let ScomGifPicker = class ScomGifPicker extends components_1.Module {
        constructor() {
            super(...arguments);
            this.currentGifPage = 0;
            this.totalGifPage = 1;
            this.renderedMap = {};
            this.gifModel = new model_1.GifModel();
        }
        get apiKey() {
            return this._apiKey;
        }
        set apiKey(value) {
            this._apiKey = value;
            this.gifModel.apiKey = value;
        }
        init() {
            this.i18n.init({ ...translations_json_1.default });
            super.init();
            const apiKey = this.getAttribute('apiKey', true);
            if (apiKey)
                this.apiKey = apiKey;
            this.bottomObserver = new IntersectionObserver(this.handleIntersect.bind(this), {
                root: null,
                rootMargin: "20px",
                threshold: 0.9
            });
            this.selectGif = this.selectGif.bind(this);
            this.renderGifCate();
        }
        show() {
            this.autoPlaySwitch.checked = true;
            this.onToggleMainGif(true);
        }
        clear() {
            this.bottomElm.visible = false;
            this.bottomObserver.unobserve(this.bottomElm);
            this.renderedMap = {};
        }
        handleIntersect(entries, observer) {
            entries.forEach(entry => {
                if (!entry.isIntersecting)
                    return;
                if (this.currentGifPage < this.totalGifPage) {
                    ++this.currentGifPage;
                    this.renderGifs(this.edtGif.value || '', this.autoPlaySwitch.checked);
                }
            });
        }
        async renderGifCate() {
            this.gridGifCate.clearInnerHTML();
            const data = await this.gifModel.getReactions();
            // const limitedList = [...data].slice(0, 8);
            for (const cate of data) {
                this.gridGifCate.appendChild(this.$render("i-panel", { overflow: 'hidden', cursor: "pointer", onClick: () => this.onGifSearch(cate.name) },
                    this.$render("i-image", { url: cate.gif.images['fixed_height_still'].url, width: '100%', display: 'block' }),
                    this.$render("i-label", { caption: cate.name, font: { size: '1.25rem', weight: 700 }, position: "absolute", bottom: "0px", display: "block", width: '100%', padding: { left: '0.5rem', top: '0.5rem', right: '0.5rem', bottom: '0.5rem' } })));
            }
        }
        selectGif(gif) {
            if (this.onGifSelected)
                this.onGifSelected(gif.images.original.url);
        }
        onIconGifClicked(icon) {
            if (icon.name === 'times') {
                if (this.onClose)
                    this.onClose();
            }
            else {
                this.pnlGif.visible = false;
                this.gridGifCate.visible = true;
                icon.name = 'times';
                this.edtGif.value = "";
            }
        }
        onClearInput() {
            this.onToggleMainGif(true);
        }
        onGifSearch(q) {
            this.onToggleMainGif(false);
            this.edtGif.value = q;
            this.renderGifs(q, this.autoPlaySwitch.checked);
        }
        onToggleMainGif(value) {
            this.gridGifCate.visible = value;
            this.pnlGif.visible = !value;
            this.currentGifPage = 1;
            this.totalGifPage = 1;
            if (value) {
                this.bottomObserver.unobserve(this.bottomElm);
                this.iconGif.name = 'times';
            }
            else {
                this.bottomObserver.observe(this.bottomElm);
                this.iconGif.name = 'arrow-left';
            }
            this.gridGif.clearInnerHTML();
            this.renderedMap = {};
        }
        async renderGifs(q, autoplay) {
            if (this.renderedMap[this.currentGifPage])
                return;
            this.gifLoading.visible = true;
            this.renderedMap[this.currentGifPage] = true;
            const params = { q, offset: this.currentGifPage - 1 };
            const result = await this.gifModel.getGifs(params);
            const { data = [], pagination: { total_count, count } } = result;
            this.totalGifPage = Math.ceil(total_count / count);
            for (const gif of data) {
                this.gridGif.appendChild(this.$render("i-panel", { onClick: () => this.selectGif(gif), width: "100%", overflow: 'hidden', background: { color: Theme.action.hoverBackground }, cursor: "pointer" },
                    this.$render("i-image", { url: autoplay ? gif.images.preview_gif.url : gif.images.fixed_height_still.url, width: '100%', height: '100%', objectFit: 'cover', display: 'block' })));
            }
            this.gifLoading.visible = false;
            this.bottomElm.visible = this.totalGifPage > 1;
        }
        onSearch(target) {
            this.searchGif(target.value);
        }
        searchGif(q) {
            this.onToggleMainGif(false);
            this.edtGif.value = q;
            this.renderGifs(q, this.autoPlaySwitch.checked);
        }
        onGifPlayChanged(target) {
            this.renderedMap[this.currentGifPage] = false;
            this.gridGif.clearInnerHTML();
            this.renderGifs(this.edtGif.value, target.checked);
        }
        render() {
            return (this.$render("i-vstack", null,
                this.$render("i-hstack", { verticalAlignment: "center", height: 53, margin: { top: 8, bottom: 8 }, padding: { right: '1rem', left: '1rem' }, position: "sticky", zIndex: 2, top: '0px', background: { color: Theme.background.modal } },
                    this.$render("i-panel", { stack: { basis: '56px' } },
                        this.$render("i-icon", { id: "iconGif", name: "times", cursor: 'pointer', width: 20, height: 20, fill: Theme.colors.secondary.main, onClick: this.onIconGifClicked })),
                    this.$render("i-hstack", { verticalAlignment: "center", padding: { left: '0.75rem', right: '0.75rem' }, border: { radius: '9999px', width: '1px', style: 'solid', color: Theme.divider }, minHeight: 40, width: '100%', background: { color: Theme.input.background }, gap: "4px" },
                        this.$render("i-icon", { width: 16, height: 16, name: 'search', fill: Theme.text.secondary }),
                        this.$render("i-input", { id: "edtGif", placeholder: '$search_for_GIFs', width: '100%', height: '100%', captionWidth: '0px', border: { style: 'none' }, showClearButton: true, onClearClick: this.onClearInput, onKeyUp: this.onSearch }))),
                this.$render("i-card-layout", { id: "gridGifCate", cardMinWidth: '200px', cardHeight: '200px' }),
                this.$render("i-vstack", { id: "pnlGif", visible: false },
                    this.$render("i-hstack", { horizontalAlignment: "space-between", gap: "0.5rem", padding: { left: '0.75rem', right: '0.75rem', top: '0.75rem', bottom: '0.75rem' } },
                        this.$render("i-label", { caption: "$auto-play_GIFs", font: { color: Theme.text.secondary, size: '0.9rem' } }),
                        this.$render("i-switch", { id: "autoPlaySwitch", checked: true, uncheckedTrackColor: Theme.divider, checkedTrackColor: Theme.colors.primary.main, onChanged: this.onGifPlayChanged })),
                    this.$render("i-card-layout", { id: "gridGif", autoRowSize: "auto", autoColumnSize: "auto", cardHeight: "120px", cardMinWidth: "120px" }),
                    this.$render("i-panel", { id: "bottomElm", width: '100%', minHeight: 20 },
                        this.$render("i-vstack", { id: "gifLoading", padding: { top: '0.5rem', bottom: '0.5rem' }, visible: false, height: "100%", width: "100%", class: "i-loading-overlay", background: { color: Theme.background.modal } },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", name: "spinner", width: 24, height: 24, fill: Theme.colors.primary.main })))))));
        }
    };
    ScomGifPicker = __decorate([
        (0, components_1.customElements)('i-scom-gif-picker')
    ], ScomGifPicker);
    exports.ScomGifPicker = ScomGifPicker;
});
