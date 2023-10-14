// constants.js

// UI Elements
export const CURRENT_SERVER_ID = "currentServerDisplay";
export const SERVER_DROPDOWN_ID = "currentServerDropDown";
export const REFRESH_BUTTON_ID = 'refreshButton';


export const AUTO_REFRESH_TOGGLE_ID = "autoRefreshToggle";
export const AUTO_REFRESH_INTERVAL_ID = "refreshRate";

export const TABS_CONTAINER_SELECTOR = '#tabs ul';
export const TAB_ITEM_SELECTOR = '#tabs ul li';

// LocalStorage keys
export const CURRENT_SERVER_KEY = "currentServer";
export const AUTO_REFRESH_STATE_KEY = "refreshState";
export const AUTO_REFRESH_INTERVAL_KEY = "refreshRate";


// default values
export const CONFIG_FILE = './data-source.json'

export async function LoadConfiguration() {
    const response = await fetch(CONFIG_FILE);
    if (!response.ok) {
        throw new Error("Couldn't load configuration");
    }
    const configData = await response.json();
    return configData;
}

export const notSelectedServer = "----"
export const chooseDataSourceItem = "choose data source"


