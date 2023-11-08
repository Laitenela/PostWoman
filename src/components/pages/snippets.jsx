import { observer } from "mobx-react-lite";
import TextInput from "../micro/textInput";
import AuthorizationForm from "../containers/formFields/authorizationForm";
import RequestBlockContainer from "../containers/requestBlockContainer/requestBlockContainer";
import KeysTable from "../containers/keysTable/keysTable";
import BodyForm from "../containers/formFields/bodyForm";
import ResponseKeysTable from "../containers/reponseKeysTable";
import axios from "axios";
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";


const Snippets = observer(() => {
  const snippetsStore = useLoaderData();

  const sendData = async (event) => {
    event.preventDefault();
    if(snippetsStore.activeRequest.requestStatus){
      snippetsStore.activeRequest.setRequestStatus(false);
      snippetsStore.activeRequest.abortController.abort();
      return;
    }

    const data = snippetsStore.getDataAplliedSnips();
    const requestOptions = {};
    const requestHeaders = {};
    let requestBody;

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
    snippetsStore.activeRequest.updateAbortController();
    requestOptions.signal = snippetsStore.activeRequest.abortController.signal;

    console.log(requestOptions);

    // const form = event.target;
    // const button = form.querySelector('.button');
    // button.innerHTML = "Отменить взлом";
    // snippetsStore.activeRequest.setRequestStatus(true);

    // try{
    //   const response = await axios(requestOptions);
    //   snippetsStore.setResponse(response);
    // } catch (err) {
    //   console.log(err);
    //   const response = err.response;
    //   const errorResponse = {data: `Code: ${err.code}.\nMessage: ${err.message}.\n\nHas response: ${Boolean(err.response)}\nCode: ${response?.status}\nStatusText: ${response?.statusText}\nData: ${response?.data}`}
    //   snippetsStore.setResponse(errorResponse);
    // }

    // snippetsStore.activeRequest.setRequestStatus(false);
    // button.innerHTML = "Взломать жёпу";

    // const element = document.getElementById('response-body');
    // navigator.clipboard.writeText(response.data);
    // var dlAnchorElem = document.getElementById('downloadAnchorElem');
    // dlAnchorElem.setAttribute("href", response.data);
    // dlAnchorElem.setAttribute("download", "response.json");
    // dlAnchorElem.click();
    // element.innerHTML = response.data.slice(0, 1000);
  }

  const setResponseToClipboard = (event) => {
    const selectionText = document.getSelection().toString();
    if(selectionText.length !== snippetsStore.activeRequest.response.body.length) return;
    event.preventDefault();
    navigator.clipboard.writeText(snippetsStore.activeRequest.response.mainData);
  }

  return (
    <>
    <div className="request-menu">

      <div className="snippet-select param-item">
        <select value={snippetsStore.activeSnippetId} onChange={(event) => snippetsStore.setActiveSnippetId(event.target.value)} className="snippet-select__selector" name="snippet" id="snippet-select">
          {snippetsStore.requests.map(request => {
            return <option value={request.id} key={request.id}>{request.name}</option>
          })}
        </select>
      </div>

      {/* <TextInput {...nameProps} /> */}
      <form onSubmit={sendData}>
        {snippetsStore.snips.map((snip, index) => {
          const snipProps = {};
          snipProps.placeholder = snip.description || snip.key;
          snipProps.className = "param-item";
          snipProps.value = snip.value;
          snipProps.setValue = (newValue) => snip.setValue(newValue);
          return <><TextInput {...snipProps} key={index} /></>
        })}
        <div className="submit-field">
          <button className="button" type="submit">Взломать жёпу</button>
        </div>
      </form>
    </div>
    
    <div className="response-menu">
      <RequestBlockContainer className="request-headers" title="BODY">
        <textarea onCopy={(event) => setResponseToClipboard(event)} value={snippetsStore.response.body} id="response-body" className="json-body" />
      </RequestBlockContainer>
      <RequestBlockContainer className="request-headers" title="HEADERS">
          <ResponseKeysTable paramRows={snippetsStore.response.headers}/>
      </RequestBlockContainer>
    </div>
    </>
  );
});

export default Snippets;
