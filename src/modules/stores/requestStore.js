import { makeAutoObservable, toJS } from "mobx";
import { v4 as uuidv4 } from 'uuid';

export class RequestStore {
  id = "";
  name = "";
  someIds = 0;
  url = "";
  method = "GET";
  authorization;
  headers = [];
  immutableHeaders = [];
  response = {};
  body = {};

  constructor(data) {
    makeAutoObservable(this);
    if (!data) return;

    this.url = data.url;
    this.name = data.name;
    this.method = data.method;
    this.authorization = new Authorizaton(data.authorization, this);

    if(!data.id) this.id = uuidv4();
    else this.id = data.id;
    
    this.someIds = data.someIds;
    this.response = new Response({});
    console.log(this.response);

    this.headers = [];
    for (let param of data.headers) {
      this.headers.push(new Param(param, this.someIds++));
    }

    this.body = new Body(data.body);
    for(let key of Object.keys(data.body.params)){
      this.body.setType(key);
      for(let param of data.body.params[key]){
        const newParam = new Param(param, this.someIds++);
        this.body.addParam(newParam);
      }
    }
    
    this.updateAuthorization();
  }

  setName(newValue){
    this.name = newValue;
  }

  saveAsNew(){
    const data = JSON.parse(localStorage.getItem('data'));
    data.requests.push(toJS(this));
    const newId = uuidv4();
    data.requests.at(-1).id = newId;
    data.requests.at(-1).response = {};
    localStorage.setItem('data', JSON.stringify(data));
    return newId;
  }

  getData(){
    return toJS(this);
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
    if(index === -1) data.requests.push(toJS(this));
    else data.requests[index] = toJS(this);
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
        const baseValue = btoa(`${login}:${password}`);
        authorization.value = `Basic ${baseValue}`;
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

class Response {
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
