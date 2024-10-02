import React from 'react';
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";

const Payment=({ onClose })=>{
    const [name, setName] = React.useState("");
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
                    value: Math.max(Number(13000), 1),
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
                orderName: "베테랑",
                successUrl: `${window.location.origin}/success`,
                failUrl: `${window.location.origin}/fail`,
            });
            setShowSuccessModal(true);
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
          <img src="../../resources/img/Movie/union.png" alt="Close" />
        </span>
                <h2>결제 정보</h2>
                <div>
                    <h3>주문 정보</h3>
                    <p style={{ whiteSpace: "pre-line" }}>
                        <strong>상품명:</strong> {"소년시절의 너"}
                    </p>
                </div>
                <div>
                    <h3>주문자 정보</h3>
                    <p>
                        <strong>주문자:</strong> {"허민영"}
                    </p>
                </div>
                <div style={{ zIndex: "0" }}>
                    <p>총 결제 금액</p>
                    <span style={{ fontSize: "20px" }}>
            {13000}원
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
            {showSuccessModal && <SuccessModal onClose={handleCloseSuccessModal} />}
        </div>
    );
};
export default Payment;