import React, { useEffect, useState } from "react";
import '../../resources/css/Movie/Reserve.css';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Payment from "./Payment";
const Reserve = () => {
    const navigate = useNavigate();
    const { mvId } = useParams();
    const location = useLocation();
    const { selectedSubRegion, selectedDate, startTime, endTime, seats, mvTitle, mvImg } = location.state || {}; // mvTitle과 mvImg 추가
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [date, setDate] = useState(selectedDate || '');
    const [time, setTime] = useState('');
    const [movieDetails, setMovieDetails] = useState(location.state || null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const openPaymentModal = () => setIsPaymentModalOpen(true);
    const closePaymentModal = () => setIsPaymentModalOpen(false);


    useEffect(() => {
        if (!movieDetails) {
            axios.get(`/movie/showReserveForm/${mvId}`)
                .then(response => {
                    const movieData = response.data;
                    movieData.openDate = movieData.openDate.split(' ')[0];
                    setMovieDetails(movieData);
                })
                .catch(error => {
                    console.error('Request failed:', error);
                });
        }
    }, [mvId, movieDetails]);

    function Seat() {
        const rows = Math.ceil(seats / 20); // 필요한 행 수를 seats 수에 따라 결정
        const cols = Math.min(seats, 20); // 열 수는 최대 20개까지
        const rowLabels = 'ABCDEFGHIJ'.split(''); // 최대 10개의 행에 대한 라벨 설정
        let tableRows = [];

        function handleSeatClick(seatId) {
            setSelectedSeat(seatId);
        }

        for (let row = 0; row < rows; row++) {
            let tableCells = [];
            for (let col = 1; col <= cols; col++) {
                let seatNumber = row * 20 + col; // 전체 좌석 번호 계산
                if (seatNumber > seats) break; // 현재 좌석 번호가 전체 좌석 수를 넘으면 중단
                let seatId = `${rowLabels[row]}-${col}`;

                // A-5 다음에 빈 칸 추가
                if (col === 6) {
                    tableCells.push(
                        <td key={`${seatId}-space1`} className="empty-cell"></td>
                    );
                }

                tableCells.push(
                    <td
                        key={seatId}
                        className={selectedSeat === seatId ? 'selected' : ''}
                        onClick={() => handleSeatClick(seatId)}
                    >
                        {seatId}
                    </td>
                );

                // A-15 다음에 빈 칸 추가
                if (col === 15) {
                    tableCells.push(
                        <td key={`${seatId}-space2`} className="empty-cell"></td>
                    );
                }
            }
            tableRows.push(<tr key={row}>{tableCells}</tr>);
        }

        return (
            <div>

            <div className="seatTable">
                <table>
                    <tbody>
                        {tableRows}
                        </tbody>
                    </table>
            </div>
    </div>
        );
    }

    function handleReservation() {
        if (!selectedSeat) {
            alert("좌석을 선택해주세요.");
        } else {
            /*  결제창으로 넘겨주세여 */
            
            /*
            const userId = localStorage.getItem('userId');
            const reservationData = {
                mvId: mvId,
                id: userId,
                seat: selectedSeat,
                dateR: date,
                time
            };

            console.log('Sending reservation data:', reservationData);

            /*
            axios.post('/movie/reserve', reservationData)
                .then(response => {
                    console.log('Reservation response:', response.data);
                    alert("예매가 완료되었습니다. 선택된 좌석: " + selectedSeat);
                    navigate('/user/mypage', { state: { reservationDetails: response.data } });
                })
                .catch(error => {
                    console.error('Reservation failed:', error);
                    alert("예매에 실패했습니다. 다시 시도해주세요.");
                });*/
        }
    }

    if (!movieDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div>
        <div className="reserve-div1">
            <div className='movie-container'>
                <br/><br/>
                {mvTitle} <br/><br/>
                <div className="reserve-imgMovie">
                    <img src={mvImg} width={180} height={250} alt={movieDetails.mvTitle}/>
                </div>
                <br/><br/>
                극장 : CGV {selectedSubRegion} <br/><br/>
                날짜 : {selectedDate} <br/><br/>
                시간 : {startTime} ~ {endTime} <br/><br/>
                좌석 수 : {seats}석 <br/><br/>
                선택 좌석 : {selectedSeat} <br/><br/>
            </div>
            <div className='seat-container'>
                <Seat/><br/>
                <div>
                    <button className='reserveBtn' onClick={handleReservation}>결제하기</button>
                </div>
            </div>

        </div>

        <div className="div1">
            영화명 : {movieDetails.mvTitle} <br/>
            날짜 : <input type="date" value={date} onChange={(e) => setDate(e.target.value)}/><br/>
            시간 : <input type="time" value={time} onChange={(e) => setTime(e.target.value)}/><br/>
            <p/><Seat/><br/>
            {/*<button onClick={handleReservation}>예매하기</button>*/}
            <button onClick={openPaymentModal}>예매하기</button>

            {isPaymentModalOpen && (
                <Payment
                    onClose={closePaymentModal} // Pass the close function
                />
            )}
        </div>
    );
}

export default Reserve;
