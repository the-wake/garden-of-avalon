import React, { useEffect, useState } from 'react';
import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, Button, Select, Checkbox } from '@chakra-ui/react';


const CalcFooter = ({ calcOdds, elementState, summonStats, saveSnapshot, editState, handleEditCancel }) => {

  return (
    <GridItem colSpan={2} marginTop={4}>
      <Flex flexDirection="row" justifyContent="space-between" gap={4}>
        <Button colorScheme="blue" onClick={calcOdds} flexBasis={1} flexGrow={1}>Calculate!</Button>
        <Button colorScheme="red" onClick={handleEditCancel} flexBasis={1} flexGrow={1} hidden={editState === false}>Cancel Edit</Button>
      </Flex>
    </GridItem>
  );
};

export default CalcFooter;
