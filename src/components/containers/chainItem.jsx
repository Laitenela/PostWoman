import { observer } from "mobx-react-lite";
import { useState } from "react";
import ChainProperty from "../chainProperty";

const ChainItem = observer(({ chainItem, chain, chainIndex }) => {
  const [isHiddenInner, setIsHiddenInner] = useState(true);
  const hideInner = () => {
    setIsHiddenInner(!isHiddenInner);
  };
  return (
    <div className="chain-item">
      <div onClick={() => hideInner()} className="chain-item__name">
        {chainItem.request.name}{isHiddenInner ? " ▼" : " ▲"}
      </div>
      {!isHiddenInner && (
        <div className="chain-item__properties-container">
          <div className="chain-item__property">
            <div className="propety-title">Snips</div>
            <div className="chain-item__snips-container">
              {chainItem.chainSnips.map((snip) => {
                return (
                  <div key={snip.key} className="chain-snip">
                    <div className="chain-snip__name">{snip.description || snip.key}</div>
                    <div className="snip-type">
                      <span className="snip-type__title">Snip type</span>
                      <select onChange={(event) => snip.setType(event.target.value)} value={snip.settings.type}>
                        <option value="inherit">Inherit</option>
                        <option value="from collection">Collection</option>
                      </select>
                    </div>
                    {snip.settings.type === "from collection" && (
                      <>
                        <div className="parse-key">
                          <span className="parse-key__title">Key name</span>
                          <input
                            onChange={(event) => snip.setSearching(event.target.value)}
                            value={snip.settings.searchingKey}
                            className="parse-key__input"
                            type="text"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {chainItem.properties.map((property, index) => {
            return (
              <ChainProperty chainItem={chainItem} property={property} propertyIndex={index} key={index}></ChainProperty>
            );
          })}
          <button onClick={() => chainItem.createNewProperty()} className="properties-container__add-button button">
            + Add Property +
          </button>
        </div>
      )}
      <div onClick={() => {chain.removeItem(chainIndex)}} className="chain-item__remove-button">
        🗑️
      </div>
    </div>
  );
});

export default ChainItem;
