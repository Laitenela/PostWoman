import { observer } from "mobx-react-lite";
import RequestBlockContainer from "../requestBlockContainer/requestBlockContainer";
import KeysTable from "../keysTable/keysTable";

const BodyForm = observer(({ addParam, body }) => {
  return (
    <RequestBlockContainer className="request-headers" title="BODY">
      <div className="param-item">
        <div>
          <input type="radio" name="body-type" id="x-www-form-urlencoded" checked={body.type === "x-www-form-urlencoded"} onChange={() => {body.setType("x-www-form-urlencoded")}}/>
          <label htmlFor="x-www-form-urlencoded">x-www-form-urlencoded</label>
        </div>
        <div>
          <input type="radio" name="body-type" id="json" checked={body.type === "json"} onChange={() => {body.setType("json")}}/>
          <label htmlFor="json">JSON</label>
        </div>
      </div>
      { body.type === "x-www-form-urlencoded" &&
          <KeysTable
            removeParam={(paramId) => body.removeParam(paramId)}
            addParam={(type, value) => addParam("body", type, value)}
            paramRows={body.params[body.type]}
          />
      }
      { body.type === "json" &&
          <textarea className="json-body" onChange={(event) => body.setRaw(event.target.value)} value={body.raws["json"]} name="" id="" cols="30" rows="10"/>
      }
    </RequestBlockContainer>
  );
});

export default BodyForm;
