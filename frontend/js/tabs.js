import {DbgConsoleLog, GetConfiguration, GetCurrentServer, GetAutorefreshState, GetAutorefreshInterval} from './main.js';
//import { BothFormatter, DlgFormatter, MemFormatter, ParamFormatter, StatusFormatter } from './formaters';
//import {Formatter} from './formatter.js';
import {Observer} from './observerStuff.js';
import { TABS_CONTAINER_SELECTOR, TAB_ITEM_SELECTOR } from './params.js';

const moduleName = "tabs"

class TabsClass extends Observer {
    constructor() {
        super();
        // this.routes = [
        //     { name: "param", endpoints: ["/param"] },
        //     { name: "dlg", endpoints: ["/dlg"] },
        //     { name: "mem", endpoints: ["/mem"] },
        //     { name: "both", endpoints: ["/dlg", "/param"] },
        // ];
        this.formatterInstances = {};
        this.currentTab = null;
        this.refreshIntervalID = null;

    }

    getActiveTabStorageKey() {
        const serverName = GetCurrentServer().split(':').pop();  // Витягуємо назву сервера з URL
        return `${serverName}_activeTab`;
    }

    async init() {
        const methodName = "init"
        const config = GetConfiguration(); 
        const currentServerUrl = GetCurrentServer(); 

        this.clearTabs()
        const currentServerConfig = config.servers.find(server => server.url === currentServerUrl);
        if (currentServerConfig && currentServerConfig.tabs) {
            this.routes = currentServerConfig.tabs;
            this.populateTabs();
            DbgConsoleLog("populateTabs - OK", moduleName, methodName);
        } else {
            console.error("Unable to find tabs configuration for the current server");
        }
        
        const savedActiveTab = JSON.parse(localStorage.getItem(this.getActiveTabStorageKey()));


        if (savedActiveTab) {
            this.setActiveTab(savedActiveTab);

        }
        this.startAutoRefresh();
    }
    
    populateTabs() {
        const tabsList = document.querySelector(TABS_CONTAINER_SELECTOR);
        this.routes.forEach(tab => {
            const li = document.createElement('li');
            li.textContent = tab.name.toUpperCase();
            li.addEventListener('click', this.tabClickHandler.bind(this, tab)); 
            tabsList.appendChild(li);
        });
    }

    
    clearTabs() {
        const tabsList = document.querySelector(TABS_CONTAINER_SELECTOR);
        tabsList.innerHTML = '';
    }

    tabClickHandler(tab) {
        const methodName = "tabClickHandler";
        this.setActiveTab(tab);
        if (this.currentTab && this.currentTab.routes) { 
            DbgConsoleLog(`Call fetchData(${this.currentTab.routes})`, moduleName, methodName);
            this.fetchData(this.currentTab.routes);
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
                this.fetchData(this.currentTab.routes);
                DbgConsoleLog(`Tab content updated`, moduleName, methodName);
            }            
        }
    
        localStorage.setItem(this.getActiveTabStorageKey(), JSON.stringify(tab));
        DbgConsoleLog(`set active tab - OK`, moduleName, methodName);
    }
    

    async fetchData(endpoints) {
        const methodName = "fetchData";
        DbgConsoleLog("Provided endpoints:", moduleName, methodName, endpoints);
        DbgConsoleLog("this.currentTab existence:", moduleName, methodName, Boolean(this.currentTab));
        if (this.currentTab) {
            DbgConsoleLog("this.currentTab.routes existence:", moduleName, methodName, Boolean(this.currentTab.routes));
            DbgConsoleLog("this.currentTab.routes is array:", moduleName, methodName, Array.isArray(this.currentTab.routes));
        }
        try {
            const responses = await Promise.all(endpoints.map(endpoint => fetch(GetCurrentServer() + endpoint)));
            const dataArray = await Promise.all(responses.map(res => res.json()));
    
            const contentArea = document.getElementById('tab-content');
           
            dataArray.forEach((data, index) => {
                // const formatter = this.formatterInstances[this.currentTab.endpoints[index]];
                // if (formatter) {
                //     const formattedData = formatter.Render(data);
                //     contentArea.insertAdjacentHTML('beforeend', formattedData); 
                // }
                const formattedData = "<pre>" + JSON.stringify(data, null, 4) + "</pre>"; // перетворення дані в форматований JSON
                contentArea.innerHTML = '';
                contentArea.insertAdjacentHTML('beforeend', formattedData);
            });

            
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    startAutoRefresh() {
        const methodName = "startAutoRefresh";
        if (GetAutorefreshState()) {
            const interval = GetAutorefreshInterval() * 1000;
            this.refreshIntervalID = setInterval(() => {
                DbgConsoleLog(`Call fetchData(${this.currentTab.endpoints})`, moduleName, methodName);
                this.fetchData(this.currentTab.endpoints);
                DbgConsoleLog("Auto-refresh executed", moduleName, methodName);
            }, interval);
            DbgConsoleLog(`Auto-refresh started with interval: ${interval}ms`, moduleName, methodName);
        }
    }

    stopAutoRefresh() {
        if (this.refreshIntervalID) {
            clearInterval(this.refreshIntervalID);
            this.refreshIntervalID = null;
            DbgConsoleLog("Auto-refresh stopped", moduleName, "stopAutoRefresh");
        }
    }
       
    async Update(){
        const methodName = "TabsClass.Update"
        DbgConsoleLog("Someone calls NotifyObservers", moduleName, methodName);
       
        const currentServer = GetCurrentServer();
        const autoRefreshState = GetAutorefreshState();
        const autoRefreshInterval = GetAutorefreshInterval();
        
        DbgConsoleLog(`currentServer: ${currentServer}, this.currServerAddr: ${this.currServerAddr}`, moduleName, methodName);

        // Якщо сервер змінився
        if (currentServer !== this.currServerAddr) {
            this.clearTabs();
            await this.init(); // Ініціалізація нових вкладок для нового сервера
        }

        // Якщо стан автооновлення змінився
        if (autoRefreshState !== this.autoRefreshState) {
            if (autoRefreshState) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        }

        // Якщо інтервал автооновлення змінився
        if (autoRefreshInterval !== this.autoRefreshInterval && autoRefreshState) {
            this.stopAutoRefresh();
            this.startAutoRefresh();
        }

        // Оновлюємо поточний стан
        this.currServerAddr = currentServer;
        this.autoRefreshState = autoRefreshState;
        this.autoRefreshInterval = autoRefreshInterval;
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
