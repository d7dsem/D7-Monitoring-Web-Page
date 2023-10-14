import Formatter from '../formatter.js';

export class DlgFormatter extends Formatter {
    Render(data) {
        return JSON.stringify(data, null, 2);
    }
}
