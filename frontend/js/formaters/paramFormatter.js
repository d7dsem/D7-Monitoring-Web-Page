import Formatter from '../formatter.js';

export class ParamFormatter extends Formatter {
    Render(data) {
        return JSON.stringify(data, null, 2);
    }
}