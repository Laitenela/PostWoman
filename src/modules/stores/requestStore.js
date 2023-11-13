import { makeAutoObservable, toJS } from "mobx";
import { Snip } from "./snippetsStore";
import { v4 as uuidv4 } from 'uuid';
import { DataStore } from "./dataStore";

export class RequestStore {
  some = 0;
  id = "";
  name = "";
  url = "";
  method = "GET";
  type = 'request';
  groupId;
  authorization;
  headers = [];
  immutableHeaders = [];
  abortController = new AbortController();
  requestStatus = false;
  response = {};
  body = {};

  constructor(data) {
    makeAutoObservable(this);
    if (!data) return;
    this.url = data.url;
    this.name = data.name;
    this.method = data.method;
    this.authorization = new Authorizaton(data.authorization, this);

    if(!data.groupId) this.groupId = DataStore.getOrCreateGroup();
    else this.groupId = data.groupId;
    // else this.groupId = data.groupId;

    if(!data.id) this.id = uuidv4();
    else this.id = data.id;
    
    this.someIds = data.someIds;
    this.response = new Response({});

    this.headers = [];
    for (let param of data.headers) {
      this.headers.push(new Param(param, this.someIds++));
    }

    this.body = new Body(data.body);
    for(let key of Object.keys(data.body.params)){
      for(let param of data.body.params[key]){
        const newParam = new Param(param, this.someIds++);
        this.body.addParam(newParam);
      }
    }
    console.log(this);
    this.updateAuthorization();
  }

  setGroupId(newGroupId){
    this.groupId = newGroupId;
  }

  setRequestStatus(bool){
    this.requestStatus = bool;
  }

  updateAbortController(){
    this.abortController = new AbortController();
  }

  setName(newValue){
    this.name = newValue;
  }

  getSnips(){
    const jsonData = JSON.stringify(this.getUsefulData());
    console.log(Snip.findSnips(jsonData));
    return Object.entries(Snip.findSnips(jsonData)).map((items) => `${items[0]}: ${items[1] ? items[1] : items[0]}`).join('\n');
  }

  saveAsNew(){
    const data = JSON.parse(localStorage.getItem('data'));
    const inner = toJS(this);
    const newId = uuidv4();
    inner.response = {};
    inner.id = newId;
    data.requests.push(inner);
    localStorage.setItem('data', JSON.stringify(data));
    this.id = newId;
    return newId;
  }

  getData(){
    return toJS(this);
  }

  getUsefulData(){
    const data = toJS(this);

    for(let key of Object.keys(data.authorization.params)){
      if(key === data.authorization.type) continue;
      delete data.authorization.params[key];
    }

    for(let key of Object.keys(data.body.params)){
      if(key === data.body.type) continue;
      delete data.body.params[key];
    }

    for(let key of Object.keys(data.body.raws)){
      if(key === data.body.type) continue;
      delete data.body.raws[key];
    }

    for(let i = 0; i < data.headers.length; i++){
      if(data.headers[i].enabled) continue;
      data.headers.splice(i--, 1);
    }

    delete data['response'];

    return data;
  }

  getHeadersIndex(paramId){
    let currentIndex = 0; 

    for(let item of this.headers){
      if(item.id === paramId) break;
      currentIndex++;
    }
    
    return currentIndex;
  }

  getBodyParamIndex(paramId){
    let currentIndex = 0; 
    for(let item of this.body.params){
      if(item.id === paramId) break;
      currentIndex++;
    }

    return currentIndex;
  }

  removeParam(container, paramId){
    if(container === 'header'){
      const index = this.getHeadersIndex(paramId);
      this.headers.splice(index, 1);
    }
    
    if(container === 'body'){
      this.body.removeParam(paramId);
    }
  }

  addParam(parent, type, value){
    const newParam = new Param(null, this.someIds++);
    newParam[type] = value;
    if(parent === 'body'){
      this.body.addParam(newParam);
      return this.body.params[this.body.type].at(-1).id;
    } else {
      this.headers.push(newParam);
      return this.headers.at(-1).id;
    }
  }

  changeMethod(value){
    this.method = value;
  }

  changeUrl(value){
    this.url = value;
  }

  setResponse(response){
    this.response = new Response(response);
  }

  changeToken(value){
    this.authorization.token = value;
  }

  saveThis(){
    const data = JSON.parse(localStorage.getItem('data'));
    const index = this.#findIdPosition(data.requests, this.id);
    const innerData = toJS(this);
    innerData.response = {};
    if(index === -1) data.requests.push(innerData);
    else data.requests[index] = innerData;
    localStorage.setItem('data', JSON.stringify(data));
    return this.id;
  }

