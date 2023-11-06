import { observer } from "mobx-react-lite";
import TextInput from "../micro/textInput";

const ResponseKeysTable = observer(({ paramRows }) => {
  return (
    <table className="request-table">
      <thead>
        <tr>
          <th></th>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {paramRows.map((param) => {
          return (
            <tr className="keys-row" id={param.id} key={param.id}>
              <td></td>
              <td>
                <TextInput value={param.key} setValue={(newValue) => param.changeKey(newValue)} />
              </td>
              <td>
                <TextInput value={param.value} setValue={(newValue) => param.changeValue(newValue)} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

export default ResponseKeysTable;
