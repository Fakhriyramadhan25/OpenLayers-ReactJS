import { Flex, Heading, Image, Text, Button, Spacer, HStack, useToast, AvatarBadge, Avatar } from "@chakra-ui/react"
import {UnlockIcon} from "@chakra-ui/icons";
import SpadeLogo from '../img/spadelogo.jpg';

const Navbar = () => {
const toast = useToast();

  return (
    <Flex as="nav" alignItems="center" mb="20px" p="10px">
        <Image boxSize="50px" src={SpadeLogo} alt="Spade Logo" borderRadius="20px" mr="10px"/>
        <Heading as="h1" fontSize="2em">Spatialy Design</Heading>
        <Spacer/>
        <HStack spacing="30px">
            <Text>testing area</Text>
            <Button
            colorScheme="blue"
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