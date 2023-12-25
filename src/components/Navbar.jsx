import { Flex, Heading, Image, Spacer} from "@chakra-ui/react"
import SpadeLogo from '../img/spadelogo.jpg';

const Navbar = () => {

  return (
    <Flex as="nav" alignItems="center" mt={0} bg='blue.100' p={{base:'10px', lg:'15px'}}>
        <Image boxSize="50px" src={SpadeLogo} alt="Spade Logo" borderRadius="xl" mr="15px" ml='8%'/>
        <Heading as="h3" fontSize="2xl">Spatialy Design</Heading>
        <Spacer/>
    </Flex>
  )
}

export default Navbar;