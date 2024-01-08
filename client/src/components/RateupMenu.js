import React, { useEffect, useState } from 'react';

import { Grid, GridItem, Flex, Spacer, Tooltip } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, Button, Select, Checkbox, IconButton, NumberInput, NumberInputField } from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';


import "react-datepicker/dist/react-datepicker.css";

const RateupMenu = ({ probHandler, summonStats, setSummonStats, oddsObj }) => {

  const optionsRender = () => {
    return oddsObj[summonStats.rarity].map((odds, index) => {
      return (
        <option key={index} value={index + 1}>{index + 1} Rateup</option>
      )
    })
  };

  return (
    <>
      <GridItem rowSpan={1} colSpan={1}>
        <FormLabel>Desired Servant Rarity: <Tooltip label="Single 4* rate and triple 4* rate improved New Year 2022 on JP."><QuestionOutlineIcon></QuestionOutlineIcon></Tooltip></FormLabel>
        <Select className="form-input" name="rarity" type="text" selected={summonStats.rarity} value={summonStats.rarity} onChange={probHandler}>
          <option value={'ssr'}>5* (SSR)</option>
          <option value={'sr'}>4* (SR, NA Rates)</option>
          <option value={'srjp'}>4* (SR, JP Rates)</option>
          <option value={'r'}>3* (R)</option>
        </Select>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <FormLabel>Total Servants on Rateup:</FormLabel>
        <Select className="form-input" name="numRateup" type="text" onChange={probHandler}
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
    </>
  );
};

export default RateupMenu;
