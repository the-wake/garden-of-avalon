import React, { useEffect, useState } from 'react';

import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox, IconButton, NumberInput, NumberInputField } from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'


import "react-datepicker/dist/react-datepicker.css";

const RateupMenu = ({ probHandler, summonStats, setSummonStats, oddsObj }) => {
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const [newProb, setNewProb] = useState('')

  // const probChangeHandler = (e) => {
  //   setNewProb(e.target.value);
  // };

  const optionsRender = () => {
    console.log(summonStats.prob);
    return oddsObj[summonStats.rarity].map((odds, index) => {
      return (
        <option key={index} value={index + 1}>{index + 1} Rateup</option>
      )
    })
  };

  return (
    <>
      <GridItem rowSpan={1} colSpan={1}>
        <FormLabel>Desired Servant Rarity:</FormLabel>
        <Select className="form-input" name="rarity" type="text" selected={summonStats.rarity} value={summonStats.rarity} onChange={probHandler}>
          <option value={'ssr'}>5* (SSR)</option>
          <option value={'sr'}>4* (SR)</option>
          <option value={'r'}>3* (R)</option>
        </Select>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <FormLabel>Total Servants on Rateup:</FormLabel>
        <Select className="form-input" name="numRateup" type="text" onChange={probHandler}
          // onChange={(e) => {
          //   probHandler(e);
          //   e.target.value == 0 && onOpen();
          // }}
          defaultValue={1}
          value={summonStats.numRateup}>
          {optionsRender()}
          <option value={0}>Other (please specify odds manually)</option>
        </Select>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <FormLabel>Probability of success per roll:</FormLabel>
        <NumberInput isReadOnly={summonStats.numRateup != 0} value={summonStats.prob} >
          <NumberInputField className="form-input" name="prob" onChange={probHandler} />
        </NumberInput>
      </GridItem>

      {/* <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Manual odds</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl onChange={probChangeHandler}>
              <FormLabel>+/- Tickets</FormLabel>
              <NumberInput value={newProb} name="newProb">
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue"
              onClick={() => {
                setSummonStats({ ...summonStats, prob: parseFloat(newProb) });
                setNewProb('');
                onClose();
              }}
            >Adjust Rolls</Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </>
  );
};

export default RateupMenu;
