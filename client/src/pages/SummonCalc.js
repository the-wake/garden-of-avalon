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

  const periodic = {
    weeklyLogin: [
      {
        type: 'fp',
        val: 2000
      },
      {
        type: 'sq',
        val: 1
      },
      {
        type: 'xp',
        val: 1
      },
      {
        type: 'sq',
        val: 1
      },
      {
        type: 'xp',
        val: 2
      },
      {
        type: 'sq',
        val: 2
      },
      {
        type: 'tx',
        val: 1
      },
    ],
    fullWeek: {
      sq: 4,
      tx: 1
    },
    totalLogin: {
      sq: 30
    },
    shop: {
      tx: 5
    },
  };

  // const today = { y: dayjs().$y, m: dayjs().$M + 1, d: dayjs().$D };

  // origin = Starting data (sq, tickets, etc.). Start = date to calculate from. Target = end of calculations.

  const calcLogins = (start, numDays) => {
    // Probably better to make an array with each reward, and have the function just move through each index of the array for N number of times.

    const today = dayjs();
    // console.log(today);

    let distance = dayjs(start).diff(dayjs(today), 'days');

    // It seems like the diff between day X and day X+1 comes out to 0, so this 
    if (distance >= 1) {
      distance++
    } else if (distance === 0 && (start.$y > today.$y || start.$M > today.$M || start.$d > today.$d)) {
      distance++
    };
    
    console.log(`${distance} days from today to start date.`)

    // The weekly index of the start day.
    const index = (loginData.consecutive + distance) % 7;

    const remainder = numDays % 7;

    // This gets the values of each full weeks' gains.
    const weeks = (numDays - remainder) / 7;
    console.log(`Starting index: ${index}. Full weeks: ${weeks}. Remainder days: ${remainder}.`);

    const calcWeeklies = () => {

      let weeklyGains = {
        sq: 0,
        tx: 0
      };

      for (let i = 0; i < numDays; i++) {
        let trueI = (i + index) % 7;

        // console.log(trueI);

        const thisLogin = periodic.weeklyLogin[trueI];
        // console.log(`Today's login reward: ${JSON.stringify(thisLogin)}`);

        if (thisLogin.type in weeklyGains) {
          // console.log(`Corresponding value found: ${thisLogin.type}`);
          weeklyGains[thisLogin.type] += thisLogin.val;
        };


        // This embedded loop seems to cause React to freak out and infinitely run the loop.
        // for (let ind = 0; ind < Object.keys(weeklyGains).length; ind++) {
        //   const thisField = Object.keys(weeklyGains)[ind];

        //   // console.log('Loop.');
        //   console.log(`Login: ${JSON.stringify(thisLogin)} - Field: ${thisField}`);

        //   // if (thisLogin.type == thisField) {
        //   //   weeklyGains[ind] += thisLogin.val;
        //   // };
        // }

      };
      console.log(`Added ${weeklyGains.sq} Saint Quartz and ${weeklyGains.tx} Summoning Tickets.`)
      console.log(weeklyGains);
    };

    calcWeeklies();

    // const gains = {
    //   sq: periodic.fullWeek.sq * weeks,
    // };
    // return gains;
  };

  const calcEvents = (origin, start, target) => {
    // I have no idea. Atlas has an event API though.
    return 0;
  }

  const calc = (purchases) => {
    // Purchases should be sent as an object and destructured into number of purchases and number of SQ per. Everything else can probably come from state since the element sending the function call probably won't have direct access to that data.

    const start = dayjs(dates.start);
    const target = dayjs(dates.target);
    let numDays = dayjs(target).diff(dayjs(start), 'day');

    // It seems like we need to manually adjust differences since anything that should be 1 or higher is reduced by 1.
    if (numDays >= 1) {
      numDays++
    } else if (numDays === 0 && (target.$y > start.$y || target.$M > start.$M || target.$d > start.$d)) {
      numDays++
    };

    console.log(`${currency.sq} SQ, ${currency.tx} Tickets`);
    // console.log(`${numDays} days between dates.`)

    const weeklies = calcLogins(start, numDays);
    const total = currency.sq + currency.tx * 3 + weeklies + calcEvents;
    return total;
  };

  const handleFormUpdate = (e) => {
    setCurrency({ ...currency, [e.target.name]: e.target.value });
  };

  // useEffect(() => {
  //   console.log(currency);
  // }, [currency]);

  // useEffect(() => {
  //   console.log(`Range: ${dayjs(dates.start)} through ${dayjs(dates.target)}`);
  // }, [dates]);

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />
      <FormControl maxW="400px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
        <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Quartz:</FormLabel>
            <Input className="form-input" name="sq" placeholder="0" onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Tickets:</FormLabel>
            <Input className="form-input" name="tx" placeholder="0" onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            From:
            <DatePicker selected={dates.start} onChange={(date) => setDates({ ...dates, ["start"]: date })} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            To:
            <DatePicker selected={dates.target} onChange={(date) => setDates({ ...dates, ["target"]: date })} />
          </GridItem>
        </Grid>
        <Button marginTop={4} colorScheme="blue" onClick={calc} >Calculate</Button>
      </FormControl>
    </>
  )
};

export default SummonCalc;
