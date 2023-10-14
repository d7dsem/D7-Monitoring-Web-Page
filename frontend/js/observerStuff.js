import {DbgConsoleLog} from './main.js';
const moduleName = "observerStuff"

// Observer
export class Observer {
    Update() {
        throw new Error("Update method must be implemented");
    }
}

// Subject
export class Subject {
    constructor() {
        this.observers = [];
    }

    AddObserver(observer) {
        this.observers.push(observer);
        DbgConsoleLog(`Add observer ${observer}`, moduleName, "AddObserver");
    }

    RemoveObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
            DbgConsoleLog(`Rem observer ${observer}`, moduleName, "RemoveObserver");
        }
    }

    NotifyObservers() {
        DbgConsoleLog(`List of observers: ${JSON.stringify(this.observers)}`, moduleName, "NotifyObservers");
        
        for (let observer of this.observers) {
            DbgConsoleLog(`Notify ${observer}`, moduleName, "NotifyObservers");
            observer.Update();
        }
    }
}
