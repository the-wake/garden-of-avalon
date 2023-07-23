import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

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

  const [purchaseData, setPurchaseData] = useState({
    whale: '',
    period: 0,
    alreadyPurchased: false,
  });

  const [dates, setDates] = useState({
    start: new Date(),
    target: new Date(),
  });

  const [reserves, setReserves] = useState({
    sq: '',
    tx: ''
  });

  const [currency, setCurrency] = useState({
    sq: '',
    tx: ''
  });

  const [extras, setExtras] = useState({
    sq: '',
    tx: ''
  });

  const [summonStats, setSummonStats] = useState({
    targetName: '',
    rarity: 'ssr',
    numRateup: 1,
    prob: 0.008,
    desired: 1,
  });

  const [summonOdds, setSummonOdds] = useState(0);

  const [elementState, setElementState] = useState({
    odds: false
  });

  let dummyRolls = [
    {
      targetName: 'Merlin',
      savingDate: dayjs().format('YYYY/MM/DD'),
      bannerDate: dayjs().format('YYYY/MM/DD'),
      rate: 0.008,
      numDesired: 1,
      budget: { sq: 1200, tx: 100 },
      numRolls: 500,
      probability: '95%',
      slot: 0
    },
    {
      targetName: 'Oberon',
      savingDate: dayjs().format('YYYY/MM/DD'),
      bannerDate: dayjs().format('YYYY/MM/DD'),
      rate: 0.008,
      numDesired: 1,
      budget: { sq: 1200, tx: 100 },
      numRolls: 500,
      probability: '95%',
      slot: 1
    },
    {
      targetName: 'Archetype: Earth',
      savingDate: dayjs().format('YYYY/MM/DD'),
      bannerDate: dayjs('7/3/2024').format('YYYY/MM/DD'),
      rate: 0.008,
      numDesired: 1,
      budget: { sq: 10, tx: 0 },
      numRolls: 11,
      probability: '1%',
      slot: 2
    }
  ];

  let initialRolls = JSON.parse(localStorage.getItem('saved-rolls')) || dummyRolls || {};

  const [savedRolls, setSavedRolls] = useState(initialRolls);
  // console.log(savedRolls);

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

  const today = dayjs().format('YYYY-MM-DD');

  // TODO: This should probably use a context provider.
  let rollsArr = [];

  // These could definitely use full objects instead of destructures, but this helps if we want to manipulate or sanitize the values at all.
  useEffect(() => {
    if (localStorage.getItem('reserves')) {
      let { sq, tx } = JSON.parse(localStorage.getItem('reserves'));
      setReserves({ sq: sq || 0, tx: tx || 0 });
    };
    if (localStorage.getItem('purchase-data')) {
      let { whale, period, alreadyPurchased } = JSON.parse(localStorage.getItem('purchase-data'));
      setPurchaseData({ whale, period, alreadyPurchased });
    };
    if (localStorage.getItem('extras')) {
      let { sq, tx } = JSON.parse(localStorage.getItem('extras'));
      setExtras({ sq, tx });
    };
  }, []);

  // Treats and sets login data and currency.
  useEffect(() => {
    let { total, streak, date } = JSON.parse(localStorage.getItem('login-history')) || 0;
    date = dayjs(date);
    console.log(total, streak, date);

    // console.log(dayjs(date));

    if (date === today) {
      console.log('today!')
    } else {
      const difference = dayjs().diff(date, 'days');

      // If it's been at least a week since last login, loop through difference to look for Master Mission refreshes in the elapsed duration.
      if (difference >= 7) {
        const updateWeeklies = window.confirm('It\'s been over a week since last login. Update with Master Missions and daily logins?')

        if (updateWeeklies) {
          const masterMissionGains = calcMasterMissions(date, difference);
          let startingSQ = reserves.sq;
          setCurrency({ sq: parseInt(startingSQ += masterMissionGains) || 0 });
          console.log(`Added ${masterMissionGains} SQ from Master Missions to ${startingSQ} starting SQ.`);
          //   let dayInc = 0;
          //   for (var i = 0; i < difference; i++) {
          //     dayInc++;
          //     let currentDay = date.add(dayInc, 'days').format('ddd');


          //   };
          // };
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
          let { sq, tx } = JSON.parse(localStorage.getItem('reserves'));
          tx += monthsDiff * 5;
          setReserves({ sq: sq || 0, tx: tx || 0 });
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
    // let distance = dayjs(start).diff(dayjs(today), 'days');
    console.log(`Calculating weeklies. Start: ${start}; numDays: ${numDays}.`);

    // It seems like the diff between day X and day X+1 comes out to 0, so this 
    if (numDays >= 1) {
      numDays++
    } else if (numDays === 0 && (start.$y > today.$y || start.$M > today.$M || start.$d > today.$d)) {
      numDays++
    };

    console.log(`${numDays} days from today to start date.`)

    // The weekly index of the start day.
    let index;
    console.log(origin || numDays);
    origin <= 6 ? index = origin : index = (loginData.streak + numDays) % 7;
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

    const masterMissionGains = calcMasterMissions(start, numDays);
    console.log(`Calculating Master Mission. Start: ${start}; Number of Days: ${numDays}.`);
    weeklyGains.sq += masterMissionGains;
    console.log(`Added ${masterMissionGains} SQ from Master Missions.`);
    console.log(weeklyGains);

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
      // if (currentDay === "Sun") {
      //   weeklyGains.sq += 3;
      //   console.log(`Adding 3 SQ to total`)
      // };
    };
    // console.log(`Added ${weeklyGains.sq} Saint Quartz and ${weeklyGains.tx} Summoning Tickets.`)
    // console.log(weeklyGains);

    console.log(weeklyGains);

    return weeklyGains;
  };

  const calcMasterMissions = (start, difference) => {
    console.log(`Calcing Master Missions starting at ${start}. Duration: ${difference}.`)
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
    console.log(loginData);
    const startIndex = total % 50;
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

    const numPurchases = parseInt(purchaseData.period) === 0 ? 1 : numMonths + 1 - purchaseData.alreadyPurchased;
    console.log(numPurchases);

    const totalPurchases = parseInt(purchaseData.whale) * numPurchases || 0;
    // console.log(totalPurchases);
    return totalPurchases;
  };

  const calc = () => {
    // Purchases should be sent as an object and destructured into number of purchases and number of SQ per. Everything else can probably come from state since the element sending the function call probably won't have direct access to that data.

    const start = dayjs(dates.start);
    const target = dayjs(dates.target);

    if (target.diff(start) < 0) {
      return;
    };

    let numDays = dayjs(target).diff(dayjs(start), 'day');
    const numMonths = (target.$y - start.$y) * 12 + (target.$M - start.$M);
    console.log(numDays);
    console.log(numMonths);

    // It seems like we need to manually adjust differences since anything that should be 1 or higher is reduced by 1.
    if (numDays >= 1) {
      numDays++
    } else if (numDays === 0 && (target.$y > start.$y || target.$M > start.$M || target.$d > start.$d)) {
      numDays++
    };

    // console.log(`${numDays} days between dates.`)

    const weeklies = calcWeeklies(start, numDays);
    const logins = calcLogins(start, target);
    const shop = calcShop(numMonths);
    const events = calcEvents(start, target);
    const purchases = calcPurchases(numMonths) || 0;
    const otherSq = parseInt(extras.sq) || 0;
    const otherTx = parseInt(extras.tx) || 0;

    console.log(weeklies, logins, shop, events, purchases, otherSq, otherTx);

    const gains = {
      sq: parseInt(weeklies.sq + logins + events.sq),
      tx: parseInt(weeklies.tx + shop + events.tx)
    };

    console.log(gains, weeklies)

    console.log(gains.sq, reserves.sq, purchases, otherSq)

    const total = {
      sq: parseInt(gains.sq + reserves.sq + purchases + otherSq) || 0,
      tx: parseInt(gains.tx + reserves.tx + otherTx) || 0
    };

    setCurrency(total);
    console.log('Setting', total);
    return currency;
  };

  const handleFormUpdate = (e) => {
    if (e.target.name === 'sq' || e.target.name === 'tx') {
      setReserves({ ...reserves, [e.target.name]: parseInt(e.target.value) || 0 });
    } else if (e.target.name === 'total' || e.target.name === 'streak') {
      setLoginData({ ...loginData, [e.target.name]: parseInt(e.target.value), date: dayjs().format('YYYY-MM-DD') });
    } else if (e.target.name === 'extraSq') {
      setExtras({ ...extras, sq: parseInt(e.target.value) });
    } else if (e.target.name === 'extraTx') {
      setExtras({ ...extras, tx: parseInt(e.target.value) });
    } else if (e.target.name === 'whale' || e.target.name === 'period') {
      setPurchaseData({ ...purchaseData, [e.target.name]: parseInt(e.target.value) });
    } else if (e.target.name === 'alreadyPurchased') {
      setPurchaseData({ ...purchaseData, alreadyPurchased: e.target.checked });
    };
  };

  useEffect(() => {
    setElementState({ ...elementState, odds: false });
    calc();
  }, [purchaseData, dates, reserves, extras]);

  // Set local storage when updating login streak or currency totals.
  useEffect(() => {
    if (loginData.total || loginData.streak || loginData.date) {
      console.log('Storing', loginData);
      localStorage.setItem('login-history', JSON.stringify({ ...loginData }));
    };
  }, [loginData]);

  useEffect(() => {
    if (reserves) {
      console.log('Storing', reserves);
      localStorage.setItem('reserves', JSON.stringify({ ...reserves }));
    };
  }, [reserves]);

  useEffect(() => {
    console.log('Storing', purchaseData);
    localStorage.setItem('purchase-data', JSON.stringify({ ...purchaseData }));
  }, [purchaseData]);

  useEffect(() => {
    console.log('Storing', extras);
    localStorage.setItem('extras', JSON.stringify({ ...extras }));
  }, [extras]);

  useEffect(() => {
    localStorage.setItem('saved-items', JSON.stringify(savedRolls));
  }, [savedRolls]);

  const clearForm = () => {
    setPurchaseData({
      whale: '',
      period: '',
      alreadyPurchased: false
    });

    setReserves({
      sq: '',
      tx: ''
    });

    // TODO: Refactor as dayjs?
    setDates({
      start: new Date(),
      target: new Date(),
    });

    setCurrency({
      sq: '',
      tx: ''
    });

    setExtras({
      sq: '',
      tx: ''
    });
  };

  let totalSummons = Math.floor((currency.sq / 3 + currency.tx) + Math.floor((currency.sq / 3 + currency.tx) / 10));

  if (totalSummons < 0) {
    totalSummons = 0;
  };

  useEffect(() => {
    totalSummons = Math.floor((currency.sq / 3 + currency.tx) + Math.floor((currency.sq / 3 + currency.tx) / 10));

    if (totalSummons < 0) {
      totalSummons = 0;
    };
    // console.log(totalSummons);
  }, [currency]);

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
    const n = totalSummons;
    const p = summonStats.prob;
    const q = (1 - summonStats.prob);
    const k = summonStats.desired;

    var stats = new Statistics({
      n: totalSummons,
      p: summonStats.prob,
      q: (1 - summonStats.prob),
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
      setElementState({ ...elementState, odds: true });
      return totalProb;
    };

    const totalProb = binomCalc();
    // console.log(totalProb);

    const percentage = parseFloat(totalProb * 100).toFixed(2);

    let oddsRender = `${percentage}%`;

    if (k === 1 && n >= 330) {
      oddsRender = `Guaranteed pity (330 summons)`
    };

    setSummonOdds(oddsRender);
  };

  const saveSnapshot = () => {
    const savedRoll = {
      targetName: '',
      savingDate: dayjs(dates.start).format('YYYY/MM/DD'),
      bannerDate: dayjs(dates.target).format('YYYY/MM/DD'),
      rate: summonStats.prob,
      numDesired: summonStats.desired,
      budget: { sq: currency.sq, tx: currency.tx },
      numRolls: totalSummons,
      probability: summonOdds,
      slot: JSON.parse(localStorage.getItem('saved-rolls')).length
    };
    console.log(`Saving`, savedRoll);
    setSavedRolls([ ...savedRolls, savedRoll]);
  };

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />

      {/* Dynamically render the parent grid component only if there are saved rolls. */}
      <Grid h='' templateRows="repeat(1, fr)" templateColumns="repeat(2, 1fr)">
        <GridItem rowSpan={1} columnSpan={1}>
          <FormControl maxW="600px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
            <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Login Streak:</FormLabel>
                {/* TODO: Refactor away from defaultValue. */}
                <Input className="form-input" name="streak" type="number" placeholder="0" defaultValue={loginData.streak} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Total Logins:</FormLabel>
                <Input className="form-input" name="total" type="number" placeholder="0" defaultValue={loginData.total} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Starting Quartz:</FormLabel>
                <Input className="form-input" name="sq" type="number" placeholder="0" value={reserves.sq} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Starting Tickets:</FormLabel>
                <Input className="form-input" name="tx" type="number" placeholder="0" value={reserves.tx} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>SQ Purchases:</FormLabel>
                <Input className="form-input" name="whale" type="number" placeholder="0" value={purchaseData.whale} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Frequency:</FormLabel>
                <Select className="form-input" name="period" type="text">
                  <option value={0}>One-time</option>
                  <option value={1}>Monthly</option>
                </Select>
              </GridItem>
              {parseInt(purchaseData.period) === 1 ?
                <GridItem rowSpan={1} colSpan={2}>
                  <Checkbox name="alreadyPurchased" defaultChecked={false}>Already purchased this month?</Checkbox>
                </GridItem>
                : null}
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Extra SQ (can be negative):</FormLabel>
                <Input className="form-input" name="extraSq" type="number" placeholder="0" value={extras.sq} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Extra Tickets (can be negative):</FormLabel>
                <Input className="form-input" name="extraTx" type="number" placeholder="0" value={extras.tx} onSubmit={calc} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Start Date:</FormLabel>
                {/* TODO: Refactor as dayjs? */}
                <DatePicker selected={dates.start} onChange={(date) => setDates({ ...dates, start: date })} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>End Date:</FormLabel>
                <DatePicker selected={dates.target} onChange={(date) => setDates({ ...dates, target: date })} />
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
                <Input className="form-input" isReadOnly={true} name="total-sq" value={currency.sq} placeholder="0" />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1} >
                <FormLabel>Total Tickets:</FormLabel>
                <Input className="form-input" isReadOnly={true} name="total-sq" value={currency.tx} placeholder="0" />
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} >
                <FormLabel>Total Summons:</FormLabel>
              </GridItem>
              <GridItem rowSpan={1} colSpan={2} >
                <Input className="form-input" isReadOnly={true} name="total-summons" value={totalSummons} />
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
                <Input className="form-input" isReadOnly={summonStats.numRateup !== 0 ? true : false} name="total-summons" value={summonStats.prob} />
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
              {elementState.odds === true
                ? <GridItem rowSpan={1} colSpan={2}>
                  <Input className="form-input" maxW='400px' isReadOnly={true} name="total-summons" value={summonOdds} />
                  <Button marginTop={4} colorScheme="blue" onClick={saveSnapshot}>Save Snapshot</Button>
                </GridItem>
                : null
              }
            </Grid>
          </FormControl>
        </GridItem>
        <GridItem rowSpan={1} columnSpan={1}>
          {savedRolls.map((roll, pos) => (
            <GridItem key={roll.slot}>
              <RollSnapshot savedRolls={savedRolls} setSavedRolls={setSavedRolls} purchaseData={purchaseData} setPurchaseData={setPurchaseData} dates={dates} setDates={setDates} reserves={reserves} setReserves={setReserves} currency={currency} setCurrency={setCurrency} extras={extras} setExtras={setExtras} summonStats={summonStats} setSummonStats={setSummonStats} summonOdds={summonOdds} setSummonOdds={setSummonOdds} thisRoll={roll} />
            </GridItem>
          ))}
        </GridItem>
      </Grid>
    </>
  )
};

export default SummonCalc;
