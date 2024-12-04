import {
    customElements,
    ControlElement,
    Module,
    Styles,
    Panel,
    Icon,
    Input,
    Switch,
    CardLayout,
    VStack
} from "@ijstech/components";
import translations from "./translations.json";
import { GifModel } from "./model";

interface GifPickerElement extends ControlElement {
    apiKey?: string;
    onGifSelected?: (url: string) => void;
    onClose?: () => void;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-gif-picker']: GifPickerElement;
        }
    }
}

const Theme = Styles.Theme.ThemeVars;

@customElements('i-scom-gif-picker')
export class ScomGifPicker extends Module {
    private iconGif: Icon;
    private edtGif: Input;
    private gridGifCate: CardLayout;
    private pnlGif: Panel;
    private autoPlaySwitch: Switch;
    private gridGif: CardLayout;
    private bottomElm: Panel;
    private gifLoading: VStack;
    private currentGifPage: number = 0;
    private totalGifPage: number = 1;
    private renderedMap: { [key: number]: boolean } = {};
    private bottomObserver: IntersectionObserver;

    private _apiKey: string;
    private gifModel: GifModel = new GifModel();

    onGifSelected: (url: string) => void;
    onClose: () => void;

    get apiKey() {
        return this._apiKey;
    }

    set apiKey(value: string) {
        this._apiKey = value;
        this.gifModel.apiKey = value;
    }

    init() {
        this.i18n.init({...translations});
        super.init();
        const apiKey = this.getAttribute('apiKey', true);
        if (apiKey) this.apiKey = apiKey;
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

    private handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            if (this.currentGifPage < this.totalGifPage) {
                ++this.currentGifPage;
                this.renderGifs(this.edtGif.value || '', this.autoPlaySwitch.checked);
            }
        });
    }

    private async renderGifCate() {
        this.gridGifCate.clearInnerHTML();
        const data = await this.gifModel.getReactions();
        // const limitedList = [...data].slice(0, 8);
        for (const cate of data) {
            this.gridGifCate.appendChild(
                <i-panel
                    overflow={'hidden'}
                    cursor="pointer"
                    onClick={() => this.onGifSearch(cate.name)}
                >
                    <i-image
                        url={cate.gif.images['fixed_height_still'].url}
                        width={'100%'} display='block'
                    ></i-image>
                    <i-label
                        caption={cate.name}
                        font={{ size: '1.25rem', weight: 700 }}
                        position="absolute" bottom="0px"
                        display="block" width={'100%'}
                        padding={{ left: '0.5rem', top: '0.5rem', right: '0.5rem', bottom: '0.5rem' }}
                    ></i-label>
                </i-panel>
            )
        }
        
    }

    private selectGif(gif: any) {
        if (this.onGifSelected) this.onGifSelected(gif.images.original.url);
    }

    private onIconGifClicked(icon: Icon) {
        if (icon.name === 'times') {
            if (this.onClose) this.onClose();
        } else {
            this.pnlGif.visible = false;
            this.gridGifCate.visible = true;
            icon.name = 'times';
            this.edtGif.value = "";
        }
    }

    private onClearInput() {
        this.onToggleMainGif(true);
    }

    private onGifSearch(q: string) {
        this.onToggleMainGif(false);
        this.edtGif.value = q;
        this.renderGifs(q, this.autoPlaySwitch.checked);
    }

    private onToggleMainGif(value: boolean) {
        this.gridGifCate.visible = value;
        this.pnlGif.visible = !value;
        this.currentGifPage = 1;
        this.totalGifPage = 1;
        if (value) {
            this.bottomObserver.unobserve(this.bottomElm);
            this.iconGif.name = 'times';
        } else {
            this.bottomObserver.observe(this.bottomElm);
            this.iconGif.name = 'arrow-left';
        }
        this.gridGif.clearInnerHTML();
        this.renderedMap = {};
    }

    private async renderGifs(q: string, autoplay: boolean) {
        if (this.renderedMap[this.currentGifPage]) return;
        this.gifLoading.visible = true;
        this.renderedMap[this.currentGifPage] = true;
        const params = { q, offset: this.currentGifPage - 1 };
        const result = await this.gifModel.getGifs(params);
        const { data = [], pagination: { total_count, count } } = result;
        this.totalGifPage = Math.ceil(total_count / count);

        for (const gif of data) {
            this.gridGif.appendChild(
                <i-panel
                    onClick={() => this.selectGif(gif)}
                    width="100%"
                    overflow={'hidden'}
                    background={{ color: Theme.action.hoverBackground }}
                    cursor="pointer"
                >
                    <i-image
                        url={autoplay ? gif.images.preview_gif.url : gif.images.fixed_height_still.url}
                        width={'100%'} height='100%' objectFit='cover' display='block'
                    ></i-image>
                </i-panel>
            )
        }
        this.gifLoading.visible = false;
        this.bottomElm.visible = this.totalGifPage > 1;
    }

    private onSearch(target: Input) {
        this.searchGif(target.value)
    }

    private searchGif(q: string) {
        this.onToggleMainGif(false);
        this.edtGif.value = q;
        this.renderGifs(q, this.autoPlaySwitch.checked);
    }

    private onGifPlayChanged(target: Switch) {
        this.renderedMap[this.currentGifPage] = false;
        this.gridGif.clearInnerHTML();
        this.renderGifs(this.edtGif.value, target.checked);
    }

    render() {
        return (
            <i-vstack>
                <i-hstack
                    verticalAlignment="center"
                    height={53}
                    margin={{ top: 8, bottom: 8 }}
                    padding={{ right: '1rem', left: '1rem' }}
                    position="sticky"
                    zIndex={2} top={'0px'}
                    background={{ color: Theme.background.modal }}
                >
                    <i-panel stack={{ basis: '56px' }}>
                        <i-icon
                            id="iconGif"
                            name="times"
                            cursor='pointer'
                            width={20} height={20} fill={Theme.colors.secondary.main}
                            onClick={this.onIconGifClicked}
                        ></i-icon>
                    </i-panel>
                    <i-hstack
                        verticalAlignment="center"
                        padding={{ left: '0.75rem', right: '0.75rem' }}
                        border={{ radius: '9999px', width: '1px', style: 'solid', color: Theme.divider }}
                        minHeight={40} width={'100%'}
                        background={{ color: Theme.input.background }}
                        gap="4px"
                    >
                        <i-icon width={16} height={16} name='search' fill={Theme.text.secondary} />
                        <i-input
                            id="edtGif"
                            placeholder='$search_for_GIFs'
                            width='100%'
                            height='100%'
                            captionWidth={'0px'}
                            border={{ style: 'none' }}
                            showClearButton={true}
                            onClearClick={this.onClearInput}
                            onKeyUp={this.onSearch}
                        ></i-input>
                    </i-hstack>
                </i-hstack>
                <i-card-layout
                    id="gridGifCate"
                    cardMinWidth={'200px'}
                    cardHeight={'200px'}
                ></i-card-layout>
                <i-vstack id="pnlGif" visible={false}>
                    <i-hstack
                        horizontalAlignment="space-between"
                        gap="0.5rem"
                        padding={{ left: '0.75rem', right: '0.75rem', top: '0.75rem', bottom: '0.75rem' }}
                    >
                        <i-label caption="$auto-play_GIFs" font={{ color: Theme.text.secondary, size: '0.9rem' }}></i-label>
                        <i-switch
                            id="autoPlaySwitch"
                            checked={true}
                            uncheckedTrackColor={Theme.divider}
                            checkedTrackColor={Theme.colors.primary.main}
                            onChanged={this.onGifPlayChanged}
                        ></i-switch>
                    </i-hstack>
                    <i-card-layout
                        id="gridGif"
                        autoRowSize="auto"
                        autoColumnSize="auto"
                        cardHeight="120px"
                        cardMinWidth="120px"
                    ></i-card-layout>
                    <i-panel id="bottomElm" width={'100%'} minHeight={20}>
                        <i-vstack
                            id="gifLoading"
                            padding={{ top: '0.5rem', bottom: '0.5rem' }}
                            visible={false}
                            height="100%" width="100%"
                            class="i-loading-overlay"
                            background={{ color: Theme.background.modal }}
                        >
                            <i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
                                <i-icon
                                    class="i-loading-spinner_icon"
                                    name="spinner"
                                    width={24}
                                    height={24}
                                    fill={Theme.colors.primary.main}
                                />
                            </i-vstack>
                        </i-vstack>
                    </i-panel>
                </i-vstack>
            </i-vstack>
        )
    }
}