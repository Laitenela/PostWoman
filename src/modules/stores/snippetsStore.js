import { makeAutoObservable, toJS } from "mobx";
import { Param, RequestStore, Response } from "./requestStore";

export class SnippetsStore {
  activeSnippetId = "";
  requests = [];
  activeRequest = {};
  response = {};
  snips = [];

  constructor(data) {
    makeAutoObservable(this);
    this.response = new Response({});
    this.requests = data.requests;
    this.activeSnippetId = this.requests[0]?.id;
    this.#updateSnips();
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
    if (this.activeSnippetId === newId) return;
    this.activeSnippetId = newId;
    this.#updateSnips();
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
}
