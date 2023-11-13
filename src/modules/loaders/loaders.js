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
  console.log(params.id);
  const data = JSON.parse(localStorage.getItem('data'));
  const position = getPosition(data.requests, params.id);
  console.log(data.requests[position]);
  if(position === -1) return new ChainsStore(data);
  else return new ChainsStore(data.requests[position]);
}

routeLoader.soloRequest = ({ params }) => {
  const data = JSON.parse(localStorage.getItem('data'));
  const testData = {
    name: "",
    someIds: 0,
    url: "",
    method: "",
    authorization: {
      type: "bearer-auth",
      params: {
        "no-auth": {

        },
        "basic-auth": {
          login: '',
          password: '',
        },
        "bearer-auth": {
          token: '',
        }
      }
    },
    headers: [
      {
        key: 'User-Agent',
        value: 'Postwoman/0.0.1',
        description: ''
      },
      {
        key: 'Accept',
        value: '*/*',
        description: ''
      },
      {
        key: 'Accept-Encoding',
        value: 'gzip, deflate, br',
        description: ''
      },
      {
        key: 'Connection',
        value: 'keep-alive',
        description: ''
      },
    ],
    body: {
      type: "json",
      params: {
        "x-www-form-urlencoded": [
        ],
        "json": []
      },
      raws: {
        "json": "",
      }
    }
  }

  const position = getPosition(data.requests, params.id);
  if(position === -1) return new RequestStore(testData);
  else return new RequestStore(data.requests[position]);
};