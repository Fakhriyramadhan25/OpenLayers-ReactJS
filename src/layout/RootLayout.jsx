import { Grid, GridItem } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

// component 
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";


const RootLayout = () => {
  return (
    <Grid templateColumns="repeat(6,1fr)" bg="blue.100">
      <GridItem as="aside" colSpan={{ base: 6, lg: 2, xl: 1 }}  
      minHeight={{lg:'100vh'}} p={{base:'20px', lg:'30px'}}
      bg="blue.400"
      >
        <Sidebar/>
      </GridItem>

      <GridItem as="main" 
      colSpan={{ base: 6, lg: 4, xl: 5 }} 
       p={{base:'10px', lg:'30px'}}>
        <Navbar/>
      <Outlet />
      </GridItem>
      
    </Grid>
  )
}

export default RootLayout