import React from "react";
import { navigate, useNavigate } from "react-router-dom";

const SuccessModal = ({ onClose,mvId,mvTitle,selectedSubRegion,selectedDate,startTime,endTime,seats,selectedSeat }) => {
    const navigate = useNavigate();
    function GoToMain() {
        navigate("/");
    }
    function GoMain() {
        navigate("/");
    }

    // useEffect(() => {
    //
    //       const userId = localStorage.getItem('userId');
    //       const reservationData = {
    //           mvId: mvId,
    //           id: userId,
    //           seat: selectedSeat,
    //           dateR: date,
    //           time
    //       };
    //
    //       console.log('Sending reservation data:', reservationData);
    //
    //
    //       axios.post('/movie/reserve', reservationData)
    //           .then(response => {
    //               console.log('Reservation response:', response.data);
    //               alert("예매가 완료되었습니다. 선택된 좌석: " + selectedSeat);
    //               navigate('/user/mypage', { state: { reservationDetails: response.data } });
    //           })
    //           .catch(error => {
    //               console.error('Reservation failed:', error);
    //               alert("예매에 실패했습니다. 다시 시도해주세요.");
    //           });*/
    // }, []);
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
