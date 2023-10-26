import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import sanitizeEmpty from '../utils/sanitizeEmpty.js'

import { useSelector, useDispatch } from 'react-redux'

import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox, IconButton } from '@chakra-ui/react'
import { EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons'


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
        <FormLabel>Desired Servant Rarity:</FormLabel>
        <Select className="form-input" name="rarity" type="text" onChange={probHandler}>
          <option value={'ssr'}>5* (SSR)</option>
          <option value={'sr'}>4* (SR)</option>
          <option value={'r'}>3* (R)</option>
        </Select>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <FormLabel>Total Servants on Rateup:</FormLabel>
        <Select className="form-input" name="numRateup" type="text" onChange={probHandler} defaultValue={1}>
          {optionsRender()}
          <option value={0}>Other (please specify odds manually)</option>
        </Select>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <FormLabel>Probability of success per roll:</FormLabel>
        <Input className="form-input" isReadOnly={summonStats.numRateup !== 0 ? true : false} name="prob" value={summonStats.prob} />
      </GridItem>
    </>
  );
};

export default RateupMenu;
