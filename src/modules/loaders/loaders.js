import { DataStore } from "../stores/dataStore";
import { RequestStore } from "../stores/requestStore";

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
  console.log('хуй');
  if(!localStorage.getItem('data')){
    localStorage.setItem('data', JSON.stringify({requests: []}));
  }
  
  const dataStore = new DataStore(JSON.parse(localStorage.getItem('data')));

  return dataStore;
};

routeLoader.soloRequest = ({ params }) => {
  const data = JSON.parse(localStorage.getItem('data'));
  const testData = {
    name: "",
    someIds: 0,
    url: "https://vk.com/",
    method: "post",
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