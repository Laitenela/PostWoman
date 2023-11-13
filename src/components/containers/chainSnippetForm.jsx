import { observer } from "mobx-react-lite";
import TextInput from "../micro/textInput";

const ChainSnippetForm = observer(({ snippetsStore, onSubmit, hasActiveRequest }) => {
  return (
    <form onSubmit={onSubmit}>
      {snippetsStore.chainData.inputSnips.map((snip, index) => {
        const snipProps = {};
        snipProps.placeholder = snip.description || snip.key;
        snipProps.className = "param-item";
        snipProps.value = snip.value;
        snipProps.setValue = (newValue) => snip.setValue(newValue);
        return (
          <>
            <TextInput {...snipProps} key={index} />
          </>
        );
      })}
      <div className="submit-field">
        <button className="button" type="submit">
          {hasActiveRequest ? "Отменить" : "Отправить" }
        </button>
      </div>
    </form>
  );
});

export default ChainSnippetForm;
