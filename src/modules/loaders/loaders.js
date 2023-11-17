import { defaultLocalData } from "./defaultLocalStorage";
import { ChainsStore } from "../stores/chainStore";
import { DataStore } from "../stores/dataStore";
import { RequestStore } from "../stores/requestStore";
import { SnippetsStore } from "../stores/snippetsStore";
import { v4 as uuidv4 } from 'uuid';

export const routeLoader = {};

const getPosition = (requestsArray, id) => {
  let currentIndex = 0;
  for(let item of requestsArray){
    if(item.id === id) return currentIndex;
    currentIndex++;
  }
  return -1;
}

routeLoader.app = ({ params }) => {
  if(!localStorage.getItem('data')){
    localStorage.setItem('data', JSON.stringify({requests: [], groups: [{id: uuidv4(), name: "Fallback Group"}]}));
  }
  
  const dataStore = new DataStore(JSON.parse(localStorage.getItem('data')));

  return dataStore;
};

routeLoader.snippets = ({ params }) => {
  const data = JSON.parse(localStorage.getItem('data'));
  const snippetsStore = new SnippetsStore(data);
  return snippetsStore;
}

routeLoader.chain = ({ params }) => {
  const data = JSON.parse(localStorage.getItem('data'));
  const position = getPosition(data.requests, params.id);

  if(position === -1) return new ChainsStore(data);
  else return new ChainsStore(data.requests[position]);
}

routeLoader.soloRequest = ({ params }) => {
  const data = JSON.parse(localStorage.getItem('data'));
  const defaulData = defaultLocalData;

  const position = getPosition(data.requests, params.id);
  if(position === -1) return new RequestStore(defaulData);
  else return new RequestStore(data.requests[position]);
};