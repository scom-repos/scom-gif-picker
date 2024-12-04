/// <amd-module name="@scom/scom-gif-picker/translations.json.ts" />
declare module "@scom/scom-gif-picker/translations.json.ts" {
    const _default: {
        en: {
            "auto-play_GIFs": string;
            search_for_GIFs: string;
        };
        "zh-hant": {
            "auto-play_GIFs": string;
            search_for_GIFs: string;
        };
        vi: {
            "auto-play_GIFs": string;
            search_for_GIFs: string;
        };
    };
    export default _default;
}
/// <amd-module name="@scom/scom-gif-picker/interface.ts" />
declare module "@scom/scom-gif-picker/interface.ts" {
    interface IGifCategory {
        name: string;
        name_encoded: string;
        gif: {
            images: {
                [key: string]: any;
            };
        };
    }
    interface IGif {
        images: {
            [key: string]: any;
        };
        id: string;
        title: string;
    }
    interface IGifData {
        data: IGif[];
        pagination: {
            total_count: number;
            count: number;
            offset: number;
        };
    }
    export { IGifCategory, IGif, IGifData };
}
/// <amd-module name="@scom/scom-gif-picker/model.ts" />
declare module "@scom/scom-gif-picker/model.ts" {
    import { IGifCategory } from "@scom/scom-gif-picker/interface.ts";
    export class GifModel {
        private _apiKey;
        private _categories;
        private _gifsMapper;
        constructor();
        get apiKey(): string;
        set apiKey(value: string);
        getReactions(): Promise<IGifCategory[]>;
        getGifs(params: any): Promise<any>;
        private fetchGifs;
        private fetchReactionGifs;
    }
}
/// <amd-module name="@scom/scom-gif-picker" />
declare module "@scom/scom-gif-picker" {
    import { ControlElement, Module } from "@ijstech/components";
    import { IGif } from "@scom/scom-gif-picker/interface.ts";
    interface GifPickerElement extends ControlElement {
        apiKey?: string;
        onGifSelected?: (gif: IGif) => void;
        onClose?: () => void;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-gif-picker']: GifPickerElement;
            }
        }
    }
    export class ScomGifPicker extends Module {
        private iconGif;
        private edtGif;
        private gridGifCate;
        private pnlGif;
        private autoPlaySwitch;
        private gridGif;
        private bottomElm;
        private gifLoading;
        private currentGifPage;
        private totalGifPage;
        private renderedMap;
        private bottomObserver;
        private _apiKey;
        private gifModel;
        onGifSelected: (gif: IGif) => void;
        onClose: () => void;
        get apiKey(): string;
        set apiKey(value: string);
        init(): void;
        show(): void;
        clear(): void;
        private handleIntersect;
        private renderGifCate;
        private selectGif;
        private onIconGifClicked;
        private onClearInput;
        private onGifSearch;
        private onToggleMainGif;
        private renderGifs;
        private renderImage;
        private onSearch;
        private searchGif;
        private onGifPlayChanged;
        render(): any;
    }
}
