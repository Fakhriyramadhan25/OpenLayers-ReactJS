import React from 'react';

import { Box, Text } from '@chakra-ui/react';

const Testing = () => {
  return (
    <Box>
      <Text>Testing</Text>
    </Box>
  )
}

const Home = () => {

  return (
    <React.Fragment>
    <div>Home</div>
    <Testing/>
    </React.Fragment>
  )
}

export default Home