import './App.css';
import { 
  createBrowserRouter, 
  createRoutesFromElements, 
  Route, 
  RouterProvider 
} from 'react-router-dom'

// components
import MapWrapper from './pages/MapWrapper';
import RootLayout from './layout/RootLayout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import { MapContextProvider } from './context/MapsContext';


function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout/>}>
        <Route index element={<Home/>}/>
        <Route path="maps" element={<MapWrapper/>}/>
        <Route path="dashboard" element={<Dashboard/>}/>
      </Route>
    )
  )

  return (
    <MapContextProvider>
    <RouterProvider router={router} />
    </MapContextProvider>
  )
}

export default App