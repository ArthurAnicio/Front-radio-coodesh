import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
function RoutesWeb(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" Component={Home}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesWeb