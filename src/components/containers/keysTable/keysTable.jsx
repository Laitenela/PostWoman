import { observer } from "mobx-react-lite";
import TextInput from "../../micro/textInput";

const KeysTable = observer(({ paramRows, addParam, removeParam, immutableParams }) => {
  return (
    <table className="request-table">
      <thead>
        <tr>
          <th></th>
          <th>Key</th>
          <th>Value</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {immutableParams && immutableParams.map((param) => {
          return (
            <tr className="keys-row" id={param.id} key={param.id}>
              <td>
                <input disabled type="checkbox" checked={param.enabled} onChange={(event) => param.setEnabled(event.target.checked)} />
              </td>
              <td>
                <TextInput value={param.key} setValue={() => {}} />
              </td>
              <td>
                <TextInput value={param.value} setValue={() => {}} />
              </td>
              <td>
                <TextInput value={param.description} setValue={() => {}} />
              </td>
            </tr>
          )
        })}
        {paramRows.map((param) => {
          return (
            <tr className="keys-row" id={param.id} key={param.id}>
              <td>
                <input type="checkbox" checked={param.enabled} onChange={(event) => param.setEnabled(event.target.checked)} />
              </td>
              <td>
                <TextInput value={param.key} setValue={(newValue) => param.changeKey(newValue)} />
              </td>
              <td>
                <TextInput value={param.value} setValue={(newValue) => param.changeValue(newValue)} />
              </td>
              <td>
                <TextInput value={param.description} setValue={(newValue) => param.changeDescription(newValue)} />
              </td>
              <span className="remove-button" onClick={() => removeParam(param.id)}>
                🗑️
              </span>
            </tr>
          );
        })}
        <tr>
          <td>
          </td>
          <td>
            <TextInput value="" setValue={(key) => addParam('key', key)} />
          </td>
          <td>
            <TextInput value="" setValue={(value) => addParam('value', value)} />
          </td>
          <td>
            <TextInput value="" setValue={(description) => addParam('description', description)} />
          </td>
        </tr>
      </tbody>
    </table>
  );
});

export default KeysTable;
