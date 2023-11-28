import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link as ReactRouterLink } from 'react-router-dom'
import { Box, Flex, Spacer, Heading, Text, ButtonGroup } from "@chakra-ui/react"
import { Link as ChakraLink, LinkProps } from '@chakra-ui/react'

// Do we want Container // ChakraProvider to help with this?

import { HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronRightIcon, } from '@chakra-ui/icons'


const Header = () => {

  return (
    <Box as="header" bg="skyblue" height="120px" px="3rem" mb="2rem">
      <Flex height="100%" justifyContent="center" alignItems="center" gap="2" >
        <Heading as="h1" noOfLines={1}>
          Garden of Avalon
        </Heading>
        {/* <Spacer />
        <ButtonGroup as="nav" gap='2'>
          <ChakraLink as={ReactRouterLink} to={"/"}>Home</ChakraLink>
          <ChakraLink as={ReactRouterLink} to={"/calculator"}>Summon Calculator</ChakraLink>
        </ButtonGroup> */}
      </Flex>
    </Box>
  )
};

export default Header;
