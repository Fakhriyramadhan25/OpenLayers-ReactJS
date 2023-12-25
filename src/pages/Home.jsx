import React from 'react';
import '../app.css';
import Logo from '../img/spadelogo.jpg';
import TravellingAsset from '../img/travelling.png';

import { Stack, Flex, Box, Heading, Text, HStack, Image} from '@chakra-ui/react';
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
    <Box>
     <Box boxSize="lg" position='absolute' className='travellingAsset' mt="50px" ml="60px">
      <img src={TravellingAsset} alt='Travelling Asset animation' />
     </Box>
    <Flex bgColor='blue.100' minH='100vh'>
      <Stack spacing={8} direction='row' mx='auto' mt="15%" className='whiteBox'>
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