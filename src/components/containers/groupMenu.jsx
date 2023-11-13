import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";

const GroupMenu = observer(({ dataStore, name, id, requests }) => {
  const [isHidden, setHidden] = useState(true);
  
  const requestDragStart = (event, type, id) => {
    event.dataTransfer.setData("type", type);
    const eventRect = event.target.getBoundingClientRect();
    event.dataTransfer.setData('startX', event.pageX - eventRect.left);
    event.dataTransfer.setData('startY', event.pageY - eventRect.top);
    event.dataTransfer.setData("id", id);
  }

  return (
    <>
      <div onClick={() => setHidden(!isHidden)} key={id} className="side-menu__button group">
        <div>
          <div className="side-menu__text">{name}{isHidden ? " ▼" : " ▲"}</div>
          <div className="side-menu__remove-button" onClick={() => dataStore.removeRequest(id)}>
            🗑️
          </div>
        </div>
      </div>
      <div style={{maxHeight: isHidden ? `${requests?.length * 35}px` : '0' }} className={`side-menu__context`}>
        {requests?.map((request) => (
          <div draggable onDragStart={(event) => requestDragStart(event, request.type, request.id)} key={request.id} className="side-menu__button request">
            <Link draggable="false" to={request.type === 'requestChains' ? `/chain/${request.id}` : `/soloRequest/${request.id}`}>
              <div className="side-menu__text">{request.name}{request.type === 'requestChains' && " ⛓"}</div>
              <div className="side-menu__remove-button" onClick={() => dataStore.removeRequest(request.id)}>
                🗑️
              </div>
            </Link>
          </div>
          ))}
      </div>
    </>
  );
});

export default GroupMenu;
