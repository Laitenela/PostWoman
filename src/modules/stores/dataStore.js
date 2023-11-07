import { makeAutoObservable, toJS } from "mobx";

export class DataStore {
  requests = [];
  constructor(data){
    makeAutoObservable(this);
    this.requests = data.requests;
  }

  #findPosition(requestId){
    let currentIndex = 0;
    console.log('here');
    for(let item of this.requests){
      if(item.id === requestId) return currentIndex;
      currentIndex++;
    }
    return -1;
  }

  removeRequest(requestId){
    const index = this.#findPosition(requestId);
    this.requests.splice(index, 1);
    localStorage.setItem('data', JSON.stringify(toJS(this)));
  }

  pushNew(request){
    console.log(request);
    this.requests.push(request);
  }
}