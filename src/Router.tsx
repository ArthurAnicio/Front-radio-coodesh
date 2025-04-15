import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Test from "./pages/test";
function RoutesWeb(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" Component={Home}/>
                <Route path="/Test" Component={Test}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesWeb