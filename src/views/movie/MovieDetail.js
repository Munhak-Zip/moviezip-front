import React, {useState} from 'react';
import '../../resources/css/Movie/MovieDetail.css';
import bookmark from '../../resources/img/Movie/bookmark.png'
import movieImg from '../../resources/img/Movie/movie.png';
import star from '../../resources/img/Movie/star.png';
import starN from '../../resources/img/Movie/star_unclick.png';
import back from '../../resources/img/Movie/back.png';
import {Link, useNavigate} from "react-router-dom";

const MovieDetail=() =>{
    const [starRating, setStarRating] = useState(0); // 별점 상태를 저장하는 state 변수

    // 별점 클릭 시 이벤트 핸들러
    const handleStarClick = (index) => {
        setStarRating(index + 1); // 클릭한 별의 인덱스에 1을 더한 값으로 별점 상태를 업데이트
    };
    return (
        <div className="mobile">
            <div className="back_img">
                <img src={back} width={30} height={30}/>
                {/*좋아하는 영화*/}
            </div>
            <div className="bookmarkMovie">
                <img src={bookmark} width={45} height={45}/>
            </div>
            <div className="imgMovie">
                <img src={movieImg} width={250} height={350}/>
            </div>
            <div className="title">
                파묘
            </div>
            {/* 별점 */}
            <div className="starGroup">
                <img className="star_image" src={star} width={30} height={30}/>
                <img className="star_image" src={star} width={30} height={30}/>
                <img className="star_image" src={star} width={30} height={30}/>
                <img className="star_image" src={star} width={30} height={30}/>
                <img className="star_image" src={star} width={30} height={30}/>
                <div className="star_text">
                    (5)
                </div>
            </div>
            <div className="movie_text">
                영화설명~~~~~~~~~~~~~~~~~~~~~<br/>
                영화설명~~~~~~~~~~
            </div>
            {/* 카테고리 */}
            <div className="category">
                <div className="category_box">
                    <div className="category_text">
                        #스릴러
                    </div>
                </div>
                <div className="category_box">
                    <div className="category_text">
                        #로맨스
                    </div>
                </div>
            </div>
            {/* 버튼 */}
            <button className="reservation_btn">예매하기</button>

            {/*<div className="starGroup">*/}
            {/*    <img className="star_image" src={star} width={40} height={40}/>*/}
            {/*    <img className="star_image" src={star} width={40} height={40}/>*/}
            {/*    <img className="star_image" src={star} width={40} height={40}/>*/}
            {/*    <img className="star_image" src={starN} width={40} height={40}/>*/}
            {/*    <img className="star_image" src={starN} width={40} height={40}/>*/}
            {/*</div>*/}

            <div className="starGroup">
                {[...Array(5)].map((_, index) => (
                    <img
                        key={index}
                        className="star_image"
                        src={index < starRating ? star : starN} // 현재 별점 상태에 따라 이미지 소스를 선택
                        width={40}
                        height={40}
                        onClick={() => handleStarClick(index)} // 별 클릭 시 이벤트 핸들러 호출
                    />
                ))}
            </div>

            <input className="review_text" type="text" placeholder="리뷰를 작성해주세요"/>
            <button className="review_btn">작성</button>

            <div className="expect">
                예상
                <img className="star_ex" src={star} width={25} height={25}/>
                (3)
            </div>
            <div className="expect_box">
                <b className="expect_text_mid">한줄평</b>
                <br/>
                <b className="expect_text">ㅇㅇ님은 이거 이거 좋아해서 영화명은 3점일것입니다~</b>
            </div>

            <div className="critic_title">
                평론가 리뷰
            </div>

            <div className="critic">
                <div className="critic_name">
                    이은선
                    <div className="star_critic">
                        <img className="star_image" src={star} width={25} height={25}/>
                        <img className="star_image" src={star} width={25} height={25}/>
                        <img className="star_image" src={star} width={25} height={25}/>
                        <img className="star_image" src={starN} width={25} height={25}/>
                        <img className="star_image" src={starN} width={25} height={25}/>
                    </div>
                    <div className="bookmark_critic">
                        <img src={bookmark} width={35} height={35}/>
                    </div>
                </div>


                <div className="critic_review_mid">
                    리뷰 소제목
                </div>
                <div className="critic_review">
                    리뷰리뷰리뷰리뷰리뷰~
                </div>

                <div className="horizontal-line"></div>
            </div>
            <div className="critic">
                <div className="critic_name">
                    이은선
                    <div className="star_critic">
                        <img className="star_image" src={star} width={25} height={25}/>
                        <img className="star_image" src={star} width={25} height={25}/>
                        <img className="star_image" src={star} width={25} height={25}/>
                        <img className="star_image" src={starN} width={25} height={25}/>
                        <img className="star_image" src={starN} width={25} height={25}/>
                    </div>
                    <div className="bookmark_critic">
                        <img src={bookmark} width={35} height={35}/>
                    </div>
                </div>


                <div className="critic_review_mid">
                    리뷰 소제목
                </div>
                <div className="critic_review">
                    리뷰리뷰리뷰리뷰리뷰~
                </div>

                <div className="horizontal-line"></div>
            </div>

        </div>
    );
}

export default MovieDetail;