import { customModule, Input, Module } from '@ijstech/components';
import {ScomGifPicker} from '@scom/scom-gif-picker';

@customModule
export default class Module1 extends Module {
    private picker: ScomGifPicker;

    private async handleSelected(value: string) {
        console.log(value);
    }

    render() {
        return (
            <i-stack
                direction="vertical"
                margin={{ top: '1rem', left: '1rem', right: '1rem' }}
                gap="1rem"
            >
                <i-scom-gif-picker id="picker" onGifSelected={this.handleSelected} apiKey=""></i-scom-gif-picker>
            </i-stack>
        )
    }
}