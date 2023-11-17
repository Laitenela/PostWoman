import { useState } from "react";
import { Link, redirect } from "react-router-dom";
import RequestBlockContainer from "./containers/requestBlockContainer/requestBlockContainer";
import TextInput from "./micro/textInput";

function Header({ dataStore }) {
  const [isImportActive, setImportActive] = useState(false);
  const [isCreationActive, setCreationActive] = useState(false);

  const changeImportActive = (event) => {
    if(event.target.id !== 'import-popup') return;
    setImportActive(!isImportActive);
  }

  const createGroup = (event) => {
    event.preventDefault();
    dataStore.createGroup(event.target[0].value);
    event.target[0].value = "";
    setCreationActive(!isCreationActive);
  }

  const changeCreationActive = (event) => {
    if(event.target.id !== 'group-creation-popup') return;
    setCreationActive(!isCreationActive);
  }

  const groupProps = {};
  groupProps.id = "groupName";
  groupProps.placeholder = "Enter the name of the group...";
  groupProps.className = "param-item";
  // groupProps.value = requestStore.method;
  groupProps.setValue = () => {};

  const importData = () => {

  }

  const setImport = () => {
    const textElement = document.getElementById("import-field");
    localStorage.setItem('data', textElement.value);
    dataStore.update();
    redirect('/');
  }

  const setExportToClipboard = () => {
    navigator.clipboard.writeText(dataStore.getJSONData());
  };

  return (
    <>
      <header className="header">
        <div className="menu">
          <div className="menu-item logo">
            <h3>Womens be like</h3>
            <h1>Postwoman</h1>
          </div>
          <Link to="/" className="menu-item menu-button">
            <div className="text">Create request</div>
          </Link>
          <Link to="/chain" className="menu-item menu-button">
            <div className="text">Create chains</div>
          </Link>
          <Link to="/snippets" className="menu-item menu-button">
            <div className="text">Snippets</div>
          </Link>
          <div onClick={() => setCreationActive(!isCreationActive)} className="menu-item menu-button left">
            <div className="text">Create group</div>
          </div>
          <div onClick={() => setImportActive(!isImportActive)} className="menu-item menu-button left">
            <div className="text">Import/Export</div>
          </div>
        </div>
      </header>

      <div onMouseDown={(event) => changeImportActive(event)} id="import-popup" className={`main-popup ${isImportActive ? 'active' : ''}`}>
        <div className="dialogue request-menu">
          <RequestBlockContainer className="request-headers" title="Импорт">
            <textarea id="import-field" className="json-body export-area" />
            <div className="submit-field">
              <button onClick={() => setImport()} className="button" type="submit">Импортировать</button>
            </div>
          </RequestBlockContainer>
        </div>
        <div className="dialogue request-menu">
          <RequestBlockContainer className="request-headers" title="Экспорт">
            <textarea value={dataStore.getJSONData()} id="export-field" className="json-body export-area" />
            <div className="submit-field">
              <button onClick={() => setExportToClipboard()} className="button" type="submit">Копировать</button>
            </div>
          </RequestBlockContainer>
        </div>
      </div>

      <div onMouseDown={(event) => changeCreationActive(event)} id="group-creation-popup" className={`main-popup ${isCreationActive ? 'active' : ''}`}>
        <div className="dialogue request-menu">
          <RequestBlockContainer className="request-headers" title="Group Creation">
            <form onSubmit={(event) => createGroup(event)}>
              <TextInput {...groupProps} />
              <div className="submit-field">
                <button className="button" type="submit">Create</button>
              </div>
            </form>
          </RequestBlockContainer>
        </div>
      </div>
    </>
  );
}

export default Header;
