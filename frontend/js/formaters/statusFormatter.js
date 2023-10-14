import Formatter from '../formatter.js';

export class StatusFormatter extends Formatter {
    Render(data) {
        return JSON.stringify(data, null, 2);
    }
}
