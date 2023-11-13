import { makeAutoObservable, toJS } from "mobx";
import { v4 as uuidv4 } from 'uuid';

export class DataStore {
  requests = [];
  groups = [];
  groupedRequests = [];
  constructor(data){
    makeAutoObservable(this);
    this.requests = data.requests;
    this.groups = data.groups ? data.groups : [];
    this.#updateGroupedRequests();
  }

  update(){
    const data = JSON.parse(localStorage.getItem('data'));
    this.requests = data.requests;
    this.groups = data.groups ? data.groups : [];
    this.#updateGroupedRequests();
  }

  static getOrCreateGroup(){
    const data = JSON.parse(localStorage.getItem('data'));
    if(data.groups.length) return data.groups[0].id;
    data.groups.push({name: 'Fallback Group', id: uuidv4()});
    localStorage.setItem('data', JSON.stringify(data));
    return data.groups[0].id;
  }

  createGroup(name){
    this.groups.push({name, id: uuidv4()});
    localStorage.setItem('data', this.getJSONData());
    this.#updateGroupedRequests();
  }

  #updateGroupedRequests(){
    const groups = {};
    for(let item of this.groups){
      groups[item.id] = Object.assign({}, item);
    }

    for(let item of this.requests){
      if(!groups[item.groupId]) continue;
      if(!groups[item.groupId].requests){
        groups[item.groupId].requests = [];
      }

      groups[item.groupId].requests.push(item);
    }

    this.groupedRequests = [];
    for(let key of Object.keys(groups)){
      this.groupedRequests.push(groups[key]);
    }
  }

  static getRequest(id){
    const globalData = JSON.parse(localStorage.getItem('data'));
    for(let request of globalData.requests){
      if(request.id === id) return request;
    }

    return null;
  }

  #findPosition(requestId){
    let currentIndex = 0;
    for(let item of this.requests){
      if(item.id === requestId) return currentIndex;
      currentIndex++;
    }
    return -1;
  }

  removeRequest(requestId){
    console.log('here');
    const index = this.#findPosition(requestId);
    this.requests.splice(index, 1);
    localStorage.setItem('data', JSON.stringify(toJS(this)));
    this.#updateGroupedRequests();
  }

  getRequest(requestId){
    const requestIndex = this.#findPosition(requestId);
    return this.requests[requestIndex];
  }

  getJSONData(){
    return localStorage.getItem('data');
  }

  pushNew(request){
    this.requests.push(request);
    this.#updateGroupedRequests();
  }
}