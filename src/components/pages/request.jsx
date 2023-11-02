import { Link } from "react-router-dom";

function RequestPage() {
  return (
    <div className="request-menu">
      <form>
        <div className="param-item">
          <input type="text" name="method" id="method" placeholder="Метод" />
        </div>
        <div className="param-item">
          <input type="text" name="method" id="method" placeholder="Url" />
        </div>
        <div className="request-headers">
          <h3 className="field-name">HEADERS</h3>
          <table className="request-table">
            <thead>
              <td></td>
              <td>Key</td>
              <td>Value</td>
              <td>Description</td>
            </thead>
            <tbody>
              <tr>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
              </tr>
              <tr>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
              </tr>
              <tr>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="request-body">
          <h3 className="field-name">BODY</h3>
          <table className="request-table">
            <thead>
              <td></td>
              <td>Key</td>
              <td>Value</td>
              <td>Description</td>
            </thead>
            <tbody>
              <tr>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
              </tr>
              <tr>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
              </tr>
              <tr>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
                <td>Hello</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="submit-field">
          <button type="submit">Взломать жёпу</button>
        </div>
      </form>
    </div>
  );
}

export default RequestPage;
