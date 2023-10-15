
import {DbgConsoleLog, GetConfiguration} from './main.js';
import {
    REFRESH_BUTTON_ID,

     // ID of the dropdown element for selecting the current server in the HTML
     SERVER_DROPDOWN_ID,

    // ID of the current server in the HTML
    CURRENT_SERVER_ID, 
    
    // ID of the toggle element for enabling or disabling auto-refresh in the HTML
    AUTO_REFRESH_TOGGLE_ID,
    
    // ID of the dropdown element for selecting the auto-refresh interval in the HTML
    AUTO_REFRESH_INTERVAL_ID,
    
    // Key used in localStorage to store the currently selected server
    CURRENT_SERVER_KEY,
    
    // Key used in localStorage to store the state (enabled/disabled) of auto-refresh
    AUTO_REFRESH_STATE_KEY,
    
    // Key used in localStorage to store the selected auto-refresh interval
    AUTO_REFRESH_INTERVAL_KEY,
    
    // Default value indicating no server has been selected
    notSelectedServer,
    
    // Default value for the dropdown prompting the user to choose a data source
    chooseDataSourceItem 
} from './params.js';
import {Subject} from './observerStuff.js';

const moduleName = "controlsModule"

class MainControls extends Subject {
    constructor() {
        super(); 
        this.config = null;
        this.currServerAddr = "";
        this.autoRefreshState = true;
        this.autoRefreshInterval = null;  
    }

    refreshPage() {
        window.location.reload();
    }
 
    async changeServer() {
        const methodName = "changeServer"
        const dropdown = document.getElementById(SERVER_DROPDOWN_ID);
        const displayElement = document.getElementById(CURRENT_SERVER_ID);
        const t = dropdown.value;
        
        if (t === chooseDataSourceItem) {
           
            displayElement.textContent = notSelectedServer;
            displayElement.className = "server-not-selected";
            document.body.className = "default-cursor";
            DbgConsoleLog(`new server:  ${notSelectedServer} `, moduleName, methodName);
            return;
        }
        
        if (t === this.currServerAddr) {
            DbgConsoleLog("same server chosen", moduleName, methodName);
            return;
        }
    
        // Remove the default "choose data source" option if it exists
        const defaultOption = [...dropdown.options].find(option => option.value === '');
        if (defaultOption) dropdown.removeChild(defaultOption);
        
        
        await this.setServer(t, displayElement);
        DbgConsoleLog(`new server:  ${t} `, moduleName, methodName);
    }

    async setServer(newServer, displayElement) {    
        const methodName = "setServer"
        displayElement.textContent = newServer;
        displayElement.className = "server-checking"; 
        document.body.className = "wait-cursor";
    
       
        const isServerOnline = await this.checkServerStatus(newServer);
        if (isServerOnline) {
            displayElement.className = "server-online";
        } else {
            displayElement.className = "server-offline";
        }    
        localStorage.setItem(CURRENT_SERVER_KEY, newServer);
        this.currServerAddr = newServer
        document.body.className = "default-cursor";

        DbgConsoleLog(`new server set up to ${newServer}`, moduleName, methodName)
    }

    async checkServerStatus(server) {
        const methodName = "updateServerDisplay"

        try {
            let response = await fetch(server + "/");
            DbgConsoleLog(`Checking server status ${server}: response.status = ${response.status}`, moduleName,methodName );
            return response.status === 200;            
        } catch (error) {
            DbgConsoleLog(`Checking server status${server}: error = ${error.message}`, moduleName,methodName);
            return false;
        }
    }
       
    async updateServerDisplay() {
        const methodName = "updateServerDisplay"
        const displayElement = document.getElementById(CURRENT_SERVER_ID);
    
        if (this.currServerAddr === notSelectedServer) {
            displayElement.className = 'server-not-selected';
            displayElement.textContent = this.currServerAddr;
            return;
        }
    
        displayElement.className = 'server-checking';
        const isServerOnline = await this.checkServerStatus(this.currServerAddr);
        if (isServerOnline) {
            displayElement.className = 'server-online';
        } else {
            displayElement.className = 'server-offline';
        }
        displayElement.textContent = this.currServerAddr;
        DbgConsoleLog("Current server status updated", moduleName,methodName);
    }

