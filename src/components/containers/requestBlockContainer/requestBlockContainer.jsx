import { observer } from "mobx-react-lite";

const RequestBlockContainer = observer(({ children, className, title }) => {
  return <div className={className}>
    <h3 className="field-name">{title}</h3>
    {children}
  </div>;
});

export default RequestBlockContainer;
