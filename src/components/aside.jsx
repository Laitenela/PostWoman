import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";

const Aside = observer(({ requests, removeRequest }) => {
  return (
    <aside className="side-menu">
      {requests.map(({ name, id }) => (
        <div key={id} className="side-menu__button">
          <Link to={`/soloRequest/${id}`}>
            <div className="side-menu__text">{name}</div>
            <div className="side-menu__remove-button" onClick={() => removeRequest(id)}>🗑️</div>
          </Link>
        </div>
      ))}
    </aside>
  );
})

export default Aside;
