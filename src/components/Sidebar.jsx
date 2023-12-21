import React from 'react';
import {List,ListItem, ListIcon, Text} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import {FaHome} from 'react-icons/fa';
import {SiGooglemaps} from 'react-icons/si';


const Sidebar = () => {

  return (
    <>
 
    <List colorScheme='blue' fontSize="1em" spacing={6} mt={8} ml={2}>
      <ListItem>
        <NavLink to="/">
          <ListIcon as={FaHome} color="white" w={10} boxSize={6}/>
          <Text fontSize='lg' as='b' color="white">
              HOME
          </Text>
          
        </NavLink>
      </ListItem>
      <ListItem>
        <NavLink to="maps">
          <ListIcon as={SiGooglemaps} color="white" w={10} boxSize={6}/>
          <Text fontSize='lg' as='b' color="white">
          MAP
          </Text>
          
        </NavLink>
      </ListItem>
      <ListItem>
        <NavLink to="dashboard">
          <ListIcon as={HamburgerIcon} color="white" w={10} boxSize={6}/>
          <Text fontSize='lg' as='b' color="white">
          DASHBOARD
          </Text>
        </NavLink>
      </ListItem>
    </List>
   
    </>
  )
}

export default Sidebar