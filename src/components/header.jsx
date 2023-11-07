import { Link } from "react-router-dom";

function Header () {
  return (
    <header className="header">
      <div className="menu">
        <div className="menu-item logo">
          <h3>Womens be like</h3>
          <h1>Postwoman</h1>
        </div>
        <Link to="/" className="menu-item menu-button">
          <div className="text">
            Solo requests
          </div>
        </Link>
      </div>
    </header>
  )
}

export default Header;