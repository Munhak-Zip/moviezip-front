import React from 'react';
import {Link, useNavigate} from "react-router-dom";

const Main=() =>{
    return (
        <div>
            메인입니당
            <Link to={"/user/mypage"}>
                <button>민영</button>
            </Link>
        </div>
    );
}

export default Main;