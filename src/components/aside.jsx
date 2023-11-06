import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";

const Aside = observer(({ requests, removeRequest }) => {
  return (
    <aside className="side-menu">
      {requests.map(({ name, id }) => (
        <div key={id} className="side-menu__button">
          <Link to={`/soloRequest/${id}`}>
            <div>{name}</div>
          </Link>
          <div className="side-menu__remove-button" onClick={() => removeRequest(id)}>🗑️</div>
        </div>
      ))}
    </aside>
  );
})

export default Aside;
