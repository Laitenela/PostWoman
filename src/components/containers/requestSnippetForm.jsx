import { observer } from "mobx-react-lite";
import TextInput from "../micro/textInput";

const RequestSnippetForm = observer(({snippetsStore, onSubmit}) => {
  return (
    <form onSubmit={onSubmit}>
        {snippetsStore.snips.map((snip, index) => {
          const snipProps = {};
          snipProps.placeholder = snip.description || snip.key;
          snipProps.className = "param-item";
          snipProps.value = snip.value;
          snipProps.setValue = (newValue) => snip.setValue(newValue);
          return <><TextInput {...snipProps} key={index} /></>
        })}
        <div className="submit-field">
          <button className="button" type="submit">Отправить</button>
        </div>
      </form>
  )
})

export default RequestSnippetForm;