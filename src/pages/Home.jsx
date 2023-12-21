import React from 'react';

import { Box, Text, Hide, Show} from '@chakra-ui/react';

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
    <Show above='sm'>
    <Box>This text appears at the "sm" value screen width or greater.</Box>
  </Show>
  <Hide below='md'>
    <Box>This text hides at the "md" value screen width and smaller.</Box>
  </Hide>
    
    <Testing/>
    </React.Fragment>
  )
}

export default Home