import { observer } from "mobx-react-lite";
import TextInput from "../micro/textInput";
import BodyForm from "../containers/formFields/bodyForm";
import KeysTable from "../containers/keysTable/keysTable";
import ResponseKeysTable from "../containers/reponseKeysTable";
import AuthorizationForm from "../containers/formFields/authorizationForm";
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";
import RequestBlockContainer from "../containers/requestBlockContainer/requestBlockContainer";

const RequestPage = observer(() => {
  const navigate = useNavigate();
  const dataStore = useOutletContext();
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

  const headerKeysProps = {};
  headerKeysProps.paramRows = requestStore.headers;
  headerKeysProps.immutableParams = requestStore.immutableHeaders;
  headerKeysProps.addParam = (type, value) => addParam("headers", type, value);
  headerKeysProps.removeParam = (param) => requestStore.removeParam("header", param);

  const selectProps = {};
  selectProps.name = "snippet";
  selectProps.id = "snippet-select";
  selectProps.value = requestStore.groupId;
  selectProps.className = "snippet-select__selector";
  selectProps.onChange = (event) => requestStore.setGroupId(event.target.value);

  return (
    <>
      <div className="request-menu">
        <button onClick={saveThis} className="save-button button">
          Сохранить
        </button>
        <button onClick={saveToCollection} className="save-button button">
          Сохранить как новый
        </button>
        <div className="snippet-select param-item">
          <select {...selectProps}>
            {dataStore.groups.map((group) => (
              <option value={group.id} key={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <TextInput {...nameProps} />
        <form onSubmit={(event) => requestStore.sendRequest(event)}>
          <TextInput {...methodProps} />
          <TextInput {...urlProps} />
          <h2 className="request-head-title param-item">Request</h2>
          <AuthorizationForm authorization={requestStore.authorization} />
          <RequestBlockContainer className="request-headers" title="HEADERS">
            <KeysTable {...headerKeysProps} />
          </RequestBlockContainer>
          <BodyForm body={requestStore.body} addParam={addParam} />
          <div className="submit-field">
            <button className="button" type="submit">
              {requestStore.requestStatus ? "Отменить" : "Отправить"}
            </button>
          </div>
        </form>
      </div>

      <div className="response-menu">
        <h2 className="request-head-title param-item">Response</h2>
        <RequestBlockContainer className="request-headers" title="SNIPPETS">
          <textarea value={requestStore.getSnips()} id="snippets-body" className="json-body" />
        </RequestBlockContainer>
        <RequestBlockContainer className="request-headers" title="BODY">
          <button onClick={requestStore.setBodyToClipboard} className="textarea-copy-button button">
            Copy all
          </button>
          <textarea value={requestStore.response.body} id="response-body" className="json-body" />
        </RequestBlockContainer>
        <RequestBlockContainer className="request-headers" title="HEADERS">
          <ResponseKeysTable paramRows={requestStore.response.headers} />
        </RequestBlockContainer>
      </div>
    </>
  );

  async function addParam (parent, type, value){
    const typePositions = {};
    typePositions.key = 0;
    typePositions.value = 1;
    typePositions.description = 2;

    const id = await requestStore.addParam(parent, type, value);
    const newElements = document.querySelectorAll(`#${id} input[type="text"]`);
    newElements[typePositions[type]].focus();
  }

  function animateErrorElement(element){
    element.style.filter = "hue-rotate(100deg)";
    element.style.borderColor = "darkBlue";

    setTimeout(() => {
      element.style.filter = "";
      element.style.borderColor = "";
    }, 1000);
  }

  function saveThis(){
    if(!validateData()) return;
    
    const newId = requestStore.saveThis();
    dataStore.update();

    navigate(`/soloRequest/${newId}`);
  }

  function saveToCollection(){
    if(!validateData()) return;

    const newId = requestStore.saveAsNew();
    dataStore.pushNew(requestStore.getData());

    navigate(`/soloRequest/${newId}`);
  }

  function validateData(){
    if (!requestStore.groupId) return false;

    if (!requestStore.name) {
      const requestNameElement = document.getElementById("requestName");
      animateErrorElement(requestNameElement);
      return false;
    }

    return true;
  }
});

export default RequestPage;
