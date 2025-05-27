import {FadeLoader} from "react-spinners";

export function LoadingSpinner() {
    return <div className="flex items-center justify-center h-screen">
                <FadeLoader color="#FFFFFF"/>
           </div>;
}