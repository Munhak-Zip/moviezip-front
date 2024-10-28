import React, {useState,useEffect} from 'react';
import Mypage_css from "../../resources/css/Mypage/Mypage.css"
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Mypage = () => {
    const navigate = useNavigate();
    const [changeToggle, setChangeToggle] = useState(false);
    const [reserveDetails, setReserveDetails] = useState([]);
    const [userId, setUserId] = useState('');
    const [userInfo, setUserInfo] = useState({ nickname: '', userId: '', password: '' });
    const [userInterest, setUserInterest] = useState([]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordMatched, setIsPasswordMatched] = useState(true);
    const [newNickname, setNewNickname] = useState(userInfo.nickname);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchReservationDetails(storedUserId);
            fetchUserInfo(storedUserId);
            fetchUserInterest(storedUserId);
        } else {
            console.error('No user ID found in local storage');
        }
    }, []);

    const fetchUserInfo = (userId) => {
        axios.get('/mypage/user', { params: { userId: userId } })
            .then(response => {
                const data = response.data;
                setUserInfo({
                    nickname: data.nickname,
                    userId: data.userId,
                    password: data.password
                });
            })
            .catch(error => {
                console.error('Request failed:', error);
            });
    };
    //닉네임
    const handleNicknameChange = () => {
        axios.post('/changeNickname', {
            userId: userId,
            newNickname: newNickname
        })
            .then(response => {
                alert("닉네임이 성공적으로 변경되었습니다.");
                setUserInfo({ ...userInfo, nickname: newNickname }); // 변경된 닉네임 반영
                setNewNickname(''); // 입력 필드 초기화
            })
            .catch(error => {
                console.error('닉네임 변경 실패:', error);
            });
    };

    //관심사 불러오기
    const fetchUserInterest = (userId) => {
        axios.get('/mypage/user/interest', { params: { userId: userId } })
            .then(response => {
                setUserInterest(response.data); // Assuming the response contains the user's genres as an array
            })
            .catch(error => {
                console.error('Request failed:', error);
            });
    };

    const handleGenreChange = (e) => {
        const selectedGenre = e.target.value;
        setUserInterest([selectedGenre]); // 하나의 선택된 장르로 설정
    };


//interest 수정
    const handleInterestChange = () => {
        axios.post('/changeInterest', {
            userId: userId,
            genre: userInterest[0] // 선택된 장르 하나만 전송
        })
            .then(response => {
                alert("관심사가 성공적으로 변경되었습니다.");
            })
            .catch(error => {
                console.error('관심사 변경 실패:', error);
            });
    };
    const fetchReservationDetails = (userId) => {
        axios.get('/user/mypage', { params: { userId: userId } })
            .then(response => {
                const reserveData = response.data.map(reservation => {
                    return {
                        ...reservation,
                        dateR: new Date(reservation.dateR).toLocaleDateString() // Format dateR
                    };
                });
                setReserveDetails(reserveData);
            })
            .catch(error => {
                console.error('Request failed:', error);
            });
    };

    const onClickChangebtn = () => {
        setChangeToggle(!changeToggle);
    };

    //비번 확인하기
    const checkPassword = () => {
        const enteredPassword = document.getElementById("current_pw-input").value;

        axios.get(`/mypage/checkUserPass`, { params: { userId: userId, password: enteredPassword } })
            .then(response => {
                if (response.data) {
                    setChangeToggle(true);
                } else {
                    alert("비밀번호가 다릅니다.");
                }
            })
            .catch(error => {
                console.error('Request failed:', error);
            });
    };


    //변경할 비번 같은지 확인
    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        setIsPasswordMatched(e.target.value === confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setIsPasswordMatched(newPassword === e.target.value);
    };

    //비번 변경
    const handlePasswordChange = () => {
        if (!isPasswordMatched) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        // 비밀번호 변경 로직 추가
        axios.post('/changePassword', {
            userId: userId,
            newPassword: newPassword
        })
            .then(response => {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                setChangeToggle(false); // 비밀번호 변경 입력 필드를 숨김
                setNewPassword('');
                setConfirmPassword('');
            })
            .catch(error => {
                console.error('비밀번호 변경 실패:', error);
            });
    };
    const ganre = ["한국영화", "SF", "코미디", "해외 영화", "판타지", "로맨스", "애니메이션", "드라마 장르", "스릴러", "액션", "영화", "호러", "다큐멘터리", "음악/뮤지컬", "단편영화"];

    return (
        <div className={"wrap"}>
            <div className={"content_wrap"}>
                <div className={"views_name"}>마이페이지</div>
                <div className={"mypage-userinfo"}>
                    <div className={"article"}>
                        <div className={"index"} id={"nickname"}>닉네임</div>
                        <input
                            className={"input_info"}
                            type={"text"}
                            value={newNickname || userInfo.nickname} // 기존 닉네임 표시
                            onChange={(e) => setNewNickname(e.target.value)}
                        />
                        <button className={"change_btn"} onClick={handleNicknameChange}>
                            <p>변경</p>
                        </button>
                    </div>
                    <div className={"article"}>
                        <div className={"index"} id={"id"}>아이디</div>
                        <input className={"input_info"} type={"text"} value={userInfo.userId} readOnly/>
                    </div>
                    <div className={"article"}>
                        <div className={"index"} id={"current_pw"}>현재비밀번호</div>
                        <input className={"input_info"} type={"password"} id="current_pw-input"/>
                        <button className={"change_btn"} onClick={checkPassword}><p>확인</p></button>
                    </div>
                    {changeToggle ? (
                        <div>
                            <div className={"article"}>
                                <div className={"index"} id={"new_pw"}>새 비밀번호</div>
                                <input
                                    className={"input_info"}
                                    type={"text"}
                                    id={"new_pw-input"}
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
                                />
                            </div>
                            <div className={"article"}>
                                <div className={"index"} id={"check_new_pw"}>새 비밀번호 확인</div>
                                <input
                                    className={"input_info"}
                                    type={"text"}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                />
                                {!isPasswordMatched && (
                                    <p style={{color: 'red', fontSize: '12px'}}>비밀번호가 일치하지 않습니다.</p>
                                )}
                                <button className={"change_btn"} disabled={!isPasswordMatched}
                                        onClick={handlePasswordChange}><p>변경</p></button>
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className={"mypage-like"}>
                    <p>좋아하는 장르</p>
                    <form>
                        <div className={"radio_btn"}>
                            {ganre.map((p, index) => {
                                const radioId = `genre-${index}`;
                                return (
                                    <div key={index} id={"radio_btn"}>
                                        <input
                                            type="radio"
                                            id={radioId}
                                            value={p}
                                            name="genre"
                                            checked={userInterest.includes(p)}
                                            onChange={handleGenreChange}
                                        />
                                        <label htmlFor={radioId}>{p}</label>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            className={"change_btn"}
                            id={"ganre-change"}
                            type="button"
                            onClick={handleInterestChange}
                        >변경
                        </button>
                    </form>
                </div>
                <div className={"reservation_info"}>
                    <table id={"reservation_info"}>
                        <thead>
                        <tr>
                            <th>영화명</th>
                            <th>관람일</th>
                            <th>좌석</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reserveDetails.map((reservation, index) => (
                            <tr key={index}>
                                <td>{reservation.mvTitle}</td>
                                <td>{reservation.dateR} {reservation.time}</td>
                                <td>{reservation.seat}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Mypage;