import { makeAutoObservable, toJS } from "mobx";
import { Param, RequestStore, Response } from "./requestStore";
import { ChainsStore } from "./chainStore";
import { DataStore } from "./dataStore";

export class SnippetsStore {
  activeSnippetType = "request";
  activeSnippetId = "";
  chainData = {};
  requests = [];
  activeRequest = {};
  response = {};
  snips = [];

  constructor(data) {
    makeAutoObservable(this);
    this.response = new Response({});
    this.requests = data.requests;
    this.activeSnippetId = this.requests[0]?.id;
    this.activeSnippetType = this.requests[0]?.type;
    if (this.activeSnippetType === 'request') {
      this.#updateSnips();
    } else if (this.activeSnippetType === 'requestChains') {
      this.chainData = new ChainData(0, this.requests);
    }
  }

  getDataAplliedSnips() {
    let middleString = JSON.stringify(this.activeRequest.getUsefulData());
    for (let snip of this.snips) {
      const regexp = new RegExp(`\\{\\{${snip.key}\\:[^\\'\\"\\}\\{]*\\}\\}`, "g");
      middleString = middleString.replaceAll(regexp, snip.value || "");
    }
    const requestCopy = JSON.parse(middleString);
    const newStore = new RequestStore(requestCopy);
    return newStore.getData();
  }

  setActiveSnippetId(newId) {
    console.log(newId);
    if (this.activeSnippetId === newId) return;
    this.activeSnippetId = newId;

    const index = this.#findPosition(this.activeSnippetId);
    this.activeSnippetType = this.requests[index].type;

    if (this.activeSnippetType === 'request') {
      this.#updateSnips();
    } else if (this.activeSnippetType === 'requestChains') {
      this.chainData = new ChainData(index, this.requests);
    }
  }

  #updateSnips() {
    const index = this.#findPosition(this.activeSnippetId);
    if (index === -1) return;

    this.activeRequest = new RequestStore(this.requests[index]);

    const newSnips = Snip.findSnips(JSON.stringify(this.activeRequest.getUsefulData()));

    this.snips = [];
    for (let snip of Object.entries(newSnips)) {
      this.snips.push(new Snip(snip));
    }

    console.log(this.#getSnipsObject());
  }

  #getSnipsObject() {
    const object = {};
    for (let snip of this.snips) {
      object[snip.key] = snip.value;
    }
    return object;
  }

  #findPosition(requestId) {
    let currentIndex = 0;
    for (let item of this.requests) {
      if (item.id === requestId) return currentIndex;
      currentIndex++;
    }
    return -1;
  }

  static findRequest(id, requests) {
    for (let request of requests) {
      if (request.id === id) return request;
    }

    return null;
  }

  setResponse(response) {
    this.response = new Response(response);
  }
}

export class Snip {
  key = "";
  value = "";
  description = "";

  constructor([key, description]) {
    makeAutoObservable(this);
    this.key = key;
    this.description = description;
  }

  setValue(value) {
    this.value = value;
  }

  static findSnips(string) {
    // eslint-disable-next-line no-useless-escape
    const reqexp = /\{\{[^\'\"\}\{]*[^\'\"\}\{]*\}\}/g;
    const array = string.match(reqexp);
    const snips = {};
    array?.forEach((item) => {
      // eslint-disable-next-line no-useless-escape
      const [key, description] = item.replaceAll(/[\{\}]/g, "").split(":");
      if (snips[key]) return;
      snips[key] = description;
    });
    return snips;
  }

  static findObjectSnips(object) {
    const string = JSON.stringify(object);
    return Snip.findSnips(string);
  }
}

class ChainData {
  inputSnips = [];
  chainsCollection = [];
  constructor(chainIndex, requests) {
    let requestChains = requests[chainIndex];

    const chains = requestChains.chains;
    const middleInputSnips = {};
    for (let chain of chains) {
      const chainItems = chain.chainItems;
      for (let chainItem of chainItems) {
        const updatedRequest = SnippetsStore.findRequest(chainItem.requestId, requests);
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
            middleInputSnips[snip.key] = { description: snip.description };
          }

          for (let key of snipKeys) {
            if (usedSnips[key]) continue;
            middleInputSnips[key] = { description: snips[key] };
          }
        } else {
          const jsonRequest = JSON.stringify(updatedRequest);
          const snips = Snip.findSnips(jsonRequest);
          for (let key of Object.keys(snips)) {
            middleInputSnips[key] = { description: snips[key] };
          }
        }
      }
    }

    this.inputSnips = [];
    for(let key of Object.keys(middleInputSnips)){
      this.inputSnips.push(new Snip([key, middleInputSnips[key].description]));
    }

    this.chainsCollection = [];
    for (let chain of chains) {
      const chainRequests = [];
      const chainItems = chain.chainItems;
      for (let chainItem of chainItems) {
        chainRequests.push(new ChainRequest(chainItem, requests));
      }
      this.chainsCollection.push(chainRequests);
    }
  }
}

class ChainRequest{
  requestData = {};
  abortController = new AbortController();
  notInheritSnips = {};
  properties = [];
  constructor(chainRequest, requests){
    this.requestData = SnippetsStore.findRequest(chainRequest.requestId, requests);
    for (let snip of chainRequest.chainSnips) {
      if (snip.settings.type === 'inherit') continue;
      this.notInheritSnips[snip.key] = snip;
    }

    this.properties = chainRequest.properties;
  }

  updateAbortController(){
    this.abortController = new AbortController();
  }

  getRequestAppliedSnips(snips){
    let middleString = JSON.stringify(this.requestData);
    for (let snip of snips) {
      if (snip.key in this.notInheritSnips) continue;
      const regexp = new RegExp(`\\{\\{${snip.key}\\:[^\\'\\"\\}\\{]*\\}\\}`, "g");
      middleString = middleString.replaceAll(regexp, snip.value || "");
    }
    return JSON.parse(middleString);
  }

  applySnip(data, snip){
    let middleString = JSON.stringify(data);
    const regexp = new RegExp(`\\{\\{${snip.key}\\:[^\\'\\"\\}\\{]*\\}\\}`, "g");
    middleString = middleString.replaceAll(regexp, snip.value || "");
    return JSON.parse(middleString);
  }

  findKeyFromJSON(key, json){
    const getValue = (key, object) => {
      if(typeof object !== 'object') return undefined;
      if(key in object) return object[key];

      for(let objectKey of Object.keys(object)){
        const value = getValue(key, object[objectKey]);
        if(value !== undefined) return value;
      }

      return undefined;
    }

    try{
      const data = JSON.parse(json);
      const value = getValue(key, data);

      if(value === undefined) return "";
      else return value;
    } catch (err) {
      return "";
    }
  }
}