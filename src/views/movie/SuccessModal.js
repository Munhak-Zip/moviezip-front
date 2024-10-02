import React from "react";
import { navigate, useNavigate } from "react-router-dom";

const SuccessModal = ({ onClose }) => {
    const navigate = useNavigate();
    function GoToMain() {
        navigate("/");
    }
    function GoMain() {
        navigate("/");
    }
    return (
        <div>
            <div>
                <div>
                  예약이 완료되었습니다.
                </div>
                <div>
                    예약코드
                </div>
                <div onClick={GoToMain}>
                    메인페이지로 이동
                </div>
                <div onClick={GoMain}>
                    메인 홈으로 이동
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
