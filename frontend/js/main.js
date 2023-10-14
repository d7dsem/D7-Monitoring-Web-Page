import { LoadConfiguration } from './params.js';
import { Deploy as DeployMainControls} from './controlsModule.js';
import { Deploy as DeployTabs } from './tabs.js';


const DEBUG_MODE = true;
export function DbgConsoleLog(message, moduleName = '', functionName = '') {
    if (DEBUG_MODE) {
        console.log(`[${moduleName}::${functionName}] ${message}`);
    }
}

export function GetConfiguration(){
    return App.config
}

const moduleName = "main"
class AppClass {
    constructor() {
        this.config = null;
        this.mc = null
        this.tabs = null
    }
    
    async init() {
        const methodName = "App.Init"
        try {
            this.config = await LoadConfiguration();
            if (!this.config || !this.config.servers || !this.config.refreshRates) {
                console.error("Fail load configuration");
                return;
            }
            DbgConsoleLog("Configuration loaded", moduleName, methodName);

            this.mc =  await DeployMainControls();
            this.tabs =  await DeployTabs();
            
            this.mc.AddObserver(this.tabs);
            DbgConsoleLog("add tabs instance as 'observer'", moduleName, methodName);      
        } catch (error) {
            console.error("Error in App.Init():", error);
        }
    }    
}

const App = new AppClass();

/**
 * @returns {boolean} 
 */
export function GetAutorefreshState() {
    return App.mc.GetAutoRefreshState()
}

/**
 * @returns {any} 
 */
export function GetAutorefreshInterval() {
    return App.mc.GetAutoRefreshInterval()
}

/**
 * @returns {string} 
 */
export function GetCurrentServer() {
    const rv = App.mc.GetCurrentServer()
    DbgConsoleLog(`GetCurrentServer returns: ${rv}`, moduleName, "GetCurrentServer");
    return rv
}

window.onload = function() {
    App.init();
};

