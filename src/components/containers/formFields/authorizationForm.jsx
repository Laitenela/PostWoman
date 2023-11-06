import { observer } from "mobx-react-lite";
import TextInput from "../../micro/textInput";
import RequestBlockContainer from "../requestBlockContainer/requestBlockContainer";

const AuthorizationForm = observer(({authorization}) => {
  const tokenProps = {};
  tokenProps.id = "token";
  tokenProps.placeholder = "Token";
  tokenProps.className = "param-item";
  tokenProps.value = authorization.params["bearer-auth"].token;
  tokenProps.setValue = (newValue) => authorization.setToken(newValue);

  return(
    <RequestBlockContainer className="request-headers" title="AUTHORIZATION">
      <div className="param-item">
        <div>
          <input type="radio" name="auth" id="no-auth" checked={authorization.type === "no-auth"} onChange={() => {authorization.setType("no-auth")}}/>
          <label htmlFor="no-auth">No auth</label>
        </div>
        <div>
          <input type="radio" name="auth" id="basic-auth" checked={authorization.type === "basic-auth"} onChange={() => {authorization.setType("basic-auth")}}/>
          <label htmlFor="basic-auth">Basic</label>
        </div>
        <div>
          <input type="radio" name="auth" id="bearer-auth" checked={authorization.type === "bearer-auth"} onChange={() => {authorization.setType("bearer-auth")}}/>
          <label htmlFor="bearer-auth">Bearer token</label>
        </div>
      </div>
      {authorization.type === "bearer-auth" && <TextInput {...tokenProps} />}
      {authorization.type === "basic-auth" && <>
        <TextInput value={authorization.params["basic-auth"].login} className="param-item" setValue={(newValue) => authorization.setLogin(newValue)} placeholder="Login" />
        <TextInput value={authorization.params["basic-auth"].password} className="param-item" setValue={(newValue) => authorization.setPassword(newValue)} placeholder="Password" />
      </>}
    </RequestBlockContainer>
  )
})

export default AuthorizationForm;