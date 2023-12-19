import React from 'react';
import {List,ListItem, ListIcon} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import {FaHome} from 'react-icons/fa';
import {SiGooglemaps} from 'react-icons/si';

const Sidebar = () => {
  return (
    <List colorScheme='blue' fontSize="1em" spacing={6}>
      <ListItem>
        <NavLink to="/">
          <ListIcon as={FaHome} color="white"/>
          Home
        </NavLink>
      </ListItem>
      <ListItem>
        <NavLink to="maps">
          <ListIcon as={SiGooglemaps} color="white"/>
          Map
        </NavLink>
      </ListItem>
      <ListItem>
        <NavLink to="dashboard">
          <ListIcon as={HamburgerIcon} color="white"/>
          Dashboard
        </NavLink>
      </ListItem>
    </List>
  )
}

export default Sidebar