import { observer } from "mobx-react-lite";

const TextInput = observer(({className, setValue, value, placeholder, name, id}) => {
  return (
    <div className={className}>
      <input type="text" name={name} onChange={(event) => setValue(event.target.value)} value={value} id={id} placeholder={placeholder} />
    </div>
  )
})

export default TextInput;