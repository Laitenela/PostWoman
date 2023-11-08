import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";
import GroupMenu from "./containers/groupMenu";

const Aside = observer(({removeRequest, dataStore }) => {
  const [isHidden, setHidden] = useState(true);
  return (
      <aside className="side-menu">
        {dataStore.groupedRequests.map(({ name, id, requests }) => (
            <GroupMenu name={name} removeRequest={removeRequest} key={id} requests={requests}></GroupMenu>
        ))}
      </aside>
  );
});

export default Aside;
