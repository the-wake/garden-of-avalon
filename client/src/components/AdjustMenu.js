import React, { useEffect, useState } from 'react';
import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, Button, Select, Checkbox } from '@chakra-ui/react';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react'

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'

const AdjustMenu = ({ handleBulkUpdate, editState, savedRolls }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [adjustments, setAdjustments] = useState({ sqAdjust: '', txAdjust: '' });

  const handleAdjFormUpdate = (e) => {
    setAdjustments({ ...adjustments, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    console.log(adjustments);
  }, [adjustments]);

  useEffect(() => {
    setAdjustments({ sqAdjust: '', txAdjust: '' });
  }, [isOpen]);

  return (
    <>
      <Button colorScheme="blue" width='100%' disabled={editState !== false || savedRolls.length === 0} onClick={onOpen}>Bulk-Adjust Rolls</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adjust Saved Rolls</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl onChange={handleAdjFormUpdate}>
              <Flex flexDirection="row" gap={4}>
                <FormLabel>+/- SQ</FormLabel>
                <NumberInput value={adjustments.sqAdjust} name="sqAdjust">
                  <NumberInputField />
                </NumberInput>
                <Spacer />
                <FormLabel>+/- Tickets</FormLabel>
                <NumberInput value={adjustments.txAdjust} name="txAdjust">
                  <NumberInputField />
                </NumberInput>
              </Flex>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue"
              onClick={() => {
                handleBulkUpdate(adjustments.sqAdjust, adjustments.txAdjust);
                setAdjustments({ sqAdjust: 0, txAdjust: 0 })
                onClose();
              }}
            >Adjust Rolls</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>

  )
};

export default AdjustMenu;
