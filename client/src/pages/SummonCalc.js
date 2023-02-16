import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button } from '@chakra-ui/react'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const SummonCalc = () => {

  const [currency, setCurrency] = useState({
    sq: 0,
    tx: 0
  });

  const [loginData, setLoginData] = useState({
    logins: 0,
    consecutive: 0,
  });

  const [dates, setDates] = useState({
    start: new Date(),
    target: new Date(),
  })

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

  const today = { y: dayjs().$y, m: dayjs().$M + 1, d: dayjs().$D };

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
    const total = currency.sq + currency.tx * 3 + weeklies + calcEvents;
    return total;
  };

  const handleFormUpdate = (e) => {
    setCurrency({...currency, [e.target.name]: e.target.value});
  };

  const handleFormSubmit = () => {
    console.log(`${currency.sq} SQ, ${currency.tx} Tickets`)
  };

  useEffect(() => {
    console.log(currency);
  }, [currency]);

  useEffect(() => {
    console.log(`Range: ${dayjs(dates.start)} through ${dayjs(dates.target)}`);
  }, [dates]);

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />
      <FormControl maxW="400px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
        <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Quartz:</FormLabel>
            <Input className="form-input" name="sq" placeholder="0" onSubmit={handleFormSubmit} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Tickets:</FormLabel>
            <Input className="form-input" name="tx" placeholder="0" onSubmit={handleFormSubmit} />
          </GridItem>
        </Grid>
        <DatePicker selected={dates.start} onChange={(date) => setDates({...dates, ["start"]: date})} />
        <DatePicker selected={dates.target} onChange={(date) => setDates({...dates, ["target"]: date})} />
        <Button marginTop={4} colorScheme="blue" onClick={handleFormSubmit} >Calculate</Button>
      </FormControl>
    </>
  )
};

export default SummonCalc;
