import { observer } from "mobx-react-lite";

const ChainProperty = observer(({ chainItem, property, propertyIndex }) => {
  return (
    <div className="chain-item__property">
      <select value={property.type} onChange={(event) => property.setType(event.target.value)} className="property__type-input">
        {property.possibleTypes.map((propertyType) => (
          <option key={propertyType} value={propertyType}>
            {propertyType}
          </option>
        ))}
      </select>
      {property.settings.properties.map((propertyItem) => {
        switch (propertyItem.type) {
          case "select":
            return (
              <div className="property-item">
                <span>{propertyItem.keyName}</span>
                <select onChange={(event) => propertyItem.setValue(event.target.value)} value={propertyItem.value} className="property-item__select">
                  {propertyItem.possibleValues.map((value, index) => (
                    <option key={index} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            );
          case "text input":
            return (
              <div className="property-item">
                <span>{propertyItem.keyName}</span>
                <input value={propertyItem.value} className="property-item__select" type="text" onChange={(event) => propertyItem.setValue(event.target.value)}/>
              </div>
            )
          default:
            return <></>;
        }
      })}
      <div onClick={() => chainItem.removeProperty(propertyIndex)} className="property__remove-button">
        🗑️
      </div>
    </div>
  );
});

export default ChainProperty;
