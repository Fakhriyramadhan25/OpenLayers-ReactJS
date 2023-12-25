import React from 'react';
import '../app.css';
import Logo from '../img/spadelogo.jpg';

import { Stack, Flex, Box, Heading, Text, HStack} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

const Feature = ({title, rest, desc}) => {

  return (
    <Box p={5} shadow='2xl' borderWidth='1px' {...rest} bgColor='white' h="200px" borderRadius='xl' textAlign='center'>
    <HStack>
      <Box mt="10px">
        <img src={Logo} alt='Spatially Design Logo'/>
      </Box>
      <Box mt="25px">
        <Heading fontSize='3xl' color='blue.600'>{title}</Heading>
        <Text mt={4} >{desc}</Text>
      </Box>
    </HStack>
    </Box>
  )
}

const Home = () => {

  return (
    <Box h='90vh'> 
    <Flex bgColor='blue.100' minH='100vh'>
      <Stack spacing={8} direction='row' mx='auto' mt="15%">
        <Feature title='Spatially Design'
        desc='Geo-dashboard using Openlayers Library'
        buttonName="let's Start"/>
          <NavLink to="maps">
        <Box className='arrow-right' ></Box>
          </NavLink>
      </Stack>
    </Flex>
    </Box>
  )
}

export default Home