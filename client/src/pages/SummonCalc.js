import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox } from '@chakra-ui/react'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const SummonCalc = () => {

  const [loginData, setLoginData] = useState({});

  const [purchaseData, setPurchaseData] = useState({
    whale: 0,
    period: 0,
    alreadyPurchased: false,
  });

  const [dates, setDates] = useState({
    start: new Date(),
    target: new Date(),
  });

  const [reserves, setReserves] = useState({
    sq: 10,
    tx: 10
  });

  const [currency, setCurrency] = useState({
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

  const today = dayjs().format('YYYY-MM-DD');

  // Treats and sets current SQ to reflect new login streak.
  useEffect(() => {
    if (localStorage.getItem('reserves')) {
      let { sq, tx } = JSON.parse(localStorage.getItem('reserves'));
      setReserves({ sq, tx });
    };
  }, []);

  // Treats and sets login data and currency.
  useEffect(() => {
    let { total, streak, date } = JSON.parse(localStorage.getItem('login-history'));
    console.log(total, streak, date);

    if (date == today) {
      console.log('today!')
    } else {
      const difference = dayjs().diff(date, 'days');
      // console.log(`Last check was ${difference} days ago!`);

      // Get index of week for the day of the last calculation.
      const origin = streak % 7;
      console.log(`Starting on index ${origin} of the daily array.`);

      const addCurrency = calcWeeklies(date, difference, origin);
      console.log('Adding to currency', addCurrency);

      const monthsDiff = ((dayjs().$y - dayjs(date).$y) * 12) + (dayjs().$M - dayjs(date).$M);
      if (monthsDiff !== 0) {
        const shopUpdate = window.confirm(`${monthsDiff} months have elapsed since last update. Should we add monthly shop tickets to your reserves?`);
        if (shopUpdate) {
          let { sq, tx } = JSON.parse(localStorage.getItem('reserves'));
          tx += monthsDiff * 5;
          setReserves({ sq: sq, tx: tx });
          console.log(`Updated reserves with ${monthsDiff * 5} summoning tickets. Now have ${reserves.tx} summoning tickets`);
        };
      };

      total += difference;
      streak += difference;
      date = today;
      console.log(`Updating login history to ${today}: ${total} total logins, ${streak} login streak.`);
    };

    // Update currency with new login rewards.

    // TODO: Update currency with shop stuff? Might want to put in a note that tells the user it's doing that.

    setLoginData({
      total: total || 0,
      streak: streak || 0,
      date: date || today
    });
  }, []);

  // TODO: We could make a treatment function that just loops through two arguments' year / month / day fields, but since different functions do different things with the data it may be too convoluted.

  // Calculates master missions. Could rename to calcStreak instead to be clearer what data it cares about and produces.
  const calcWeeklies = (start, numDays, origin) => {
    let distance = dayjs(start).diff(dayjs(today), 'days');

    // It seems like the diff between day X and day X+1 comes out to 0, so this 
    // if (distance >= 1) {
    //   distance++
    // } else if (distance === 0 && (start.$y > today.$y || start.$M > today.$M || start.$d > today.$d)) {
    //   distance++
    // };

    console.log(`${distance} days from today to start date.`)

    // The weekly index of the start day.
    let index;
    console.log(origin || distance);
    origin <= 6 ? index = origin : index = (loginData.streak + distance) % 7;
    // const index = origin || (loginData.streak + distance) % 7;
    console.log(index);

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
  const calcShop = (monthDistance) => {

    const shopTx = monthDistance * 5;

    console.log(`${monthDistance} shop resets within target range, giving ${shopTx} Tickets.`);

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

  // Calculates purchases.
  // TODO: Allow for repeating monthly purchases.
  const calcPurchases = (numMonths) => {
    console.log(purchaseData);

    const numPurchases = purchaseData.period === 0 ? 1 : numMonths + 1 - purchaseData.alreadyPurchased;
    console.log(numPurchases);

    const totalPurchases = parseInt(purchaseData.whale) * numPurchases;
    return totalPurchases;
  };

  const calc = () => {
    // Purchases should be sent as an object and destructured into number of purchases and number of SQ per. Everything else can probably come from state since the element sending the function call probably won't have direct access to that data.

    const start = dayjs(dates.start);
    const target = dayjs(dates.target);

    let numDays = dayjs(target).diff(dayjs(start), 'day');
    const numMonths = (target.$y - start.$y) * 12 + (target.$M - start.$M);
    console.log(numMonths);

    // It seems like we need to manually adjust differences since anything that should be 1 or higher is reduced by 1.
    if (numDays >= 1) {
      numDays++
    } else if (numDays === 0 && (target.$y > start.$y || target.$M > start.$M || target.$d > start.$d)) {
      numDays++
    };

    // console.log(`${numDays} days between dates.`)

    const weeklies = calcWeeklies(start, numDays) || 0;
    const logins = calcLogins(start, target) || 0;
    const shop = calcShop(numMonths) || 0;
    const events = calcEvents(start, target) || 0;
    const purchases = calcPurchases(numMonths) || 0;

    const gains = {
      sq: weeklies.sq + logins + events.sq,
      tx: weeklies.tx + shop + events.tx
    };

    const total = {
      sq: gains.sq + reserves.sq + purchases,
      tx: gains.tx + reserves.tx
    };

    setCurrency(total);
    return currency;
  };

  const handleFormUpdate = (e) => {
    if (e.target.name === 'sq' || e.target.name === 'tx') {
      setReserves({ ...reserves, [e.target.name]: parseInt(e.target.value) });
    } else if (e.target.name === 'total' || e.target.name === 'streak') {
      setLoginData({ ...loginData, [e.target.name]: parseInt(e.target.value), date: dayjs().format('YYYY-MM-DD') });
    } else if (e.target.name === 'whale' || e.target.name === 'period') {
      setPurchaseData({ ...purchaseData, [e.target.name]: e.target.value });
    } else if (e.target.name === 'alreadyPurchased') {
      setPurchaseData({ ...purchaseData, alreadyPurchased: e.target.checked });
    };
  };

  // Set local storage when updating login streak or currency totals.
  useEffect(() => {
    if (loginData.total || loginData.streak || loginData.date) {
      console.log('Storing', loginData);
      localStorage.setItem('login-history', JSON.stringify({ ...loginData }));
    };
  }, [loginData]);

  useEffect(() => {
    if (reserves.sq || reserves.tx) {
      console.log('Storing', reserves);
      localStorage.setItem('reserves', JSON.stringify({ ...reserves }));
    };
  }, [reserves]);

  useEffect(() => {
    console.log(purchaseData);
  }, [purchaseData]);

  const clearForm = () => {
    setReserves({
      sq: 0,
      tx: 0
    });

    // setLoginData({
    //   logins: 0,
    //   streak: 0,
    // });

    setPurchaseData({
      whale: 0,
      period: 0,
      alreadyPurchased: false
    });

    setDates({
      start: new Date(),
      target: new Date(),
    });

    setReserves({
      sq: 0,
      tx: 0
    });

    setCurrency({
      sq: 0,
      tx: 0
    });
  };

  // useEffect(() => {
  //   console.log(purchaseData);
  // }, [purchaseData]);

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />
      <FormControl maxW="400px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
        <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Total Logins:</FormLabel>
            <Input className="form-input" name="total" type="number" placeholder="0" defaultValue={loginData.total} onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Login Streak:</FormLabel>
            <Input className="form-input" name="streak" type="number" placeholder="0" defaultValue={loginData.streak} onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Starting Quartz:</FormLabel>
            <Input className="form-input" name="sq" type="number" placeholder="0" defaultValue={reserves.sq} onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Starting Tickets:</FormLabel>
            <Input className="form-input" name="tx" type="number" placeholder="0" defaultValue={reserves.tx} onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>SQ Purchases:</FormLabel>
            <Input className="form-input" name="whale" type="number" placeholder="0" onSubmit={calc} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <FormLabel>Frequency:</FormLabel>
            <Select className="form-input" name="period" type="text">
              <option value={0}>One-time</option>
              <option value={1}>Monthly</option>
            </Select>
          </GridItem>
          {purchaseData.period == 1 ?
            <GridItem rowSpan={1} colSpan={2}>
              <Checkbox name="alreadyPurchased" defaultChecked={false}>Already purchased this month?</Checkbox>
            </GridItem>
            : null}
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Start Date:</FormLabel>
            <DatePicker selected={dates.start} onChange={(date) => setDates({ ...dates, start: date })} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>End Date:</FormLabel>
            <DatePicker selected={dates.target} onChange={(date) => setDates({ ...dates, target: date })} />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <Button marginTop={4} colorScheme="blue" onClick={calc} >Calculate</Button>
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <Button marginTop={4} colorScheme="blue" onClick={clearForm} >Clear</Button>
          </GridItem>
        </Grid>

        <br />
        <br />
        <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Total Quartz:</FormLabel>
            <Input className="form-input" isReadOnly={true} name="total-sq" value={currency.sq} placeholder="0" />
          </GridItem>
          <GridItem rowSpan={1} colSpan={1} >
            <FormLabel>Total Tickets:</FormLabel>
            <Input className="form-input" isReadOnly={true} name="total-sq" value={currency.tx} placeholder="0" />
          </GridItem>
        </Grid>
      </FormControl>
    </>
  )
};

export default SummonCalc;
