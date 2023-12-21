import { Flex, Heading, Image, Button, Spacer, HStack, useToast, AvatarBadge, Avatar } from "@chakra-ui/react"
import {UnlockIcon} from "@chakra-ui/icons";
import SpadeLogo from '../img/spadelogo.jpg';

const Navbar = () => {
const toast = useToast();

  return (
    <Flex as="nav" alignItems="center" mt={0} bg='blue.100' p={{base:'10px', lg:'15px'}}>
        <Image boxSize="50px" src={SpadeLogo} alt="Spade Logo" borderRadius="xl" mr="15px" ml='8%'/>
        <Heading as="h3" fontSize="2xl">Spatialy Design</Heading>
        <Spacer/>
        <HStack spacing="30px" mr='8%'>
            <Button
              _hover={{
                background: "white",
                color: "blue.800",
              }}
            colorScheme="blue"
            borderRadius="2xl"
            onClick={()=>toast({
              title: "Login",
              description: "Successfully",
              duration: 5000,
              isClosable: true,
              position: "bottom",
              status: "info",
              icon:<UnlockIcon/>
            })}
            >Login</Button>
        </HStack>
    </Flex>
  )
}

export default Navbar