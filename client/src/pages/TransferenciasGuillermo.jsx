import { useSelector, useDispatch } from 'react-redux';
import { getAllUsers } from '../slices/userSlice';
import { useEffect, useState } from 'react';
import { getUserCards, updateCard } from '../slices/cardSlice';
import { createTransaction } from '../slices/guilleTransferSlice';
import { v4 as uuidv4 } from 'uuid';

const TransferenciasGuillermo = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const user = useSelector((state) => state?.user?.user);
  
  const [ListOfCards, setListOfCards] = useState([]);
  const [listUsers, setListUsers] = useState([]);

  const [selectedCardId, setSelectedCardId] = useState('');

  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');

//hacemos el fetch de los usuarios
  useEffect(() => {
    dispatch(getAllUsers())
    .then((response)=> {
      // console.log("Lista de uusuarios", response.payload)
      const filteredData = response.payload.filter(obj => 'account_number' in obj).slice(0, 6);
      console.log("lista usuarios filtrados -> ", filteredData)
      setListUsers(filteredData)
    })  
    .catch((error)=> {
      console.log("Error -> ",error)
    })
  },[dispatch, token])

  // hacemos el fetch de las tarjetas
  useEffect(() => {
    dispatch(getUserCards())
    .then((response)=>{
      console.log("Lista de tarjetas", response.payload)
      setListOfCards((response.payload))
    })
    .catch((error)=> {
      console.log("Error -> ",error)
    })
  }, [dispatch, token]);

  const handleCardSelection = (event) => {
    setSelectedCardId(event.target.value);

  };

  const handleReceiverAccountChange = (event) => {
    setReceiverAccount(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };
  

  const handleTransfer = () => {
    if (selectedCardId && receiverAccount && amount) {
      const selectedCard = ListOfCards.find((card) => card._id === selectedCardId);

      const transactionData = {
        card: 'visa', //esta no es la car es mas vien un select visa amex, etc
        concept: 'transferencia',
        receiver_account: receiverAccount,
        amount: Number(amount),
        user: user._id
      };
      console.log("transaccion ->",transactionData)
      console.log("id card antes dispatch -> ", selectedCard)

      dispatch(createTransaction(transactionData))
      .then((response)=>{
        console.log("response -> ",response)
        console.log("id card -> ", selectedCard)
        const idCard = selectedCard._id;
        const updatedCardData = {...selectedCard, balance: selectedCard.balance - parseInt(amount)}
        dispatch(updateCard(idCard,updatedCardData))
        .then((res) =>{
          console.log("resp tarjeta ->",res)
        })
        .catch((error)=>{
          console.log("error tarjeta ->",error)
        })
        .finally(()=>{
          console.log("fin tarjeta")
        })
      })
      .catch((error)=> {
        console.log("error ->",error)
      })
      .finally(()=>{
        console.log("fin transaccio")
      })
      // Aquí puedes realizar alguna acción adicional después de la transferencia
      // Por ejemplo, limpiar los campos del formulario o mostrar una notificación
      setSelectedCardId('');
      setReceiverAccount('');
      setAmount('');
    }
  };

  return (
    <div className="transferencias w-full h-[400px] bg-amber-100">
      <h2>Realizar transferencia</h2>
      <label htmlFor="card">Seleccionar tarjeta:</label>
      <select id="card" value={selectedCardId} onChange={handleCardSelection}>
        <option value="">-- Seleccionar --</option>
        {ListOfCards.map((card) => (
          <option key={card._id} value={card._id}>
            {card.number}
          </option>
        )
        )}
      </select>
      <br />

      {/* receptor */}
      <label htmlFor="receiverAccount">Cuenta receptora:</label>
      <select name="receiverAccount" id="receiverAccount" value={receiverAccount} onChange={handleReceiverAccountChange}>
        <option value=""> -- Seleccionar -- </option>
        {listUsers.map((user) => (
          <option key={uuidv4()} value={user.account_number}>
            {user.email}
          </option>
        ))
        }
      </select>

      <br />
      <label htmlFor="amount">Monto:</label>
      <input id="amount" type="number" value={amount} onChange={handleAmountChange} />
      <br />
      <button onClick={handleTransfer}>Realizar transferencia</button>
    </div>
  );
}

export default TransferenciasGuillermo


