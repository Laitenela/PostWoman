import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";
import GroupMenu from "./containers/groupMenu";

const Aside = observer(({ dataStore }) => {
  return (
      <aside className="side-menu">
        {dataStore.groupedRequests.map(({ name, id, requests }) => (
            <GroupMenu dataStore={dataStore} name={name} key={id} id={id} requests={requests}></GroupMenu>
        ))}
      </aside>
  );
});

export default Aside;
