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
    streak: 0,
  });

  const [dates, setDates] = useState({
    start: new Date(),
    target: new Date(),
  });

  const [totals, setTotals] = useState({
    sq: 0,
    tx: 0
  });

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

  const today = dayjs();

  // TODO: We could make a treatment function that just loops through two arguments' year / month / day fields, but since different functions do different things with the data it may be too convoluted.

  // Calculates master missions. Could rename to calcStreak instead to be clearer what data it cares about and produces.
  const calcWeeklies = (start, numDays) => {
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
    const index = (loginData.streak + distance) % 7;

    const remainder = numDays % 7;

    // This gets the values of each full weeks' gains.
    const weeks = (numDays - remainder) / 7;
    console.log(`Starting index: ${index}. Full weeks: ${weeks}. Remainder days: ${remainder}.`);

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
    };
    // console.log(`Added ${weeklyGains.sq} Saint Quartz and ${weeklyGains.tx} Summoning Tickets.`)
    // console.log(weeklyGains);

    console.log(weeklyGains);
    
    return weeklyGains;
  };

  // Calculates login streaks.
  const calcLogins = (start, target) => {
    const { logins } = loginData;
    const startIndex = logins % 50;
    // console.log(startIndex);

    let distance = target.diff(start, 'days');

    if (distance >= 1) {
      distance++
    } else if (distance === 0 && (target.$y > today.$y || target.$M > today.$M || target.$d > today.$d)) {
      distance++
    };

    const endingLogins = startIndex + distance;
    const loginSQ = Math.floor(endingLogins / 50) * 30;

    console.log(`${distance} days until target date. Total logins gain will be ${loginSQ} Quartz.`);

    return loginSQ;
  };

  // Calculates standard MP shop (not special MP shop items; those go in calcEvents).
  const calcShop = (start, target) => {
    let distance = (target.$y - start.$y) * 12 + (target.$M - start.$M);
    console.log(distance);

    const shopTx = distance * 5;  

    console.log(`${distance} shop resets within target range, giving ${shopTx} Tickets.`);

    return shopTx;
  };

  // Calculates events.
  const calcEvents = () => {
    
    const totalEvents = {
      sq: 0,
      tx: 0
    };

    return totalEvents;
  };

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

    // console.log(`${currency.sq} SQ, ${currency.tx} Tickets`);
    // console.log(`${numDays} days between dates.`)

    // TODO: This is where we'll want to do the full computation and render for the values.
    const weeklies = calcWeeklies(start, numDays);
    const logins = calcLogins(start, target);
    const shop = calcShop(start, target);
    const events = calcEvents(start, target);

    const gains = {
      sq: weeklies.sq + logins + events.sq,
      tx: weeklies.tx + shop + events.tx
    };

    const total = {
      sq: gains.sq + currency.sq,
      tx: gains.tx + currency.tx
    };

    setTotals(total);
    return totals;
  };

  useEffect(() => {
    console.log(totals);
  }, [totals]);

  const handleFormUpdate = (e) => {
    if (e.target.name === 'sq' || e.target.name === 'tx') {
      setCurrency({ ...currency, [e.target.name]: parseInt(e.target.value) });
    } else if (e.target.name === 'logins' || e.target.name === 'streak') {
      setLoginData({ ...loginData, [e.target.name]: parseInt(e.target.value) });
    };
  };

  // useEffect(() => {
  //   console.log(loginData);
  // }, [loginData]);

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />
      <FormControl maxW="400px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
        <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Current Logins:</FormLabel>
            <Input className="form-input" name="logins" type="number" placeholder="0" onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Login Streak:</FormLabel>
            <Input className="form-input" name="streak" type="number" placeholder="0" onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Starting Quartz:</FormLabel>
            <Input className="form-input" name="sq" type="number" placeholder="0" onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Starting Tickets:</FormLabel>
            <Input className="form-input" name="tx" type="number" placeholder="0" onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Start Date:</FormLabel>
            <DatePicker selected={dates.start} onChange={(date) => setDates({ ...dates, start: date })} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>End Date:</FormLabel>
            <DatePicker selected={dates.target} onChange={(date) => setDates({ ...dates, target: date })} />
          </GridItem>
        </Grid>

        <Button marginTop={4} colorScheme="blue" onClick={calc} >Calculate</Button>
        <br />
        <br />
        <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Total Quartz</FormLabel>
            <Input className="form-input" isReadOnly={true} name="total-sq" value={totals.sq} placeholder="0" />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Total Tickets</FormLabel>
            <Input className="form-input" isReadOnly={true} name="total-sq" value={totals.tx} placeholder="0" />
          </GridItem>
        </Grid>
      </FormControl>
    </>
  )
};

export default SummonCalc;
