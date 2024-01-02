import React, { useEffect, useState } from 'react';
import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, Button, Select, Checkbox, Box, Textarea } from '@chakra-ui/react';

import { useSelector } from 'react-redux';

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'

import AdjustMenu from '../components/AdjustMenu.js';

const CalcFooter = ({ summonStats, setSummonStats, editState, handleEditCancel, handleBulkUpdate, savedRolls, setSavedRolls, saveSnapshot, clearForm, noteChangeHandler, noteSubmitHandler, notesReset }) => {

  const currentNote = useSelector((state) => state.note.activeNote);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <GridItem mt={4} backgroundColor="#BEE3F8" width="100%" padding={4} mx="auto" position="fixed" bottom={0} as="footer">
      <Flex flexDirection="row" justifyContent="space-evenly" gap={4}>
        {/* <Button colorScheme="blue" onClick={calcOdds} flexBasis={6} flexGrow={1}>Calculate!</Button> */}<Button colorScheme="blue" flexBasis={6} flexGrow={1} onClick={saveSnapshot}>{editState === false ? 'Save Snapshot' : 'Update Snapshot'}</Button>
        <Button colorScheme="red" onClick={handleEditCancel} flexBasis={6} flexGrow={1} hidden={editState === false}>Cancel Edit</Button>
        <Button colorScheme="blue" onClick={onOpen} flexBasis={6} flexGrow={1}>See/Set Note</Button>
        <Button colorScheme="blue" flexBasis={6} flexGrow={1} onClick={clearForm}>Clear Form</Button>
        <Box flexBasis={6} flexGrow={1}>
          <AdjustMenu handleBulkUpdate={handleBulkUpdate} editState={editState} savedRolls={savedRolls} />
        </Box>
      </Flex>
      <Modal isOpen={isOpen} onClose={() => { onClose(); notesReset(); }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea h='250px' name='summonNotes' value={currentNote} onChange={noteChangeHandler}></Textarea>
          </ModalBody>

          <ModalFooter>
            {/* <Button mr={3} variant="ghost" onClick={onClose}>Cancel</Button> */}
            <Button colorScheme="blue"
              onClick={() => {
                noteSubmitHandler();
                onClose();
                notesReset();
              }}
            >Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </GridItem>
  );
};

export default CalcFooter;
