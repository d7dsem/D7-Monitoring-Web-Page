import {DbgConsoleLog, GetConfiguration, GetCurrentServer, GetAutoRefreshState, GetAutoRefreshInterval} from './main.js';
//import { BothFormatter, DlgFormatter, MemFormatter, ParamFormatter, StatusFormatter } from './formaters';
import * as formatters from './formaters/index.js';
import {Observer} from './observerStuff.js';
import { TABS_CONTAINER_SELECTOR, TAB_ITEM_SELECTOR, TAB_CONTENT } from './params.js';

const moduleName = "tabs"

class TabsClass extends Observer {
    constructor() {
        super();
        this.currentTab = null;
        this.sleepInterval = 1000
        this.lastUpdateTime = 0;
    }

    getActiveTabStorageKey() {
        const serverName = GetCurrentServer().split(':').pop();  // Витягуємо назву сервера з URL
        return `${serverName}_activeTab`;
    }

    getServerRoutes(serverUrl) {
        const config = GetConfiguration(); 
        const currentServerConfig = config.servers.find(server => server.url === serverUrl);
        if (currentServerConfig && currentServerConfig.tabs) {
            return currentServerConfig.tabs;            
        } else {
            DbgConsoleLog(`Unable to find tabs configuration for the server ${serverUrl}`, moduleName,"getServerRoutes" );
        }
    }

    async init() {
        const methodName = "init"       
        const serverUrl = GetCurrentServer(); 

        this.clearTabs()
        const routes = this.getServerRoutes(serverUrl);
        if (routes) {
            this.populateTabs(routes);
        } else {
            DbgConsoleLog(`No tabs for ${serverUrl}`, moduleName,methodName );
        }   
             
        
        this.startAutoRefresh();
    }

    setSavedTabActive() {        
        const savedActiveTab = JSON.parse(localStorage.getItem(this.getActiveTabStorageKey()));
        if (savedActiveTab) {
            this.setActiveTab(savedActiveTab);
        }
        DbgConsoleLog(`savedActiveTab = ${savedActiveTab}`,moduleName, "setSavedTabActive");
    }

    async startAutoRefresh(){
        const methodName = "startAutoRefresh"
        
        DbgConsoleLog(`Sub-process 'AutoRefresh' started`, moduleName, methodName);
        while (true){    
            const currentTime = Date.now();        
            const isAutoRefreshOn = GetAutoRefreshState()
            DbgConsoleLog(`isAutoRefreshOn = ${isAutoRefreshOn}`, moduleName, methodName);
            if (isAutoRefreshOn) {
                const server = GetCurrentServer() 
                const refreshInterval = GetAutoRefreshInterval()
                
                DbgConsoleLog(`autoRefreshInterval: ${refreshInterval}`, moduleName, methodName);
                DbgConsoleLog(`server: ${server}`, moduleName, methodName);
                if (this.currentTab) {
                    DbgConsoleLog(`this.currentTab: ${this.currentTab}`, moduleName, methodName);
                    DbgConsoleLog(`this.currentTab.routes is array: ${Array.isArray(this.currentTab.routes)}`, moduleName, methodName );
                }
                if (currentTime - this.lastUpdateTime >= refreshInterval && this.currentTab && isAutoRefreshOn) {
                    const endpoints = this.currentTab.routes;
                    const contentArea = document.getElementById(TAB_CONTENT);
                    this.fetchDataAndRender(server, endpoints, contentArea) 
                }               
            }
            this.lastUpdateTime = currentTime; 
            // Sleep for a fixed, minimum interval (e.g., 1 second)
            await new Promise(resolve => setTimeout(resolve, this.sleepInterval));
        }
    }
    
    populateTabs(routes) {
        const tabsList = document.querySelector(TABS_CONTAINER_SELECTOR);
        routes.forEach(tab => {
            const li = document.createElement('li');
            li.textContent = tab.name.toUpperCase();
            li.addEventListener('click', this.onTabClick.bind(this, tab)); 
            tabsList.appendChild(li);
        });
        this.setSavedTabActive();
        DbgConsoleLog(`routes: ${routes}`,moduleName,"populateTabs")
    }
    
