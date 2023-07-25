import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import getSlot from '../utils/getSlot.js'
import sanitizeEmpty from '../utils/sanitizeEmpty.js'

import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox } from '@chakra-ui/react'
import DatePicker from "react-datepicker";
import Statistics from "statistics.js";

import "react-datepicker/dist/react-datepicker.css";

import RollSnapshot from "../components/RollSnapshot";

// TODO: Once we have MVP, refactor with reducers and better state handling.
const SummonCalc = () => {

  // TODO: May want to go over the data on load to sanitize any 0s to blank strings.
  const [loginData, setLoginData] = useState({});

  const [currency, setCurrency] = useState({
    sqPurchase: '',
    purchasePeriod: 0,
    alreadyPurchased: false,
    sqStarting: '',
    txStarting: '',
    sqIncome: '',
    txIncome: '',
    sqExtra: '',
    txExtra: '',
  });
  // console.log(currency);

  const [dates, setDates] = useState({
    start: dayjs().format('YYYY/MM/DD'),
    target: dayjs().format('YYYY/MM/DD'),
  });

  const [sums, setSums] = useState({
    sqSum: 0,
    txSum: 0,
    totalSummons: 0,
  });

  const [summonStats, setSummonStats] = useState({
    targetName: '',
    rarity: 'ssr',
    numRateup: 1,
    prob: 0.008,
    desired: 1,
    summonOdds: 0,
    slot: '',
  });

  const [elementState, setElementState] = useState({
    odds: false
  });

  const [editState, setEditState] = useState(0);

  const [savedRolls, setSavedRolls] = useState(JSON.parse(localStorage.getItem('saved-rolls')) || []);

  const servantData = {};

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

  // 
  const odds = {
    ssr: [0.008, 0.005],
    sr: [0.02, 0.015, 0.012],
    r: [0.2],
  };

  const today = dayjs().format('YYYY/MM/DD');

  // Update currency and calendar state from local storage on component render.
  useEffect(() => {
    // TODO: This should probably use a context provider.
    if (localStorage.getItem('currency')) {
      let localCurrency = JSON.parse(localStorage.getItem('currency'));
      setCurrency(localCurrency);
    };

    if (localStorage.getItem('calendar-data')) {
      let { start, target } = JSON.parse(localStorage.getItem('calendar-data'));
      const newStart = new Date(start)
      const newTarget = new Date(target);
      setDates({ start: newStart, target: newTarget });
    };
  }, []);

  // Treats and sets login data and currency.
  useEffect(() => {
    let { total, streak, date } = JSON.parse(localStorage.getItem('login-data')) || 0;
    date = dayjs(date).format('YYYY/MM/DD');
    console.log(total, streak, date);

    if (date === today) {
      console.log('today!')
    } else {
      // console.log(`Today: ${today}; date: ${date}`)
      const difference = Math.ceil(dayjs().diff(date, 'days', true));

      // If it's been at least a week since last login, loop through difference to look for Master Mission refreshes in the elapsed duration.
      if (difference >= 7) {
        const updateWeeklies = window.confirm('It\'s been over a week since last login. Update with Master Missions and daily logins?')

        if (updateWeeklies) {
          const masterMissionGains = calcMasterMissions(date, difference);
          let sqNum = parseInt(currency.sqStarting);
          setCurrency({ sqStarting: sqNum += parseInt(masterMissionGains) || 0 });
          console.log(`Added ${masterMissionGains} SQ from Master Missions to ${sqNum} starting SQ.`);
        };
      };
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
          let { sqStarting, txStarting } = JSON.parse(localStorage.getItem('currency').reserves);
          txStarting += monthsDiff * 5;
          setCurrency({ sqStarting, txStarting });
          console.log(`Updated reserves with ${monthsDiff * 5} summoning tickets. Now have ${currency.txStarting} summoning tickets`);
        };
      };

      total += difference;
      streak += difference;
      date = today;
      console.log(`Updating login history to ${today}: ${total} total logins, ${streak} login streak.`);
    };

    // Update currency with new login rewards.


    setLoginData({
      total: total || 0,
      streak: streak || 0,
      date: date || today
    });
  }, []);

  // TODO: We could make a treatment function that just loops through two arguments' year / month / day fields, but since different functions do different things with the data it may be too convoluted.

  // Calculates master missions. Could rename to calcStreak instead to be clearer what data it cares about and produces.
  const calcWeeklies = (start, numDays, origin) => {
    // let distance = Math.ceil(dayjs(start).diff(dayjs(today), 'days', true));
    console.log(`Calculating weeklies. Start: ${start}; numDays: ${numDays}.`);

    // It seems like the diff between day X and day X+1 comes out to 0, so this 
    // if (numDays >= 1) {
    //   numDays++
    // } else if (numDays === 0 && (start.$y > today.$y || start.$M > today.$M || start.$d > today.$d)) {
    //   numDays++
    // };

    console.log(`${numDays} days from today to start date.`)

    // The weekly index of the start day.
    let index;
    // console.log(origin || numDays);
    origin <= 6 ? index = origin : index = (loginData.streak + numDays) % 7;
    // const index = origin || (loginData.streak + distance) % 7;
    // console.log(index);

    // const remainder = numDays % 7;

    // This gets the values of each full weeks' gains.
    // const weeks = (numDays - remainder) / 7;
    // console.log(`Starting index: ${index}. Full weeks: ${weeks}. Remainder days: ${remainder}.`);

    let weeklyGains = {
      sq: 0,
      tx: 0
    };

    const masterMissionGains = calcMasterMissions(start, numDays);
    // console.log(`Calculating Master Mission. Start: ${start}; Number of Days: ${numDays}.`);
    weeklyGains.sq += masterMissionGains;
    console.log(`Added ${masterMissionGains} SQ from Master Missions.`);
    // console.log(weeklyGains);

    // Daily login bonus courser.
    for (let i = 0; i < numDays; i++) {
      const trueI = (i + index) % 7;

      const thisLogin = periodic.weeklyLogin[trueI];
      // console.log(`Today's login reward: ${JSON.stringify(thisLogin)}`);

      // Course through weeklyGains to find matching rewards.
      if (thisLogin.type in weeklyGains) {
        // console.log(`Corresponding value found: ${thisLogin.type}`);
        weeklyGains[thisLogin.type] += thisLogin.val;
      };
    };
    // console.log(`Added ${weeklyGains.sq} Saint Quartz and ${weeklyGains.tx} Summoning Tickets.`)
    // console.log(weeklyGains);

    // console.log(weeklyGains);

    return weeklyGains;
  };

  const calcMasterMissions = (start, difference) => {
    let dayInc = 0;
    let sqGains = 0;

    for (var i = 0; i < difference; i++) {
      dayInc++;
      const currentDay = start.add(dayInc, 'day').format('ddd');
      if (currentDay === "Sun") {
        sqGains += 3;
        console.log(`Adding 3 SQ to total`)
      };
    };
    return sqGains;
  };

  // Calculates login streaks.
  const calcLogins = (start, target) => {
    const { total } = loginData;
    // console.log(loginData);
    const startIndex = total % 50;
    // console.log(startIndex);

    let distance = Math.ceil(target.diff(start, 'days', true));

    // if (distance >= 1) {
    //   distance++
    // } else if (distance === 0 && (target.$y > today.$y || target.$M > today.$M || target.$d > today.$d)) {
    //   distance++
    // };

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
    const { sqPurchase, purchasePeriod, alreadyPurchased } = currency;
    // console.log(sqPurchase, purchasePeriod, alreadyPurchased);

    const numPurchases = parseInt(purchasePeriod) === 0 ? 1 : numMonths + 1 - alreadyPurchased;
    // console.log(sqPurchase, numPurchases);

    const totalPurchases = parseInt(sqPurchase) * numPurchases || 0;
    console.log(totalPurchases);
    return totalPurchases;
  };

  const calc = () => {
    // Purchases should be sent as an object and destructured into number of purchases and number of SQ per. Everything else can probably come from state since the element sending the function call probably won't have direct access to that data.

    const start = dayjs(dates.start);
    const target = dayjs(dates.target);

    if (target.diff(start) < 0) {
      return;
    };

    let numDays = Math.ceil(dayjs(target).diff(dayjs(start), 'day', true));
    // console.log(numDays);
    const numMonths = (target.$y - start.$y) * 12 + (target.$M - start.$M);
    // console.log(numDays);
    // console.log(numMonths);

    // It seems like we need to manually adjust differences since anything that should be 1 or higher is reduced by 1.
    // if (numDays >= 1) {
    //   numDays++
    // } else if (numDays === 0 && (target.$y > start.$y || target.$M > start.$M || target.$d > start.$d)) {
    //   numDays++
    // };

    // console.log(`${numDays} days between dates.`)

    // console.log(start);

    const startingSq = currency.sqStarting || 0
    const startingTx = currency.txStarting || 0;
    const weeklies = calcWeeklies(start, numDays);
    const logins = calcLogins(start, target);
    const shop = calcShop(numMonths);
    const events = calcEvents(start, target);
    const purchases = calcPurchases(numMonths) || 0;
    const otherSq = parseInt(currency.sqExtra) || 0;
    const otherTx = parseInt(currency.txExtra) || 0;

    // console.log(weeklies, logins, shop, events, purchases, otherSq, otherTx);

    const gainedSq = parseInt(weeklies.sq + logins + events.sq);
    const gainedTx = parseInt(weeklies.tx + shop + events.tx);

    // console.log(weeklies.tx, shop, events.tx);

    // console.log(gains, weeklies)

    const newSq = gainedSq + startingSq + purchases + otherSq || 0;
    const newTx = gainedTx + startingTx + otherTx || 0;

    // console.log(gainedTx, startingTx, otherTx);

    console.log(gainedSq, startingSq, startingTx, purchases, otherSq);

    let total = Math.floor((newSq / 3 + newTx) + Math.floor((newSq / 3 + newTx) / 10));

    if (isNaN(total) || total < 0) {
      total = 0;
    };

    console.log(total);
    setSums({ sqSum: newSq, txSum: newTx, totalSummons: total });
    // return currency;
  };

  const handleFormUpdate = (e) => {
    const currencyVals = ['sqPurchase', 'purchasePeriod', 'alreadyPurchased', 'sqStarting', 'txStarting', 'sqIncome', 'txIncome', 'sqExtra', 'txExtra'];

    // Sanitize any ints passed as strings.
    let targetVal = e.target.value;

    if (!isNaN(parseInt(targetVal))) {
      targetVal = parseInt(targetVal);
    };
    console.log(targetVal);

    // Handle login updates. (Dates are handled separately.)
    // TODO: Should dates actually be handled separately or not?
    if (e.target.name === 'total' || e.target.name === 'streak') {
      setLoginData({ ...loginData, [e.target.name]: parseInt(e.target.value), date: dayjs().format('YYYY-MM-DD') });
    }

    else if (e.target.name === 'alreadyPurchased') {
      setCurrency({ ...currency, alreadyPurchased: e.target.checked })
    }

    // Handle all other updates with proper integer or string.
    else if (currencyVals.includes(e.target.name)) {
      setCurrency({ ...currency, [e.target.name]: targetVal });
    };
  };

  useEffect(() => {
    setElementState({ ...elementState, odds: false });
    calc();
    const currencyClone = { ...currency };
    // console.log(currency);
    const sanitizedCurrency = sanitizeEmpty(currencyClone);
    // console.log(sanitizedCurrency);
    localStorage.setItem('currency', JSON.stringify(sanitizedCurrency));
  }, [currency, dates]);

  // Set local storage when updating login streak or currency totals.
  useEffect(() => {
    if (loginData.total || loginData.streak || loginData.date) {
      // console.log('Storing', loginData);
      localStorage.setItem('login-data', JSON.stringify(loginData));
    };
  }, [loginData]);

  useEffect(() => {
    if (dates) {
      localStorage.setItem('calendar-data', JSON.stringify(dates))
    }
  }, [dates]);

  // Old handlers.
  // useEffect(() => {
  //   console.log('Storing', purchaseData);
  //   localStorage.setItem('purchase-data', JSON.stringify({ ...purchaseData }));
  // }, [purchaseData]);

  // useEffect(() => {
  //   console.log('Storing', extras);
  //   localStorage.setItem('extras', JSON.stringify({ ...extras }));
  // }, [extras]);


  // let localRolls = JSON.parse(localStorage.getItem('saved-rolls')) || [];

  useEffect(() => {
    console.log(savedRolls);
    localStorage.setItem('saved-rolls', JSON.stringify(savedRolls));
    // localRolls = savedRolls;
    // console.log(`Saving Rolls:`, localRolls);
  }, [savedRolls]);

  const clearForm = () => {
    setCurrency({
      sqPurchase: '',
      purchasePeriod: 0,
      alreadyPurchased: false,
      sqStarting: '',
      txStarting: '',
      sqIncome: '',
      txIncome: '',
      sqExtra: '',
      txExtra: ''
    });

    setDates({
      start: dayjs().format('YYYY/MM/DD'),
      target: dayjs().format('YYYY/MM/DD')
    });
  };

  useEffect(() => {
    console.log(dates);
  }, [dates])

  // Handler pre-state
  // let totalSummons = Math.floor((sums.sqSum / 3 + sums.txSum) + Math.floor((sums.sqSum / 3 + sums.txSum) / 10));

  // if (totalSummons < 0) {
  //   totalSummons = 0;
  // };

  // useEffect(() => {
  //   // console.log(sums)
  //   let total = Math.floor((sums.sqSum / 3 + sums.txSum) + Math.floor((sums.sqSum / 3 + sums.txSum) / 10));

  //   if (total < 0) {
  //     total = 0;
  //   };
  //   console.log(total);
  //   setSums({ ...sums, totalSummons: total })
  // }, [currency]);

  const probHandler = (e) => {
    if (e.target.name === 'rarity') {
      const newProb = odds[e.target.value][summonStats.numRateup - 1];
      setSummonStats({ ...summonStats, [e.target.name]: e.target.value, prob: newProb });
    } else if (e.target.name === 'numRateup') {
      const newProb = odds[summonStats.rarity][e.target.value - 1];
      setSummonStats({ ...summonStats, [e.target.name]: parseInt(e.target.value), prob: newProb });
    } else if (e.target.name === 'desired') {
      setSummonStats({ ...summonStats, desired: parseInt(e.target.value) });
    };
  };

  const calcOdds = () => {
    const start = dayjs(dates.start);
    const target = dayjs(dates.target);
    if (target.isBefore(start, 'day')) {
      window.alert('Target date can\'t be before start date');
      return;
    };

    // TODO: Refactor into factory function.
    const n = sums.totalSummons;
    const p = summonStats.prob;
    // const q = (1 - summonStats.prob);
    const k = summonStats.desired;

    var stats = new Statistics({
      n: sums.totalSummons,
      p: summonStats.prob,
      // q: (1 - summonStats.prob),
      k: summonStats.desired
    });
    // console.log(n, p, q, k);

    const binomial = stats.binomialDistribution(n, p);

    const binomCalc = () => {
      let totalProb = 0;
      for (let i = k; i < binomial.length; i++) {
        // console.log(binomial[i]);
        if (isNaN(binomial[i])) {
          console.log(totalProb);
          return totalProb;
        } else {
          totalProb += binomial[i];
        };
      };
      return totalProb;
    };

    const totalProb = binomCalc();
    // console.log(totalProb);

    const percentage = parseFloat(totalProb * 100).toFixed(2);

    let oddsRender = `${percentage}%`;

    if (k === 1 && n >= 330) {
      oddsRender = `Guaranteed pity (330 summons)`
    };

    setElementState({ ...elementState, odds: true });
    setSummonStats({ ...summonStats, summonOdds: oddsRender });
  };

  const saveSnapshot = () => {
    console.log(summonStats);
    const savedRoll = {
      ...dates,
      ...currency,
      ...sums,
      ...summonStats,
    };

    // If making a new entry, generate a slot and save it.
    if (editState === 0) {
      savedRoll.slot = getSlot();
      console.log(`Saving`, savedRoll);
      setSavedRolls([...savedRolls, savedRoll]);
    }
    // If editing a roll, find its index and update it.
    else if (editState === 1) {
      let rollsClone = [...savedRolls];
      console.log(rollsClone);
      const rollIndex = savedRoll.slot;
      console.log(`Updating roll index ${rollIndex}`);
      const updatedRolls = rollsClone.map((roll, i) => {
        if (roll.slot === rollIndex) {
          console.log(`Matched roll index ${rollIndex}. Returning`, savedRoll);
          return savedRoll;
        } else {
          return roll;
        };
      });
      console.log(updatedRolls);
      setSavedRolls(updatedRolls);
    };

    setSummonStats({ ...summonStats, targetName: '' });
    setEditState(0);
  };

  // let localRolls = [...savedRolls];

  // useEffect(() => {
  //   localRolls = [...savedRolls];
  //   console.log(localRolls);
  // }, [savedRolls]);

  let rollMap = () => {
    {
      return savedRolls.map((roll, pos) => (
        <GridItem key={`${roll.slot}-${JSON.stringify(roll)}`}>
          <RollSnapshot
            rollObj={roll}
            savedRolls={savedRolls} setSavedRolls={setSavedRolls} setDates={setDates} setCurrency={setCurrency} setSums={setSums} setSummonStats={setSummonStats} editState={editState} setEditState={setEditState} rollIndex={roll.slot}
          />
        </GridItem>
      ))
    }
  };

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />

      {/* Dynamically render the parent grid component only if there are saved rolls. */}
      <Grid h='' templateRows="repeat(1, fr)" templateColumns="repeat(2, 1fr)">
        <GridItem rowSpan={1} colSpan={1}>
          <FormControl maxW="600px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
            <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Login Streak:</FormLabel>
                <Input className="form-input" name="streak" type="number" placeholder="0" value={loginData.streak} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Total Logins:</FormLabel>
                <Input className="form-input" name="total" type="number" placeholder="0" value={loginData.total} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Starting Quartz:</FormLabel>
                <Input className="form-input" name="sqStarting" type="number" placeholder="0" value={currency.sqStarting} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Starting Tickets:</FormLabel>
                <Input className="form-input" name="txStarting" type="number" placeholder="0" value={currency.txStarting} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>SQ Purchases:</FormLabel>
                <Input className="form-input" name="sqPurchase" type="number" placeholder="0" value={currency.sqPurchase} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Frequency:</FormLabel>
                <Select className="form-input" name="purchasePeriod" type="text" value={currency.purchasePeriod}>
                  <option value={0}>One-time</option>
                  <option value={1}>Monthly</option>
                </Select>
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} hidden={currency.purchasePeriod === 0}>
                <Checkbox name="alreadyPurchased" defaultChecked={false} >Already purchased this month?</Checkbox>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Extra SQ (can be negative):</FormLabel>
                <Input className="form-input" name="sqExtra" type="number" placeholder="0" value={currency.sqExtra} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Extra Tickets (can be negative):</FormLabel>
                <Input className="form-input" name="txExtra" type="number" placeholder="0" value={currency.txExtra} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Start Date:</FormLabel>
                <DatePicker name="start" format={'yyyy/MM/dd'} selected={new Date(dates.start)} onChange={(date) => setDates({ ...dates, start: dayjs(date).format('YYYY/MM/DD') })} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>End Date:</FormLabel>
                <DatePicker name="target" format={'yyyy/MM/dd'} selected={new Date(dates.target)} onChange={(date) => setDates({ ...dates, target: dayjs(date).format('YYYY/MM/DD') })} />
              </GridItem>
              {/* <GridItem rowSpan={1} colSpan={1} >
            <Button marginTop={4} colorScheme="blue" onClick={calc} >Calculate</Button>
          </GridItem> */}
              <GridItem rowSpan={1} colSpan={2} >
                <Button marginTop={4} colorScheme="blue" onClick={clearForm} >Clear</Button>
              </GridItem>
            </Grid>
            <br />
            <br />
            <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Total Quartz:</FormLabel>
                <Input className="form-input" isReadOnly={true} name="sqSum" value={sums.sqSum} placeholder="0" />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Total Tickets:</FormLabel>
                <Input className="form-input" isReadOnly={true} name="txSum" value={sums.txSum} placeholder="0" />
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} >
                <FormLabel>Total Summons:</FormLabel>
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} >
                <Input className="form-input" isReadOnly={true} name="totalSummons" value={sums.totalSummons} />
              </GridItem>
            </Grid>
          </FormControl>
          <FormControl mt={6} maxW="600px" marginLeft="auto" marginRight="auto">
            <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Desired Servant Rarity:</FormLabel>
                <Select className="form-input" name="rarity" type="text" onChange={probHandler}>
                  <option value={'ssr'}>5* (SSR)</option>
                  <option value={'sr'}>4* (SR)</option>
                  <option value={'r'}>3* (R)</option>
                </Select>
              </GridItem>
              {/* TODO: Display this only if previous form input is 3* or 4*. */}
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Total Servants on Rateup:</FormLabel>
                <Select className="form-input" name="numRateup" type="text" onChange={probHandler} defaultValue={1}>
                  <option value={1}>Single Rateup</option>
                  <option value={2}>2 Rateups</option>
                  <option value={3}>3 Rateups</option>
                  <option value={4}>4 Rateups</option>
                  <option value={5}>5 Rateups</option>
                  <option value={0}>Other (please specify odds manually)</option>
                </Select>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Probability of success per roll:</FormLabel>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Input className="form-input" isReadOnly={summonStats.numRateup !== 0 ? true : false} name="prob" value={summonStats.prob} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Number of Copies Desired:</FormLabel>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Input className="form-input" name="desired" defaultValue={1} onChange={probHandler} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} >
                <Button marginTop={4} colorScheme="blue" onClick={calcOdds} width={'400px'} >Calculate!</Button>
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} hidden={!elementState.odds}>
                <Input className="form-input" maxW='400px' isReadOnly={true} name="summonOdds" value={summonStats.summonOdds} />
                <Button marginTop={4} colorScheme="blue" onClick={saveSnapshot}>{editState === 0 ? 'Save Snapshot' : 'Update Snapshot'}</Button>
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} hidden={!editState}>
                <Button marginTop={4} colorScheme="red" onClick={() => setEditState(0)} width={'400px'} >Cancel Edit</Button>
              </GridItem>
            </Grid>
          </FormControl>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          {rollMap()}
          {/* {localRolls.map((roll, pos) => (
            <GridItem key={roll.slot}>
              <RollSnapshot
                rollObj={roll}
                savedRolls={savedRolls} setSavedRolls={setSavedRolls} setDates={setDates} setCurrency={setCurrency} setSums={setSums} setSummonStats={setSummonStats} editState={editState} setEditState={setEditState} rollIndex={roll.slot}
              />
            </GridItem>
          ))} */}
        </GridItem>
      </Grid>
    </>
  )
};

export default SummonCalc;