  #findIdPosition(array, id){
    let currentIndex = 0;
    for(let item of array){
      if(item.id === id) return currentIndex;
      currentIndex++;
    }
    return -1;
  }

  #findImmutableIndex(key){
    let currentIndex = 0;
    for(let item of this.immutableHeaders){
      if(item.key === key) return currentIndex;
      currentIndex++;
    }
    return -1;
  }

  updateAuthorization(){
    const authIndex = this.#findImmutableIndex("Authorization");

    if(authIndex === -1){
      const authorization = {};
      authorization.key = 'Authorization';
      authorization.description = '';
      if (this.authorization.type === "bearer-auth"){
        authorization.value = `Bearer ${this.authorization.params["bearer-auth"].token}`;
      } else {
        authorization.value = "";
      }

      if(this.authorization.type === "basic-auth"){
        const login = this.authorization.params['basic-auth'].login;
        const password = this.authorization.params['basic-auth'].password;
        try{
          const baseValue = btoa(`${login}:${password}`);
          authorization.value = `Basic ${baseValue}`;
        } catch {
          authorization.value = ``;
        }
      }

      if(this.authorization.type !== "no-auth"){
        this.immutableHeaders.push(new Param(authorization, this.someIds++));
      }

      return;
    }

    if(this.authorization.type === "no-auth"){
      this.immutableHeaders.splice(authIndex, 1);
    }

    const authorizationHeader = this.immutableHeaders[authIndex];

    if(this.authorization.type === "basic-auth"){
      const login = this.authorization.params['basic-auth'].login;
      const password = this.authorization.params['basic-auth'].password;
      const baseValue = btoa(`${login}:${password}`);
      authorizationHeader.changeValue(`Basic ${baseValue}`);
    }

    if(this.authorization.type === "bearer-auth"){
      authorizationHeader.changeValue(`Bearer ${this.authorization.params["bearer-auth"].token}`);
    }
  }
}

export class Response {
  headers = [];
  body = "";
  mainData = "";
  constructor({headers = [], data = ""}){
    for(let key of Object.keys(headers)){
      this.headers.push({
        key, 
        value: headers[key], 
      });
    }
    this.body = data.slice(0, 1000);
    this.mainData = data;
  }
}

class Body {
  type = "x-www-form-urlencoded";
  params = {
    "x-www-form-urlencoded": [],
  }
  raws = {
    "json": ""
  }

  constructor(body){
    makeAutoObservable(this);
    this.type = body.type;
    this.raws = body.raws;
  }

  #getParamIndex(paramId){
    let currentIndex = 0; 
    for(let item of this.params[this.type]){
      if(item.id === paramId) break;
      currentIndex++;
    }

    return currentIndex;
  }

  setType(type){
    if(!(type in this.params)) this.params[type] = [];
    this.type = type;
  }

  setRaw(raw){
    if(!(this.type in this.raws)) this.raws[this.type] = "";
    this.raws[this.type] = raw;
  }

  addParam(param){
    if(!(this.type in this.params)) this.params[this.type] = [];
    this.params[this.type].push(param);
  }

  removeParam(paramId){
    const index = this.#getParamIndex(paramId);
    this.params[this.type].splice(index, 1);
  }

}

class Authorizaton {
  type = "no-auth";
  params = {};
  #updateImmutable;
  constructor(authorization, context){
    makeAutoObservable(this);
    this.#updateImmutable = context.updateAuthorization.bind(context);
    Object.assign(this, authorization);
  }

  setType(type){
    this.type = type;
    this.#updateImmutable();
  }

  setToken(token){
    this.params[this.type].token = token;
    this.#updateImmutable();
  }

  setLogin(login){
    this.params[this.type].login = login;
    this.#updateImmutable();
  }

  setPassword(password){
    this.params[this.type].password = password;
    this.#updateImmutable();
  }
}

export class Param {
  id;
  key = "";
  value = "";
  description = "";
  changeable = false;
  enabled = true;

  constructor(data = null, id) {
    makeAutoObservable(this);
    Object.assign(this, data);
    this.id = `param${id}`;
  }

  setEnabled(value){
    this.enabled = value;
  }

  changeKey(key){
    this.key = key;
  }

  changeValue(value){
    this.value = value;
  }

  changeDescription(description){
    this.description = description;
  }
}