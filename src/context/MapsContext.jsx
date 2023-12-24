import { createContext, useReducer } from "react"

const MapsContext = createContext();

const initialURL = {
    mapURL: ""
}

const mapReducer = (state, action) => {
    switch(action.type){
        case 'UPDATE': 
            return{
                mapURL: action.payload
            }
        default:
            return state
    }
}

const MapContextProvider = ({children}) => {
    const [state, tryDispatch] = useReducer(mapReducer, initialURL);
    

    return (
        <MapsContext.Provider value={{...state, tryDispatch}}>
            {children}
        </MapsContext.Provider>
    )
}


export {MapsContext, MapContextProvider}