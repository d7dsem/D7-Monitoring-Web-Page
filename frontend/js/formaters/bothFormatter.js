import Formatter from '../formatter.js';

export class BothFormatter extends Formatter {
    Render(data) {
        return JSON.stringify(data, null, 2);
    }
}