    clearTabs() {
        const tabsList = document.querySelector(TABS_CONTAINER_SELECTOR);
        tabsList.innerHTML = '';
    }

    onTabClick(tab) {
        const methodName = "onTabClick";
        this.setActiveTab(tab);
        if (this.currentTab && this.currentTab.routes) { 
            DbgConsoleLog(`Call fetchDataAndRender (${this.currentTab.routes})`, moduleName, methodName);
            const server = GetCurrentServer() 
            const endpoints = this.currentTab.routes;
            const contentArea = document.getElementById(TAB_CONTENT);
            this.fetchDataAndRender(server, endpoints, contentArea);
        } else {
            DbgConsoleLog(`Try handle click on ${tab.name} - fails`, moduleName, methodName);
        }       
    }
    
    setActiveTab(tab) {
        const methodName = "setActiveTab";
        DbgConsoleLog(`Setting active tab with route: ${tab.name}`, moduleName, methodName);
    
        const tabItems = document.querySelectorAll(TAB_ITEM_SELECTOR)

        tabItems.forEach(el => {
            el.classList.remove('active');
        });        
    
        const activeTabElement = Array.from(tabItems).find(el => el.textContent.toLowerCase() === tab.name.toLowerCase());
        if (activeTabElement) {
            activeTabElement.classList.add('active');
            this.currentTab = tab;
            DbgConsoleLog(`Found tab: ${JSON.stringify(this.currentTab)}`, moduleName, methodName);
            if (this.currentTab && this.currentTab.routes) { 
                this.fetchDataAndRender(this.currentTab.routes);
                DbgConsoleLog(`Tab content updated`, moduleName, methodName);
            }            
        }
        const tabKey = this.getActiveTabStorageKey()
        const tabValue = JSON.stringify(tab)
        localStorage.setItem(tabKey, tabValue);
        DbgConsoleLog(`set active tab: rey=${tabKey} value=${tabValue} - OK`, moduleName, methodName);
    }

    async fetchDataAndRender(server, endpoints, contentArea) {
        const methodName = "fetchDataAndRender";
        DbgConsoleLog(`server=${server}  endpoints=${endpoints}`, moduleName, methodName);
        try {
            const responses = await Promise.all(endpoints.map(endpoint => fetch(server + endpoint)));
            const dataArray = await Promise.all(responses.map(res => res.json()));

            
            const formatterName = this.currentTab.formatter;
            const formatterFunction = formatters[formatterName];
            const infoStr = `${formatterName} - ${formatterFunction}`  
            const formattedData = formatterFunction(dataArray)
            contentArea.innerHTML = '';
            contentArea.insertAdjacentHTML('beforeend', formattedData);          
        } catch (error) {
            DbgConsoleLog(`Error fetching data: ${error}`);
        }
    }


       
    async Update(){
        const methodName = "TabsClass.Update"
        DbgConsoleLog("Someone calls NotifyObservers", moduleName, methodName);
       
        const currentServer = GetCurrentServer();
        const autoRefreshState = GetAutoRefreshState();
        const autoRefreshInterval = GetAutoRefreshInterval();
        
        DbgConsoleLog(`currentServer: ${currentServer}, this.currServerAddr: ${this.currServerAddr}`, moduleName, methodName);

        const serverUrl = GetCurrentServer(); 
        this.clearTabs()
        const routes = this.getServerRoutes(serverUrl);
        if (routes) {
            this.populateTabs(routes);
            DbgConsoleLog(`Populate tabs for ${serverUrl}`, moduleName,methodName );
        } else {
            DbgConsoleLog(`No tabs for ${serverUrl}`, moduleName,methodName );
        }   
    }

}

/**
 * Deploys Tabs.
 * @returns {Observer} 
 */
export async function Deploy() {
    const tabsInstance = new TabsClass();
    DbgConsoleLog("Deploy Tabs instance - OK", moduleName, "Deploy"); 
    tabsInstance.init();
    return tabsInstance
}
