import Formatter from '../formatter.js';

export class MemFormatter extends Formatter {
    Render(data) {
        return JSON.stringify(data, null, 2);
    }
}