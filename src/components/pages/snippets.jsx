import { observer } from "mobx-react-lite";
import TextInput from "../micro/textInput";
import AuthorizationForm from "../containers/formFields/authorizationForm";
import RequestBlockContainer from "../containers/requestBlockContainer/requestBlockContainer";
import KeysTable from "../containers/keysTable/keysTable";
import BodyForm from "../containers/formFields/bodyForm";
import ResponseKeysTable from "../containers/reponseKeysTable";
import axios from "axios";
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";
import RequestSnippetForm from "../containers/requestSnippetForm";
import ChainSnippetForm from "../containers/chainSnippetForm";
import { useState } from "react";

const Snippets = observer(() => {
  const snippetsStore = useLoaderData();
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  const sendRequestData = async (event) => {
    event.preventDefault();
    if (snippetsStore.activeRequest.requestStatus) {
      snippetsStore.activeRequest.setRequestStatus(false);
      snippetsStore.activeRequest.abortController.abort();
      return;
    }

    const data = snippetsStore.getDataAplliedSnips();
    const requestOptions = {};
    const requestHeaders = {};
    let requestBody;

    for (let item of data.headers) {
      if (!item.enabled) continue;
      requestHeaders[item.key] = item.value;
    }

    for (let item of data.immutableHeaders) {
      requestHeaders[item.key] = item.value;
    }

    if (data.body.type === "x-www-form-urlencoded") {
      requestBody = new URLSearchParams();
      for (let item of data.body.params[data.body.type]) {
        if (!item.enabled) continue;
        requestBody.append(item.key, item.value);
      }
    }

    if (data.body.type === "json") {
      requestBody = data.body.raws.json;
    }

    requestOptions.method = data.method;
    requestOptions.url = data.url;
    requestOptions.headers = requestHeaders;
    requestOptions.data = requestBody;
    requestOptions.transformResponse = (data) => data;
    snippetsStore.activeRequest.updateAbortController();
    requestOptions.signal = snippetsStore.activeRequest.abortController.signal;

    const form = event.target;
    const button = form.querySelector('.button');
    button.innerHTML = "Отменить";
    snippetsStore.activeRequest.setRequestStatus(true);

    try{
      const response = await axios(requestOptions);
      snippetsStore.setResponse(response);
    } catch (err) {
      console.log(err);
      const response = err.response;
      const errorResponse = {data: `Code: ${err.code}.\nMessage: ${err.message}.\n\nHas response: ${Boolean(err.response)}\nCode: ${response?.status}\nStatusText: ${response?.statusText}\nData: ${response?.data}`}
      snippetsStore.setResponse(errorResponse);
    }

    snippetsStore.activeRequest.setRequestStatus(false);
    button.innerHTML = "Отправить";
  };

  const sendChainRequest = async (collection, chainRequest) => {
    let middleData = chainRequest.getRequestAppliedSnips(snippetsStore.chainData.inputSnips);
    for (let snipKey of Object.keys(chainRequest.notInheritSnips)) {
      if (chainRequest.notInheritSnips[snipKey].settings.type === "from collection") {
        const key = chainRequest.notInheritSnips[snipKey].settings.searchingKey;
        middleData = chainRequest.applySnip(middleData, { key: snipKey, value: collection[key] });
      }
    }

    const data = middleData;

    const requestOptions = {};
    const requestHeaders = {};
    let requestBody;

    for (let item of data.headers) {
      if (!item.enabled) continue;
      requestHeaders[item.key] = item.value;
    }

    for (let item of data.immutableHeaders) {
      requestHeaders[item.key] = item.value;
    }

    if (data.body.type === "x-www-form-urlencoded") {
      requestBody = new URLSearchParams();
      for (let item of data.body.params[data.body.type]) {
        if (!item.enabled) continue;
        requestBody.append(item.key, item.value);
      }
    }

    if (data.body.type === "json") {
      requestBody = data.body.raws.json;
    }

    requestOptions.method = data.method;
    requestOptions.url = data.url;
    requestOptions.headers = requestHeaders;
    requestOptions.data = requestBody;
    requestOptions.transformResponse = (data) => data;
    chainRequest.updateAbortController();
    requestOptions.signal = chainRequest.abortController.signal;

    let chainResponse;
    try {
      const response = await axios(requestOptions);
      chainResponse = response;
    } catch (err) {
      console.log(err);
      const response = err.response;
      const errorResponse = {
        data: `Code: ${err.code}.\nMessage: ${err.message}.\n\nHas response: ${Boolean(err.response)}\nCode: ${
          response?.status
        }\nStatusText: ${response?.statusText}\nData: ${response?.data}`,
      };
      chainResponse = errorResponse;
    }

    for(let property of chainRequest.properties){
      const type = property.type;
      switch(type){
        case ("parse and push to collection"): {
          const searchingKey = property.settings.properties[0].value;
          const collectionKey = property.settings.properties[1].value;
          collection[collectionKey] = chainRequest.findKeyFromJSON(searchingKey, chainResponse.data);
          continue;
        }
        case ("console push"): {
          const pushingType = property.settings.properties[0].value;
          if(pushingType === 'none') continue;
          if(pushingType === 'fill') snippetsStore.setResponse(chainResponse);
          continue;
        }
      }
    }

  };

  const sendChainRequests = async (collection, chainRequests) => {
    for (let chainRequest of chainRequests) {
      await sendChainRequest(collection, chainRequest);
    }
  };

  const sendChainsCollection = async (event) => {
    event.preventDefault();

    if (hasActiveRequest) {
      for (let chainRequests of snippetsStore.chainData.chainsCollection) {
        for (let chainRequest of chainRequests) {
          chainRequest.abortController.abort();
        }
      }
      setHasActiveRequest(false);
      return;
    }

    const collection = {};
    setHasActiveRequest(true);
    const sendedChains = [];
    for (let chainRequests of snippetsStore.chainData.chainsCollection) {
      sendedChains.push(sendChainRequests(collection, chainRequests));
    }
    await Promise.allSettled(sendedChains);
    setHasActiveRequest(false);
  };

  const setResponseToClipboard = (event) => {
    const selectionText = document.getSelection().toString();
    if (selectionText.length !== snippetsStore.activeRequest.response.body.length) return;
    event.preventDefault();
    navigator.clipboard.writeText(snippetsStore.activeRequest.response.mainData);
  };

  return (
    <>
      <div className="request-menu">
        <div className="snippet-select param-item">
          <select
            value={snippetsStore.activeSnippetId}
            onChange={(event) => snippetsStore.setActiveSnippetId(event.target.value)}
            className="snippet-select__selector"
            name="snippet"
            id="snippet-select"
          >
            {snippetsStore.requests.map((request) => {
              return (
                <option value={request.id} key={request.id}>
                  {request.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* <TextInput {...nameProps} /> */}
        {snippetsStore.activeSnippetType === "request" && (
          <RequestSnippetForm onSubmit={sendRequestData} snippetsStore={snippetsStore} />
        )}
        {snippetsStore.activeSnippetType === "requestChains" && (
          <ChainSnippetForm
            hasActiveRequest={hasActiveRequest}
            onSubmit={sendChainsCollection}
            snippetsStore={snippetsStore}
          />
        )}
      </div>

      <div className="response-menu">
        <RequestBlockContainer className="request-headers" title="BODY">
          <button className="textarea-copy-button button">Copy all</button>
          <textarea
            onCopy={(event) => setResponseToClipboard(event)}
            value={snippetsStore.response.body}
            id="response-body"
            className="json-body"
          />
        </RequestBlockContainer>
        <RequestBlockContainer className="request-headers" title="HEADERS">
          <ResponseKeysTable paramRows={snippetsStore.response?.headers} />
        </RequestBlockContainer>
      </div>
    </>
  );
});

export default Snippets;
