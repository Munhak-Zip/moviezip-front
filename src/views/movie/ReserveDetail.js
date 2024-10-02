import React, { useEffect, useState } from "react";
import '../../resources/css/Movie/ReserveDetail.css';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const ReserveDetail = () => {
    const navigate = useNavigate();
    const [movieDetails, setMovieDetails] = useState(null); // movieDetails 상태 추가
    const { mvId } = useParams();
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedSubRegion, setSelectedSubRegion] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [regions, setRegions] = useState([
        { id: 0, name: '서울', subRegions: [] },
        { id: 1, name: '경기', subRegions: [] },
        { id: 2, name: '인천', subRegions: [] },
        { id: 3, name: '강원', subRegions: [] },
        { id: 4, name: '대전/충청', subRegions: [] },
        { id: 5, name: '대구', subRegions: [] },
        { id: 6, name: '부산/울산', subRegions: [] },
        { id: 7, name: '경상', subRegions: [] },
        { id: 8, name: '광주/전라/제주', subRegions: [] }
    ]);
    const [selectedSubRegions, setSelectedSubRegions] = useState([]);
    const [selectedTimeIds, setSelectedTimeIds] = useState({});
    const [times, setTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null); // State to store the selected time
    // 영화 세부 정보 가져오기
    useEffect(() => {
        axios.get(`/movie/${mvId}`)
            .then(response => {
                const movieData = response.data;
                movieData.openDate = movieData.openDate.split(' ')[0]; // Remove time from openDate
                setMovieDetails(movieData);
            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
            });
    }, [mvId]);
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleRegionSelect = (regionId) => {
        const selectedRegionObj = regions.find(r => r.id === regionId);
        setSelectedRegion(selectedRegionObj.name);

        axios.get(`/theater/location/${regionId}`)
            .then(response => {
                const subRegions = response.data.map(theater => theater.theaterName);
                setSelectedSubRegions(subRegions);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });

        setSelectedSubRegion('');
    };

    const handleSubRegionSelect = (subRegion) => {
        setSelectedSubRegion(subRegion);
    };

    const handleTimeSelect = (theaterId, timeId, startTime) => {
        setSelectedTimeIds((prevState) => {
            const updatedState = {
                ...prevState,
                [theaterId]: prevState[theaterId] === timeId ? null : timeId // Toggle selection
            };
            setSelectedTime(prevState[theaterId] === timeId ? null : startTime); // Set or clear selectedTime
            return updatedState;
        });
    };

    const isAllSelected = selectedRegion && selectedSubRegion && selectedDate && Object.values(selectedTimeIds).some(timeId => timeId !== null);
    const isTheaterAndDateSelected = selectedRegion && selectedSubRegion && selectedDate;

    useEffect(() => {
        if (selectedSubRegion && selectedDate && mvId) {
            const originalFormat = new Date(selectedDate);
            const formattedDate = originalFormat.toISOString().split('T')[0];

            axios.get(`/screenings`, {
                params: {
                    movieId: mvId,
                    screenDate: formattedDate,
                    theaterName: selectedSubRegion
                }
            })
                .then(response => {
                    const groupedData = response.data.reduce((acc, item) => {
                        const existingTheater = acc.find(theater => theater.theater === item.screenName);
                        if (existingTheater) {
                            existingTheater.timeSlots.push({
                                timeId: item.timeId,
                                startTime: item.startTime,
                                endTime: item.endTime,
                                remainingSeats: item.remainingSeats
                            });
                        } else {
                            acc.push({
                                id: item.timeId,
                                theater: item.screenName,
                                seats: item.seats,
                                timeSlots: [{
                                    timeId: item.timeId,
                                    startTime: item.startTime,
                                    endTime: item.endTime,
                                    remainingSeats: item.remainingSeats
                                }]
                            });
                        }
                        return acc;
                    }, []);
                    setTimes(groupedData);
                })
                .catch(error => {
                    console.error("Error fetching screening details:", error);
                });
        }
    }, [selectedSubRegion, selectedDate, mvId]);

    const showReserve = () => {
        const selectedTimeInfo = Object.entries(selectedTimeIds).find(([theaterId, timeId]) => timeId != null);
        if (!selectedTimeInfo) {
            alert("Please select a time.");
            return;
        }

        const [theaterId, timeId] = selectedTimeInfo;
        const selectedTheater = times.find(theater => theater.id === parseInt(theaterId));
        const selectedTimeSlot = selectedTheater ? selectedTheater.timeSlots.find(slot => slot.timeId === timeId) : null;

        if (!selectedTimeSlot) {
            alert("Selected time slot not found.");
            return;
        }

        const { startTime, endTime } = selectedTimeSlot; // Extract startTime and endTime

        navigate(`/movie/showReserveForm/${mvId}`, {
            state: {
                mvId,
                selectedSubRegion,
                selectedDate,
                startTime,   // Start time added
                endTime,     // End time added
                seats: selectedTheater ? selectedTheater.seats : 0,
                mvTitle: movieDetails?.mvTitle || "", // 영화 제목 추가
                mvImg: movieDetails?.mvImg || ""     //영화 이미지 추가
            }
        });
    };

    return (
        <div className="reserve-detail-container">
            <div className="reservation-section">
                <div className="screen-selection">
                    <div className="label">극장</div>
                    <div className="date-info">
                        <div className="region-container">
                            {regions.map(region => (
                                <div
                                    key={region.id}
                                    className={`region ${selectedRegion === region.name ? 'selected' : ''}`}
                                    onClick={() => handleRegionSelect(region.id)}
                                >
                                    {region.name}
                                </div>
                            ))}
                        </div>

                        {selectedRegion && (
                            <div className="sub-region-container">
                                {selectedSubRegions.map(subRegion => (
                                    <div
                                        key={subRegion}
                                        className={`sub-region ${selectedSubRegion === subRegion ? 'sub-selected' : ''} ${selectedRegion ? 'region-selected' : ''}`}
                                        onClick={() => handleSubRegionSelect(subRegion)}
                                    >
                                        {subRegion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="date-selection">
                    <div className="label">날짜</div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                </div>

                <div className="time-selection">
                    <div className="label">시간</div>
                    <div className="theater-info">
                        {isTheaterAndDateSelected ? (
                            times.map(theater => (
                                <div key={theater.id} className="time-row">
                                    <div className="screen">
                                        <div className="screen-details">
                                            <div className="screen-name">{theater.theater}</div>
                                            <div className="screen-seat"> ({theater.seats}석)</div>
                                        </div>

                                        <div className="time-slots">
                                            {theater.timeSlots.map(slot => (
                                                <div key={slot.timeId} className="time-slot-container">
                                                    <div
                                                        className={`time-btn ${selectedTimeIds[theater.id] === slot.timeId ? 'selected-time' : ''}`}
                                                        onClick={() => handleTimeSelect(theater.id, slot.timeId, slot.startTime)}
                                                        title={`종료 시간: ${slot.endTime}`}
                                                    >
                                                        {slot.startTime}
                                                    </div>
                                                    <div className="remaining-seats">({slot.remainingSeats}석)</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="message">극장, 날짜를 선택해주세요.</div>
                        )}
                    </div>
                </div>

                <div className="next-button-container">
                    <button
                        className={`next-button ${isAllSelected ? 'active' : ''}`}
                        onClick={isAllSelected ? showReserve : null}
                    >
                        다음
                    </button>

                    <div>
                        {selectedTime && <div>선택된 시간: {selectedTime}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReserveDetail;
