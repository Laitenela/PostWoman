import { makeAutoObservable, toJS } from "mobx";
import { Snip } from "./snippetsStore";
import { v4 as uuidv4 } from 'uuid';
import { DataStore } from "./dataStore";

export class ChainsStore {
  type = 'requestChains';
  groupId = '';
  name = '';
  id = '';
  chains = [];
  constructor(data) {
    makeAutoObservable(this);

    if (data.name) this.name = data.name;

    if (!data.groupId) this.groupId = DataStore.getOrCreateGroup();
    else this.groupId = data.groupId;

    if (data.id) this.id = data.id;
    else this.id = uuidv4();

    this.chains = [];
    if (data.chains) {
      for (let chain of data.chains) {
        this.chains.push(new Chain(chain));
      }
    }
  }

  createChain(x = 0, y = 0, requests = []) {
    const chain = new Chain({});
    chain.setPosition(x, y);
    this.chains.push(chain);
    return chain;
  }

  setGroupId(newGroupId) {
    this.groupId = newGroupId;
  }

  setName(value) {
    this.name = value;
  }

  removeChain(index) {
    this.chains.splice(index, 1);
  }

  setChainPosition(index, x, y) {
    this.chains[index].setPosition(x, y);
  }

  getData() {
    return toJS(this);
  }

  getChainIndex(id) {
    let currentIndex = 0;
    for (let chain of this.chains) {
      if (chain.id === id) return currentIndex;
      currentIndex++;
    }
    return -1;
  }

  #findIdPosition(array, id) {
    let currentIndex = 0;
    for (let item of array) {
      if (item.id === id) return currentIndex;
      currentIndex++;
    }
    return -1;
  }

  saveAsNew() {
    const data = JSON.parse(localStorage.getItem('data'));
    data.requests.push(toJS(this));
    const newId = uuidv4();
    data.requests.at(-1).id = newId;
    localStorage.setItem('data', JSON.stringify(data));
    this.id = newId;
    return newId;
  }

  saveThis() {
    const data = JSON.parse(localStorage.getItem('data'));
    const index = this.#findIdPosition(data.requests, this.id);
    if (index === -1) data.requests.push(toJS(this));
    else data.requests[index] = toJS(this);
    localStorage.setItem('data', JSON.stringify(data));
    return this.id;
  }

  static constructSnippetData(id) {
    const data = JSON.parse(localStorage.getItem('data'));
    const resultSnippetData = {};

    let requestChains = null;
    for (let request of data.requests) {
      if (request.id === id) requestChains = request;
    }

    resultSnippetData.inputSnips = {};

    const chains = requestChains.chains;
    for (let chain of chains) {
      const chainItems = chain.chainItems;
      for (let chainItem of chainItems) {
        const updatedRequest = DataStore.getRequest(chainItem.id);
        if (chainItem.chainSnips?.length) {
          const usedSnips = {};
          const jsonRequest = JSON.stringify(updatedRequest);
          const snips = Snip.findSnips(jsonRequest);
          const snipKeys = Object.keys(snips);

          for (let snip of chainItem.chainSnips) {
            if (!(snip.key in snips)) continue;
            usedSnips[snip.key] = 1;
            if (snip.settings.type !== 'inherit') {
              //TODO: Сделать обработку остальных
              continue;
            }
            resultSnippetData.inputSnips[snip.key] = { description: snip.description };
          }

          for (let key of snipKeys) {
            if (usedSnips[key]) continue;
            resultSnippetData.inputSnips[key] = { description: snips[key] };
          }
        } else {
          const jsonRequest = JSON.stringify(this.request);
          const snips = Snip.findSnips(jsonRequest);
          for (let key of Object.keys(snips)) {
            resultSnippetData.inputSnips[key] = { description: snips[key] };
          }
        }
      }
    }

    resultSnippetData.chain = [];
    for (let chain of chains) {
      const chainItems = chain.chainItems;
      for (let chainItem of chainItems) {
        const requestObject = {};
        requestObject.requestData = DataStore.getRequest(chainItem.id);

        requestObject.notInheritSnips = {};
        for(let snip of chainItem.chainSnips){
          if(snip.settings.type === 'inherit') continue;
          requestObject.notInheritSnips[snip.key] = snip;
        }

        requestObject.getRequestAppliedSnips = (snips) => {
          let middleString = JSON.stringify(requestObject.requestData);
          for (let key of Object.keys(snips)) {
            if(key in requestObject.notInheritSnips) continue;
            const regexp = new RegExp(`\\{\\{${key}\\:[^\\'\\"\\}\\{]*\\}\\}`, "g");
            middleString = middleString.replaceAll(regexp, snips[key].value || "");
          }
          return JSON.parse(middleString);
        }

        requestObject.properties = chainItem.properties;
        resultSnippetData.chain.push(requestObject);
      }
    }

    return resultSnippetData;
  }
}

