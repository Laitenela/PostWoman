import { makeAutoObservable, toJS } from "mobx";
import { Snip } from "./snippetsStore";
import { v4 as uuidv4 } from 'uuid';
import { DataStore } from "./dataStore";
import axios from "axios";

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
    if(newValue.length > 22) return;
    this.name = newValue;
  }

  getSnips(){
    const jsonData = JSON.stringify(this.getUsefulData());
    return Object.entries(Snip.findSnips(jsonData)).map((items) => `${items[0]}: ${items[1] ? items[1] : items[0]}`).join('\n');
  }

  saveAsNew(){
    const data = JSON.parse(localStorage.getItem('data'));
    const innerData = toJS(this);
    for(let key of Object.keys(innerData.body.params)){
      if(key !== innerData.body.type) innerData.body.params[key] = []; 
    }
    for(let key of Object.keys(innerData.body.raws)){
      if(key !== innerData.body.type) innerData.body.raws[key] = []; 
    }
    const newId = uuidv4();
    innerData.response = {};
    innerData.id = newId;
    data.requests.push(innerData);
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
    for(let key of Object.keys(innerData.body.params)){
      if(key !== innerData.body.type) innerData.body.params[key] = []; 
    }
    for(let key of Object.keys(innerData.body.raws)){
      if(key !== innerData.body.type) innerData.body.raws[key] = []; 
    }
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

  async sendRequest(event){
    event.preventDefault();
    if(this.requestStatus){
      this.setRequestStatus(false);
      this.abortController.abort();
      return;
    }

    // const content = "File content to save";
    // const element = document.createElement("a");
    // const file = new Blob([content], {type: "text/plain"});
    // element.href = URL.createObjectURL(file);
    // element.download = "file.txt";
    // element.click();

    const data = this.getData();
    const requestOptions = {};
    const requestHeaders = {};
    let requestBody;

    for(let item of data.headers){
      if(!item.enabled) continue;
      requestHeaders[`__-${item.key}`] = item.value;
    }

    for(let item of data.immutableHeaders){
      requestHeaders[`__-${item.key}`] = item.value;
    }

    if(data.body.type === "x-www-form-urlencoded"){
      requestBody = new URLSearchParams();
      for(let item of data.body.params[data.body.type]){
        if(!item.enabled) continue;
        requestBody.append(item.key, item.value);
      }
    }

    if(data.body.type === "json"){
      requestBody = data.body.raws.json;
    }

    requestOptions.method = data.method;
    requestOptions.url = data.url;
    requestOptions.headers = requestHeaders;
    requestOptions.data = requestBody;
    requestOptions.transformResponse = (data) => data;
    this.updateAbortController();
    requestOptions.signal = this.abortController.signal;

    const form = event.target;
    const button = form.querySelector('.button');
    button.innerHTML = "Отменить";
    this.setRequestStatus(true);

    try{
      const response = await axios(requestOptions);
      this.setResponse(response);
    } catch (err) {
      console.log(err);
      const response = err.response;
      const errorResponse = {data: `Code: ${err.code}.\nMessage: ${err.message}.\n\nHas response: ${Boolean(err.response)}\nCode: ${response?.status}\nStatusText: ${response?.statusText}\nData: ${response?.data}`}
      this.setResponse(errorResponse);
    }

    this.setRequestStatus(false);
    button.innerHTML = "Отправить";
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

  setBodyToClipboard(){
    navigator.clipboard.writeText(this.response.mainData);
  }
}

export class Response {
  headers = [];
  body = "";
  name = "";
  mainData = "";
  status = '';
  statusText = '';
  constructor({status, statusText, headers = [], data = "", request}){
    for(let key of Object.keys(headers)){
      this.headers.push({
        key, 
        value: headers[key], 
      });
    }
    this.status = status;
    this.statusText = statusText;
    this.body = data.slice(0, 1000);
    this.mainData = data;
    this.request = request;
  }

  setName(value){
    this.name = value;
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