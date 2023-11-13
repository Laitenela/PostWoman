import { observer } from "mobx-react-lite";
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";
import ChainItem from "../containers/chainItem";


const Chain = observer(() => {
  const dataStore = useOutletContext();
  const chainsStore = useLoaderData();
  const navigate = useNavigate();

  const dropItem = (event) => {
    const containerRect = event.currentTarget.getBoundingClientRect();

    const type = event.dataTransfer.getData('type');
    if(type === "requestChains") return;

    const id = event.dataTransfer.getData('id');
    const startX = event.dataTransfer.getData('startX');
    const startY = event.dataTransfer.getData('startY');
    if(type === 'request'){
      if(event.target.classList.contains("requests-chain")){
        const chainIndex = chainsStore.getChainIndex(event.target.id);
        chainsStore.chains[chainIndex].pushRequest(dataStore.getRequest(id));
        return;
      }
      const positionX = event.pageX - containerRect.left - startX;
      const positionY = event.pageY - containerRect.top - startY;
      const chain = chainsStore.createChain(positionX, positionY);
      chain.pushRequest(dataStore.getRequest(id));
      return;
    }
    const chainIndex = chainsStore.getChainIndex(id);

    if(chainIndex === -1) return;
    chainsStore.setChainPosition(chainIndex, event.pageX - containerRect.left - startX, event.pageY - containerRect.top - startY);
    console.log(chainsStore);
  }

  const dragStart = (event, id) => {
    event.dataTransfer.setData('id', id);
    const eventRect = event.target.getBoundingClientRect();
    event.dataTransfer.setData('startX', event.pageX - eventRect.left);
    event.dataTransfer.setData('startY', event.pageY - eventRect.top);
  }

  const dragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  const saveToCollection = () => {
    if(!chainsStore.name) return;
    if(!chainsStore.groupId) return;
    const newId = chainsStore.saveAsNew();
    dataStore.pushNew(chainsStore.getData());
    navigate(`/chain/${newId}`);
  }

  const saveThis = () => {
    if(!chainsStore.name) return;
    if(!chainsStore.groupId) return;
    const newId = chainsStore.saveThis();
    navigate(`/chain/${newId}`);
  }

  return (<>
    <div onDrop={(event) => dropItem(event)} onDragOver={dragOver} className="chains-menu">
      <button onClick={() => saveThis()} className="save-button button">Сохранить</button>
      <button onClick={() => saveToCollection()} className="save-button button">Сохранить как новый</button>
      <h2 style={{textAlign: "center", display: "block", position: "absolute", top: '0', right: '-10rem'}} className="param-item">Requests chain</h2>
      <div className="snippet-select chains-menu__param-item">
        <select value={chainsStore.groupId} onChange={(event) => chainsStore.setGroupId(event.target.value)} className="snippet-select__selector" name="snippet" id="snippet-select">
          {dataStore.groups.map(group => {
            return <option value={group.id} key={group.id}>{group.name}</option>
          })}
        </select>
      </div>
      <input onChange={(event) => chainsStore.setName(event.target.value)} type="text" className="chains-menu__name" value={chainsStore.name} placeholder="Request Chains Name" />
      {chainsStore.chains.map((chain, chainIndex) => {
        return (<div id={chain.id} style={{top: chain.position.y + 'px', left: chain.position.x + 'px'}} key={chain.id} onDragStart={(event) => dragStart(event, chain.id)} className="requests-chain">
          <div className="requests-chain__header param-item">
            <input onChange={(event) => chain.setName(event.target.value)} className="requests-chain__name" type="text" value={chain.name}/>
          </div>
          {chain.chainItems.map((chainItem, chainIndex) => 
            <ChainItem chainIndex={chainIndex} key={chainItem.requestId} chain={chain} chainItem={chainItem}></ChainItem>
          )}
          <div onClick={() => {chainsStore.removeChain(chainIndex)}} className="requests-chain__remove-button">
            🗑️
          </div>
        </div>)
      })}
    </div>
  </>)
})

export default Chain;