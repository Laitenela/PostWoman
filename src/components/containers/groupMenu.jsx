import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";

const GroupMenu = observer(({ removeRequest, dataStore, name, id, requests }) => {
  const [isHidden, setHidden] = useState(true);
  console.log(requests);
  return (
    <>
      <div onClick={() => setHidden(!isHidden)} key={id} className="side-menu__button group">
        <div>
          <div className="side-menu__text">{name}</div>
          <div className="side-menu__remove-button" onClick={() => removeRequest(id)}>
            🗑️
          </div>
        </div>
      </div>
      <div style={{maxHeight: isHidden ? `${requests?.length * 35}px` : '0' }} className={`side-menu__context`}>
        {requests?.map((request) => (
          <div key={request.id} className="side-menu__button request">
            <Link to={`/soloRequest/${request.id}`}>
              <div className="side-menu__text">{request.name}</div>
              <div className="side-menu__remove-button" onClick={() => removeRequest(id)}>
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
