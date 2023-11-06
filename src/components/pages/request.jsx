import { observer } from "mobx-react-lite";
import { redirect, useLoaderData } from "react-router-dom";
import TextInput from "../micro/textInput";
import RequestBlockContainer from "../containers/requestBlockContainer/requestBlockContainer";
import KeysTable from "../containers/keysTable/keysTable";
import axios from 'axios';
import AuthorizationForm from "../containers/formFields/authorizationForm";
import BodyForm from "../containers/formFields/bodyForm";
import ResponseKeysTable from "../containers/reponseKeysTable";

const RequestPage = observer(() => {
  const requestStore = useLoaderData();

  const nameProps = {};
  nameProps.id = "requestName";
  nameProps.placeholder = "Уникальное имя запроса";
  nameProps.className = "param-item";
  nameProps.value = requestStore.name;
  nameProps.setValue = (newValue) => requestStore.setName(newValue);

  const methodProps = {};
  methodProps.id = "method";
  methodProps.placeholder = "Метод";
  methodProps.className = "param-item";
  methodProps.value = requestStore.method;
  methodProps.setValue = (newValue) => requestStore.changeMethod(newValue);

  const urlProps = {};
  urlProps.id = "url";
  urlProps.placeholder = "Url";
  urlProps.className = "param-item";
  urlProps.value = requestStore.url;
  urlProps.setValue = (newValue) => requestStore.changeUrl(newValue);

  const tokenProps = {};
  tokenProps.id = "token";
  tokenProps.placeholder = "Token";
  tokenProps.className = "param-item";
  tokenProps.value = requestStore.authorization.token;
  tokenProps.setValue = (newValue) => requestStore.changeToken(newValue);

  const addParam = async (parent, type, value) => {
    const typePositions = {
      'key': 0,
      'value': 1,
      'description': 2,
    }
    
    const id = await requestStore.addParam(parent, type, value);
    const newElements = document.querySelectorAll(`#${id} input[type="text"]`);
    newElements[typePositions[type]].focus();
  }

  const sendData = async (event) => {
    event.preventDefault();
    const data = requestStore.getData();
    const requestOptions = {};
    const requestHeaders = {};
    let requestBody;

    console.log(data);

    for(let item of data.headers){
      if(!item.enabled) continue;
      requestHeaders[item.key] = item.value;
    }

    for(let item of data.immutableHeaders){
      requestHeaders[item.key] = item.value;
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

    console.log(requestOptions);

    const response = await axios(requestOptions);
    console.log(response.data.length);
    requestStore.setResponse(response);
    // const element = document.getElementById('response-body');
    // navigator.clipboard.writeText(response.data);
    // var dlAnchorElem = document.getElementById('downloadAnchorElem');
    // dlAnchorElem.setAttribute("href", response.data);
    // dlAnchorElem.setAttribute("download", "response.json");
    // dlAnchorElem.click();
    // element.innerHTML = response.data.slice(0, 1000);
  }

  const saveToCollection = () => {
    const newId = requestStore.saveAsNew();
    window.location = `/soloRequest/${newId}`;
  }

  const saveThis = () => {
    const newId = requestStore.saveThis();
    window.location = `/soloRequest/${newId}`;
  }

  const setResponseToClipboard = (event) => {
    const selectionText = document.getSelection().toString();
    if(selectionText.length !== requestStore.response.body.length) return;
    event.preventDefault();
    navigator.clipboard.writeText(requestStore.response.mainData);
  }

  return (
    <>
    <div className="request-menu">
      <button onClick={() => saveThis()} className="save-button button">Сохранить</button>
      <button onClick={() => saveToCollection()} className="save-button button">Сохранить как новый</button>
      <TextInput {...nameProps} />
      <form onSubmit={sendData}>
        <TextInput {...methodProps} />
        <TextInput {...urlProps} />
        <AuthorizationForm authorization={requestStore.authorization}/>
        <RequestBlockContainer className="request-headers" title="HEADERS">
          <KeysTable immutableParams={requestStore.immutableHeaders} removeParam={(param) => requestStore.removeParam('header', param)} addParam={(type, value) => addParam('headers', type, value)} paramRows={requestStore.headers}/>
        </RequestBlockContainer>
        <BodyForm body={requestStore.body} addParam={addParam}/>
        <div className="submit-field">
          <button className="button" type="submit">Взломать жёпу</button>
        </div>
      </form>
    </div>
    
    <div className="response-menu">
      <RequestBlockContainer className="request-headers" title="BODY">
        <textarea onCopy={(event) => setResponseToClipboard(event)} value={requestStore.response.body} id="response-body" className="json-body" />
      </RequestBlockContainer>
      <RequestBlockContainer className="request-headers" title="HEADERS">
          <ResponseKeysTable paramRows={requestStore.response.headers}/>
      </RequestBlockContainer>
    </div>
    </>
  );
});

export default RequestPage;