    populateDataSourcesStaff() {
        const methodName = "populateDataSourcesStaff"
        const dropdown = document.getElementById(SERVER_DROPDOWN_ID);    
        const serversFromConfig = this.config.servers.map(server => server.url);
        const serverFromLocalStorage = localStorage.getItem(CURRENT_SERVER_KEY);

       

        if (!serverFromLocalStorage || serverFromLocalStorage === chooseDataSourceItem || serverFromLocalStorage === 'null' || !serversFromConfig.includes(serverFromLocalStorage)) {
            this.currServerAddr = notSelectedServer;
            localStorage.removeItem(CURRENT_SERVER_KEY);
            DbgConsoleLog("Setting server to notSelectedServer due to condition match", moduleName,methodName);
        } else {            
            this.currServerAddr = serverFromLocalStorage;
            DbgConsoleLog(`Setting server from localStorage: ${serverFromLocalStorage}`, moduleName, methodName);
        }

        DbgConsoleLog(`Servers from config: ${serversFromConfig.join(", ")}`, moduleName,methodName);
        DbgConsoleLog(`Determined current server: ${this.currServerAddr}`);
        
    
        // Clear previous dropdown options
        dropdown.innerHTML = '';
        
        // Add default option ONLY if the current server is not selected
        if (this.currServerAddr === notSelectedServer) {
            const defaultOption = document.createElement('option');
            defaultOption.value = ''; // empty value
            defaultOption.innerText = chooseDataSourceItem;
            defaultOption.selected = true;
            defaultOption.disabled = true;
            dropdown.appendChild(defaultOption);
        }
        

        this.config.servers.forEach(server => {
            DbgConsoleLog(`Adding server to dropdown: ${server.name}`, moduleName, methodName);
            const dropdownItem = document.createElement('option');
            dropdownItem.value = server.url;
            dropdownItem.innerText = `${server.name}`;
            dropdown.appendChild(dropdownItem);
        });
        DbgConsoleLog("Filling dropdown", moduleName, methodName);

        // Set the dropdown to the current server, if it exists
        if (this.currServerAddr && this.currServerAddr !== notSelectedServer) {
            dropdown.value = this.currServerAddr;
        }
        DbgConsoleLog(`Dropdown dropdown.value=${dropdown.value}`, moduleName, methodName);

        const tThis = this;
        document.getElementById(SERVER_DROPDOWN_ID).addEventListener('change', async function() {    
            await tThis.changeServer();
            tThis.NotifyObservers();
            DbgConsoleLog(`reset current server to ${tThis.currServerAddr}`);
        });

        DbgConsoleLog(`Added change listener to ${SERVER_DROPDOWN_ID} `, moduleName, methodName);
    }
     

    populateRefreshRateStaff() {
        const methodName = "populateRefreshRateDropdown";
           
        this.autoRefreshState = localStorage.getItem(AUTO_REFRESH_STATE_KEY) === 'true';
        this.autoRefreshInterval = localStorage.getItem(AUTO_REFRESH_INTERVAL_KEY);
    

        const autoRefreshToggle = document.getElementById(AUTO_REFRESH_TOGGLE_ID);
        autoRefreshToggle.checked = this.autoRefreshState;
        
        const dropdown = document.getElementById(AUTO_REFRESH_INTERVAL_ID);
        
        this.config.refreshRates.forEach(rate => {
            const option = document.createElement('option');
            option.value = rate;
            option.innerText = `${rate} seconds`;
            dropdown.appendChild(option);
        });
        
        dropdown.disabled = !this.autoRefreshState;
    
        // Set the dropdown to the stored refresh rate or the default
        if (this.autoRefreshInterval) {
            dropdown.value = this.autoRefreshInterval;
        } else {
            this.autoRefreshInterval = this.config.refreshRates[0];
            localStorage.setItem(AUTO_REFRESH_INTERVAL_KEY, this.autoRefreshInterval);
            dropdown.value = this.autoRefreshInterval;
        }
    
        // Event listener for storing the selected refresh rate
        const tThis = this
        dropdown.addEventListener('change', function() {
            const selectedRefreshRate = this.value;
            localStorage.setItem(AUTO_REFRESH_INTERVAL_KEY, selectedRefreshRate);
            tThis.NotifyObservers()
            DbgConsoleLog(`reset AutoRefreshInterval to ${selectedRefreshRate} sec`, moduleName, methodName);
            
        });
    
        // Event listener for enabling/disabling the refresh rate dropdown
        autoRefreshToggle.addEventListener('change', function() {
            const isAutoRefreshEnabled = autoRefreshToggle.checked;             
            localStorage.setItem(AUTO_REFRESH_STATE_KEY, isAutoRefreshEnabled.toString());
            dropdown.disabled = !isAutoRefreshEnabled;
            tThis.NotifyObservers()
            DbgConsoleLog(`reset AutoRefreshEnabled to ${isAutoRefreshEnabled} `, moduleName, methodName);
        });
    
        DbgConsoleLog(`Added changes listener to ${AUTO_REFRESH_TOGGLE_ID} `, moduleName, methodName);
    }
    

    async init() {
        const methodName = "init"
        try {
            this.config = GetConfiguration();
            //DbgConsoleLog(`Config received: ${JSON.stringify(this.config)}`, moduleName,methodName);
            DbgConsoleLog(`get configuration - OK`, moduleName, methodName);
           
            this.populateDataSourcesStaff();
            DbgConsoleLog("populateDataSourcesStaff - OK", moduleName,methodName);
           
            this.updateServerDisplay();                     
            DbgConsoleLog("updateServerDisplay - OK", moduleName,methodName);

            this.populateRefreshRateStaff()
            DbgConsoleLog("populateRefreshRateStaff - OK", moduleName,methodName);

            document.getElementById(REFRESH_BUTTON_ID).addEventListener('click', this.refreshPage.bind(this));


            DbgConsoleLog(`object initialization - completed`, moduleName, methodName);   

        } catch (error) {
            console.error("Error in MainControls.init():", error);
        }
    }

    GetCurrentServer() {
        return this.currServerAddr;
    }

    GetAutoRefreshState() {
        return this.autoRefreshState;
    }

    GetAutoRefreshInterval() {
        return this.autoRefreshInterval;
    }
}

/**
 * Deploys MainControls.
 * @returns {Subject} 
 */
export async function Deploy() {       
    const mainControlsInstance = new MainControls()
    DbgConsoleLog("Deploy MainControls instance - OK", moduleName, "Deploy"); 
    mainControlsInstance.init();   
    return mainControlsInstance;
}

