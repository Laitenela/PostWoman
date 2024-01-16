import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";

const GroupMenu = observer(({ dataStore, name, id, requests }) => {
  const [isHidden, setHidden] = useState(true);

  return (
    <>
      <div onClick={() => setHidden(!isHidden)} key={id} className="side-menu__button group">
        <div>
          <div className="side-menu__text">{name}{isHidden ? " ▼" : " ▲"}</div>
          <div className="side-menu__remove-button" onClick={() => dataStore.removeGroup(id)}>
            🗑️
          </div>
        </div>
      </div>
      <div style={{maxHeight: isHidden ? '0' : `${requests?.length * 35}px` }} className={`side-menu__context`}>
        {requests?.map((request) => (
          <div draggable onDragStart={(event) => requestDragStart(event, request.type, request.id)} key={request.id} className="side-menu__button request">
            <Link draggable="false" to={request.type === 'requestChains' ? `/chain/${request.id}` : `/soloRequest/${request.id}`}>
              <div className="side-menu__text">{getSymbolForRequestName(request)}{request.name}</div>
              <div className="side-menu__remove-button" onClick={() => dataStore.removeRequest(request.id)}>
                🗑️
              </div>
            </Link>
          </div>
          ))}
      </div>
    </>
  );

  function requestDragStart (event, type, id){
    const eventRect = event.target.getBoundingClientRect();

    event.dataTransfer.setData("id", id);
    
    event.dataTransfer.setData("type", type);

    event.dataTransfer.setData('startX', event.pageX - eventRect.left);
    event.dataTransfer.setData('startY', event.pageY - eventRect.top);
  }

  function getSymbolForRequestName (request){
    const style = {};

    const innerText = (request.type === 'requestChains') ? "🗫🗫" :
      request.method.toUpperCase().slice(0, 4);

    switch(request.method){
      case "get":
        style.color = 'green';
        break;
      case "post":
        style.color = '#a25900';
        break;
      default:
        style.color = 'white';
        break;
    }

    return <span className="side-span-element" style={style}>{innerText}</span>;
  }
});

export default GroupMenu;
