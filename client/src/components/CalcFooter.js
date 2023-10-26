import React, { useEffect, useState } from 'react';
import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, Button, Select, Checkbox, Box } from '@chakra-ui/react';

import AdjustMenu from '../components/AdjustMenu.js';

const CalcFooter = ({ setNote, editState, handleEditCancel, handleBulkUpdate, savedRolls, clearForm }) => {

  return (
    <GridItem mt={4} backgroundColor="#BEE3F8" width="100%" padding={4} mx="auto" position="fixed" bottom={0} as="footer">
      <Flex flexDirection="row" justifyContent="space-evenly" gap={4}>
        {/* <Button colorScheme="blue" onClick={calcOdds} flexBasis={6} flexGrow={1}>Calculate!</Button> */}
        <Button colorScheme="blue" onClick={setNote} flexBasis={6} flexGrow={1}>Set Note</Button>
        <Button colorScheme="red" onClick={handleEditCancel} flexBasis={6} flexGrow={1} hidden={editState === false}>Cancel Edit</Button>
        <Button colorScheme="blue" flexBasis={6} flexGrow={1} onClick={clearForm}>Clear Form</Button>
        <Box flexBasis={6} flexGrow={1}>
          <AdjustMenu handleBulkUpdate={handleBulkUpdate} editState={editState} savedRolls={savedRolls} />
        </Box>
      </Flex>
    </GridItem>
  );
};

export default CalcFooter;
