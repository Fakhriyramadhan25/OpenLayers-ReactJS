import { Grid, GridItem, Button } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { DragHandleIcon } from "@chakra-ui/icons";

// component 
import Sidebar from "../components/Sidebar";


const RootLayout = () => {
  const [activate, setActivate] = useState(false);
  const [ cssWidth, setCssWidth ] = useState("0px");
  const [ cssRight, setCssRight ] = useState("0px");

  const handleClick = ()=>{
    setActivate(!activate)
    if(activate === false){
      setCssWidth("250px");
      setCssRight("250px");
    }
    else if(activate === true){
      setCssRight("0px");
      setCssWidth("0px");
    }
  }

  return (
   <>
    <Grid templateColumns="repeat(6,1fr)" bg="white" h='100vh'>
      <Button w={4} bg='white' color='blue.500' position='fixed' 
      top='2.9%' right='5%' onClick={handleClick} borderRadius='xl'
      _hover={{
        background: "blue.800",
        color: "white",
      }}>
        
        <DragHandleIcon boxSize={6}/>
      </Button>

      {activate === true ? 
      (
      <GridItem as="aside" z-index='2' 
      minHeight={{lg:'100vh'}} p={{base:'20px', lg:'30px'}}
      bg="blue.400" position='absolute' width={cssWidth}
      >
        <Sidebar/>
      </GridItem> 
      ) : ""}
    
      <GridItem as="main" 
      z-index='1'
      colSpan={{ base: 6, lg: 4, xl: 6 }} 
      ml={cssRight}
     >
       
      <Outlet />
      </GridItem>
      
    </Grid>
    </> 
  )
}

export default RootLayout