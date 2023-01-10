import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button } from '@chakra-ui/react'

const SummonCalc = () => {

  const [startingSQ, setStartingSQ] = useState(0);
  const [startingTx, setStartingTx] = useState(0);
  const [nLogins, setNLogins] = useState(0);
  const [consLogins, setConsLogins] = useState(0);

  const today = { y: dayjs().$y, m: dayjs().$M + 1, d: dayjs().$D };

  const periodics = {
    weeklyLogin: [
      { fp: 2000 },
      { sq: 1 },
      { xp: 1 },
      { sq: 1 },
      { xp: 2 },
      { sq: 2 },
      { tx: 1 },
    ],
    totalLogin: {
      sq: 30
    },
    shop: {
      tx: 5
    },
  };

  // origin = Starting data (sq, tickets, etc.). Start = date to calculate from. Target = end of calculations.
  const calcWeeklies = (origin, start, target) => {
    // Probably better to make an array with each reward, and have the function just move through each index of the array for N number of times.

    // Have this get today's index of the weekly rotation.
    const index = origin;
    // Have this get the remainder of the final week if n < 7.
    const remainder = start % target;
    // This gets the values of each full weeks' gains.
    const weeks = start - target;

    const gains = index + remainder + weeks;
    return gains;
  };

  const calcEvents = (origin, start, target) => {
    // I have no idea. Atlas has an event API though.
    return 0;
  }

  const calc = (purchases) => {
    // Purchases should be sent as an object and destructured into number of purchases and number of SQ per. Everything else can probably come from state since the element sending the function call probably won't have direct access to that data.
    
    const weeklies = calcWeeklies();
    const total = startingSQ + weeklies + calcEvents;
    return total;
  };

  const handleFormUpdate = (e) => {
    if (e.target.name === 'startingSQ') {
      setStartingSQ(e.target.value);
    }
    if (e.target.name === 'startingTx') {
      setStartingTx(e.target.value);
    }
    // Set these up to read the correct value and useState.
  };

  const handleFormSubmit = () => {
    console.log(`${startingSQ} SQ, ${startingTx} Tickets`)
  }

  useEffect(() => {
    // console.log(startingSQ, startingTx)
  }, [startingSQ, startingTx]);

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />
      <FormControl maxW="400px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
        <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Quartz:</FormLabel>
            <Input className="form-input" name="startingSQ" placeholder="0" onSubmit={handleFormSubmit} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Tickets:</FormLabel>
            <Input className="form-input" name="startingTx" placeholder="0" onSubmit={handleFormSubmit} />
          </GridItem>
        </Grid>
        <Button marginTop={4} colorScheme="blue" onClick={handleFormSubmit} >Calculate</Button>
      </FormControl>
    </>
  )
};

export default SummonCalc;
