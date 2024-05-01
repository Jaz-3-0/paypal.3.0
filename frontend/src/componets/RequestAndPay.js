import React, { useState, useEffect } from "react";
import { DollarOutlined, SwapOutlined } from "@ant-design/icons";
import { Modal, Input, InputNumber } from "antd";

import { usePrepareContractWire, useContractWire, useWaitForTransaction } from "wagmi";
import { polygonMumbai } from "@wagmi/chains";
import { ABI } from "../abi.json";

function RequestAndPay({requests, getNameAndBalance}) {

  const [payModal, setPayModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState(5);
  const [requestAddress, setRequestAddress] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const { config } = usePrepareContractWire({
    chainId: polygonMumbai.id,
    address: "0x20F75f430AB4D1281de4d24bDC849d681Df9A69b",
    abi: ABI,
    function: "payRequest",
    args: [0],
    overrides: {
      value: String(Number(requests["1"][0] * 1e18))
    },
  });

  const { write, data } = useContractWire(config);

  const { isSuccess} = useWaitForTransaction({
    hash: data?.hash,
  });

  const { config: configRequest } = usePrepareContractWire({
    chainId: polygonMumbai.id,
    address: "0x20F75f430AB4D1281de4d24bDC849d681Df9A69b",
    abi: ABI,
    function: "createRequest",
    args: [requestAddress, requestAmount, requestMessage],
   
  });

  const { write: writeRequest, data: dataRequest } = useContractWire(configRequest);

  const { isSuccess: isSuccessRequest} = useWaitForTransaction({
    hash: dataRequest?.hash,
  });
  
  useEffect(() => {
    if (isSuccess || isSuccessRequest) {
      getNameAndBalance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isSuccessRequest]); 


  const showPayModal = () => {
    setPayModal(true);
  };
  const hidePayModal = () => {
    setPayModal(false);
  };

  const showRequestModal = () => {
    setRequestModal(true);
  };
  const hideRequestModal = () => {
    setRequestModal(false);
  };

  return (
    <>
      <Modal
        title="Confirm Payment"
        open={payModal}
        onOk={() => {
          hidePayModal();

          write?.();
        }}
        onCancel={hidePayModal}
        okText="Proceed To Pay"
        cancelText="Cancel"
      >

      {requests && requests["0"].length > 0 && (
        <>
        <h2>Sending payment to {requests["3"][0]}</h2>
        <h3>Value: {requests["3"][0]} Matic</h3>
        <p>"{requests["2"][0]}"</p>
        </>
      )}

      </Modal>
      <Modal
        title="Request A Payment"
        open={requestModal}
        onOk={() => {
          hideRequestModal();

          writeRequest?.();
        }}
        onCancel={hideRequestModal}
        okText="Proceed To Request"
        cancelText="Cancel"
      >
        <p>Amount (Matic)</p>
        <InputNumber value={requestAmount} onChange={(val)=>setRequestAmount(val)}/>
        <p>From (address)</p>
        <Input placeholder="0x..." value={requestAddress} onChange={(val)=>setRequestAddress(val.target.value)}/>
        <p>Message</p>
        <Input placeholder="Lunch Bill..." value={requestMessage} onChange={(val)=>setRequestMessage(val.target.value)}/>
      </Modal>
      <div className="requestAndPay">
        <div
          className="quickOption"
          onClick={() => {
            showPayModal();
          }}
        >
          <DollarOutlined style={{ fontSize: "26px" }} />
          Pay

          {requests && requests["0"].length > 0 && (
            <div className="numRegs">{requests["0"].length} </div>
          )}
        </div>
        <div
          className="quickOption"
          onClick={() => {
            showRequestModal();
          }}
        >
          <SwapOutlined style={{ fontSize: "26px" }} />
          Request
        </div>
      </div>
    </>
  );
}

export default RequestAndPay;