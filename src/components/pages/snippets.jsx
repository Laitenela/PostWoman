import { observer } from "mobx-react-lite";
import { useLoaderData } from "react-router-dom";
import ChainSnippetForm from "../containers/chainSnippetForm";
import ResponseKeysTable from "../containers/reponseKeysTable";
import RequestSnippetForm from "../containers/requestSnippetForm";
import RequestBlockContainer from "../containers/requestBlockContainer/requestBlockContainer";

const Snippets = observer(() => {
  const snippetsStore = useLoaderData();

  return (
    <>
      <div onDrop={dropItem} onDragOver={dragOver} className="request-menu">
        <h2 className="request-head-title param-item">Request</h2>
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

        {snippetsStore.activeSnippetType === "request" && (
          <RequestSnippetForm onSubmit={(event) => snippetsStore.sendSoloRequest(event)} snippetsStore={snippetsStore} />
        )}
        {snippetsStore.activeSnippetType === "requestChains" && (
          <ChainSnippetForm
            hasActiveRequest={snippetsStore.hasActiveRequest}
            onSubmit={(event) => snippetsStore.sendChainsCollection(event)}
            snippetsStore={snippetsStore}
          />
        )}
      </div>

      <div className="response-menu">
      <h2 className="request-head-title param-item">Response</h2>
      <RequestBlockContainer className="request-headers" title="PUSHED RESPONSES">
          <div className="pushed-json-body json-body">
            {snippetsStore.pushedResponses.map((response, index) => 
              <div key={index} className="pushed-json-body__container">
                <div className="pushed-json-body__item">Request Name: {response.name}</div>
                <div className="pushed-json-body__item">Status: {response.request.status ? response.request.status : "Unsigned Error"}</div>
                {response.statusText && <div className="pushed-json-body__item">Status text: {response.statusText}</div>}
                <button onClick={() => copyToClipboard(response)} className="pushed-json-body__button button">Copy body</button>
              </div>
            )}
          </div>
        </RequestBlockContainer>
        <RequestBlockContainer className="request-headers" title="BODY">
          <button onClick={() => copyToClipboard(snippetsStore.response)} className="textarea-copy-button button">Copy all</button>
          <textarea
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

  function copyToClipboard (response){
    navigator.clipboard.writeText(response.mainData);
  }

  function dropItem (event){
    event.preventDefault();
    const id = event.dataTransfer.getData('id');
    snippetsStore.setActiveSnippetId(id);
  }

  function dragOver (event){
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
});

export default Snippets;
