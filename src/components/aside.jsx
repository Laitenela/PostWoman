import { Link } from "react-router-dom";

function Aside(){
  return (
    <aside className="aside">
      <div className="start-menu">
        <li className="link">
          <Link to="/">Одиночные запросы</Link>
        </li>
        <li className="link">
          <Link to="/chain">Цепочки запросов</Link>
        </li>
        <li></li>
      </div>
    </aside>
  )
}

export default Aside;