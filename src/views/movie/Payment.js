import React from 'react';
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";
import unionImage from "../../resources/img/Movie/union.png";
import axios from 'axios';
const Payment=({ onClose,mvId,mvTitle,selectedSubRegion,selectedDate,startTime,endTime,seats,selectedSeat})=>{
    const [name, setName] = React.useState("");
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();
    const clientKey = process.env.REACT_APP_CLIENT_KEY;
    const customerKey = process.env.REACT_APP_CUSTOMER_KEY;

    useEffect(() => {
        async function fetchPaymentWidgets() {
            try {
                const tossPayments = await loadTossPayments(clientKey);
                const widgets = tossPayments.widgets({ customerKey });
                setWidgets(widgets);
            } catch (error) {
                console.error("Failed to initialize Toss Payments:", error);
            }
        }

        fetchPaymentWidgets();
    }, []);
    useEffect(() => {
        async function renderPaymentWidgets() {
            if (!widgets) return;

            try {
                const validAmount = {
                    currency: "KRW",
                    value: Math.max(Number(14000), 1),
                };

                await widgets.setAmount(validAmount);

                await Promise.all([
                    widgets.renderPaymentMethods({
                        selector: "#payment-method",
                        variantKey: "DEFAULT",
                    }),
                    widgets.renderAgreement({
                        selector: "#agreement",
                        variantKey: "AGREEMENT",
                    }),
                ]);

                setReady(true);
            } catch (error) {
                console.error("Failed to render payment widgets:", error);
            }
        }

        renderPaymentWidgets();
    }, [widgets]);

    const handlePayment = async () => {
        if (!widgets) return;
        try {
            await widgets.requestPayment({
                orderId: `order_${Date.now()}`,
                orderName: mvTitle,
                // successUrl: `${window.location.origin}/success`,
                // failUrl: `${window.location.origin}/fail`,
            });

            const userId = localStorage.getItem('userId');
            const reservationData = {
                mvId: mvId,
                id: userId,
                seat: selectedSeat,
                dateR: selectedDate,
                time : startTime,
                region : selectedSubRegion,
                price : 14000

            };

            console.log('Sending reservation data:', reservationData);


            axios.post('/movie/reserve', reservationData)
                .then(response => {
                    console.log('Reservation response:', response.data);
                    alert("예매가 완료되었습니다. 선택된 좌석: " + selectedSeat);
                    // navigate('/user/mypage', { state: { reservationDetails: response.data } });
                    // setShowSuccessModal(true);
                    navigate('/user/mypage'); // 추가
                })
                .catch(error => {
                    console.error('Reservation failed:', error);
                    alert("예매에 실패했습니다. 다시 시도해주세요.");
                });

        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onClose();
    };

    return (
        <div>
            <div>
        <span onClick={onClose}>
            <img src={unionImage} alt="Close" />
        </span>
                <h2 style={{ color: "black" }} >결제 정보</h2>
                <div>
                    <p style={{ whiteSpace: "pre-line" ,color: "black"}}>
                        <strong style={{ color: "black" }}>극장:</strong> CGV {selectedSubRegion}
                    </p>
                </div>
                <div>
                    <p style={{ color: "black" }}>
                        <strong style={{ color: "black" }}>날짜:</strong> {selectedDate}
                    </p>
                </div>
                <div>
                    <p style={{ color: "black" }}>
                        <strong style={{ color: "black" }}>시간:</strong> {startTime} ~ {endTime}
                    </p>
                </div>
                <div>
                    <p style={{ color: "black" }}>
                        <strong style={{ color: "black" }}>좌석 수:</strong> {seats}석
                    </p>
                </div>
                <div>
                    <p style={{ color: "black" }}>
                        <strong style={{ color: "black" }}>선택 좌석:</strong> {selectedSeat}
                    </p>
                </div>
                <div style={{ zIndex: "0" }}>
                    <p style={{ color: "black" }}>총 결제 금액</p>
                    <span style={{ fontSize: "20px" ,color: "black"}}>
            {14000}원
          </span>
                </div>
                <div>
                    <div id="payment-method"></div>
                    <div id="agreement"></div>
                    <button
                        disabled={!ready}
                        onClick={handlePayment}>
                        결제하기
                    </button>
                </div>
            </div>
            {/*{showSuccessModal && <SuccessModal onClose={handleCloseSuccessModal} mvId={mvId} mvTitle={mvTitle} selectedSubRegion={selectedSubRegion} selectedDate={selectedDate} startTime={startTime} endTime={endTime} seats={seats} selectedSeat={selectedSeat}/>}*/}
        </div>
    );
};
export default Payment;