class Chain {
  id
  type = "chain";
  name = 'CHAIN';
  position = {
    x: 0,
    y: 0,
  }
  chainItems = [];
  constructor(chain) {
    makeAutoObservable(this);

    if (!chain.id) this.id = uuidv4();
    else this.id = chain.id;

    this.name = chain.name;

    if (chain.position) this.position = chain.position;
    else {
      this.position = {
        x: 20,
        y: 20,
      }
    }

    this.chainItems = [];
    if (chain.chainItems) {
      for (let chainItem of chain.chainItems) {
        this.chainItems.push(new ChainItem(chainItem));
      }
    }
  }

  setName(value){
    this.name = value;
  }

  pushRequest(request) {
    this.chainItems.push(new ChainItem({ request }));
  }

  removeItem(index) {
    this.chainItems.splice(index, 1);
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
}

class ChainItem {
  requestId = "";
  request = {};
  chainSnips = [];
  properties = [];
  constructor(data) {
    makeAutoObservable(this);

    this.requestId = data.request.id;

    this.request = DataStore.getRequest(this.requestId);

    this.properties = [];
    if (data.properties) {
      for (let property of data.properties) {
        this.properties.push(new Property(property));
      }
    }

    if (data.chainSnips) {
      const usedSnips = {};
      const jsonRequest = JSON.stringify(this.request);
      const snips = Snip.findSnips(jsonRequest);
      const snipKeys = Object.keys(snips);

      for (let item of data.chainSnips) {
        if (!(item.key in snips)) continue;
        usedSnips[item.key] = 1;
        this.chainSnips.push(new ChainSnip(item));
      }

      for (let key of snipKeys) {
        if (usedSnips[key]) continue;
        this.chainSnips.push(new ChainSnip({ key, description: snips[key] }));
      }
    } else {
      const jsonRequest = JSON.stringify(this.request);
      const snips = Snip.findSnips(jsonRequest);
      for (let key of Object.keys(snips)) {
        this.chainSnips.push(new ChainSnip({ key, description: snips[key] }));
      }
    }
  }

  removeProperty(index) {
    this.properties.splice(index, 1);
  }

  createNewProperty() {
    this.properties.push(new Property({
      type: 'console push',
      settings: {},
    }));
  }

  getSnips() {
    const snips = Snip.findObjectSnips();
    return snips;
  }
}

class Property {
  type = 'console push';
  possibleTypes = ['console push', 'parse and push to collection', 'forsed save to file'];
  settings = {};
  constructor(data) {
    makeAutoObservable(this);
    Object.assign(this, data);
    switch(this.type){
      case('console push'):
        this.settings = new ConsolePushProperties(data.settings);
        break;
      case('parse and push to collection'):
        this.settings = new ParseAndCollectProperties(data.settings);
        break;
      case('forsed save to file'):
        this.settings = new ParseAndCollectProperties(data.settings);
        break;
    }
  }

  setType(newType){
    if(this.type === newType) return;
    this.type = newType;
    switch(newType){
      case('console push'):
        this.settings = new ConsolePushProperties({});
        break;
      case('parse and push to collection'):
        this.settings = new ParseAndCollectProperties({});
        break;
      case('forsed save to file'):
        this.settings = new SaveResponseProperties({});
        break;
    }
  }
}

class ConsolePushProperties {
  properties = [];
  constructor(data) {
    makeAutoObservable(this);
    if (!data.properties) {
      this.properties.push(new PropertyKey({
        type: 'select',
        keyName: 'Log type',
        possibleValues: ['none', 'fill', 'push'],
        value: 'none'
      }))
    } else {
      this.properties.push(new PropertyKey(data.properties[0]));
    }
  }
}

class SaveResponseProperties {
  properties = [];
  constructor(data) {
    makeAutoObservable(this);
    if (!data.properties) {
      this.properties.push(new PropertyKey({
        type: 'text input',
        keyName: 'Save: File path',
        value: '',
      }));
      this.properties.push(new PropertyKey({
        type: 'select',
        keyName: 'Open: File Editor',
        possibleValues: ['none', 'VS Code'],
        value: 'none'
      }));
    } else {
      for(let property of data.properties){
        this.properties.push(new PropertyKey(property));
      }
    }
  }
}

class ParseAndCollectProperties {
  properties = [];
  constructor(data) {
    makeAutoObservable(this);
    if (!data.properties) {
      this.properties.push(new PropertyKey({
        type: 'text input',
        keyName: 'Search: The desired key',
        value: ''
      }));
      this.properties.push(new PropertyKey({
        type: 'text input',
        keyName: 'Saved: Name of the collected key',
        value: '',
      }))
    } else {
      for(let property of data.properties){
        this.properties.push(new PropertyKey(property));
      }
    }
  }
}

class PropertyKey {
  type = '';
  keyName = '';
  possibleValues = [];
  value = '';
  constructor(data) {
    makeAutoObservable(this);
    Object.assign(this, data);
  }

  setValue(newValue) {
    this.value = newValue;
  }
}

class ChainSnip {
  key = "";
  description = "";
  settings = {};
  constructor(data) {
    makeAutoObservable(this);

    Object.assign(this, data);

    if (!this.settings.type) {
      this.settings.type = 'inherit'
    }
  }

  setSearching(value) {
    this.settings.searchingKey = value;
  }

  setType(type) {
    this.settings.type = type;
  }
}