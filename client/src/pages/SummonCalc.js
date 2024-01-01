import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import getSlot from '../utils/getSlot.js';
import sanitizeEmpty from '../utils/sanitizeEmpty.js';
import dateHelper from '../utils/dateHelper.js';
import { periodic, oddsObj } from '../utils/staticData.js';

import { useSelector, useDispatch } from 'react-redux';

import { useMediaQuery } from '@chakra-ui/react';
import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, Button, Select, Checkbox, Box } from '@chakra-ui/react';
import Statistics from "statistics.js";

import "react-datepicker/dist/react-datepicker.css";

import RollSnapshot from '../components/RollSnapshot.js';
import RateupMenu from '../components/RateupMenu.js';
import CalcFooter from '../components/CalcFooter.js';
import NewSnapshot from "../components/NewSnapshot";

const SummonCalc = () => {

  const [loginData, setLoginData] = useState({});

  const [currency, setCurrency] = useState({
    sqPurchase: '',
    purchasePeriod: 0,
    alreadyPurchased: false,
    sqStarting: '',
    txStarting: '',
    sqIncome: '',
    txIncome: '',
    sqEvent: '',
    txEvent: '',
    sqExtra: '',
    txExtra: '',
    sqMinus: '',
    txMinus: '',
    dailySingles: ''
  });

  const [dateData, setDateData] = useState({
    start: dateHelper(new Date().toLocaleDateString()),
    end: dateHelper(new Date().toLocaleDateString())
  });

  const [sums, setSums] = useState({
    sqSum: 0,
    txSum: 0,
    totalSummons: 0,
  });

  const [summonStats, setSummonStats] = useState({
    targetNo: '',
    targetName: '',
    targetImage: 'https://static.atlasacademy.io/JP/Faces/f_8001000.png',
    rarity: 'ssr',
    numRateup: 1,
    prob: 0.008,
    desired: 1,
    summonOdds: 0,
    summonNotes: '',
    slot: '',
    draft: false
  });

  const [elementState, setElementState] = useState({
    odds: false
  });

  const [editState, setEditState] = useState(false);

  const [savedRolls, setSavedRolls] = useState(JSON.parse(localStorage.getItem('saved-rolls')) || []);

  const style = {
    flexContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    formEl: {
      flex: '2 3 300px'
    },
    listEl: {
      flex: '3 2 400px',
      background: '#dae8ed',
      borderRadius: '9px',
      overflowY: 'auto',
      maxHeight: '1048px'
    },
  };

  // single media query with no options
  // const [isLargerThan800] = useMediaQuery('(min-width: 800px)')

  // ssr-friendly media query with fallback
  const [isLargerThan1680] = useMediaQuery('(min-width: 1680px)', {
    ssr: true,
    fallback: false, // return false on the server, and re-evaluate on the client side
  });

  const today = dateHelper(new Date().toLocaleDateString());

  // Update currency and calendar state from local storage on component render. (Could refactor into using a redux store.)
  useEffect(() => {
    if (localStorage.getItem('currency')) {
      let localCurrency = JSON.parse(localStorage.getItem('currency'));
      setCurrency(localCurrency);
    };

    if (localStorage.getItem('calendar-data')) {
      let { start, end } = JSON.parse(localStorage.getItem('calendar-data'));
      setDateData({ start, end });
    } else {
      setDateData({ start: today, end: today });
    };
  }, []);

  // Treats and sets login data and currency on page load.
  useEffect(() => {
    let total = JSON.parse(localStorage.getItem('login-data'))?.total || 0;
    let streak = JSON.parse(localStorage.getItem('login-data'))?.streak || 0;
    let date = JSON.parse(localStorage.getItem('login-data'))?.date || today;
    let dateClone = date;
    // console.log(total, streak, dateClone, today);

    const difference = Math.floor(dayjs().diff(dateClone, 'days', true));

    if (difference >= 1) {
      console.log(`Difference: ${difference}`);

      // If it's been at least a week since last login, loop through difference to look for Master Mission refreshes in the elapsed duration.
      if (difference >= 7) {
        const updateWeeklies = window.confirm('It\'s been over a week since last login. Update with Master Missions and daily logins?')

        if (updateWeeklies) {
          const masterMissionGains = calcMasterMissions(dateClone, difference);
          let sqNum = parseInt(currency.sqStarting) || 0;
          setCurrency({ sqStarting: sqNum += parseInt(masterMissionGains) || 0 });
          // console.log(`Added ${masterMissionGains} SQ from Master Missions to ${sqNum} starting SQ.`);
        };
      };

      // Get index of week for the day of the last calculation.
      // const origin = streak % 7;
      // console.log(`Starting on index ${origin} of the daily array.`);

      // const addCurrency = calcWeeklies(dateClone, difference, origin);
      // console.log('Adding to currency', addCurrency);

      const monthsDiff = ((dayjs().$y - dayjs(dateClone).$y) * 12) + (dayjs().$M - dayjs(dateClone).$M);
      // console.log(monthsDiff);
      if (monthsDiff >= 1) {
        const shopUpdate = window.confirm(`${monthsDiff} months have elapsed since last update. Should we add monthly shop tickets to your reserves?`);
        if (shopUpdate) {
          let { sqStarting, txStarting } = JSON.parse(localStorage.getItem('currency'));
          console.log(sqStarting, txStarting);
          txStarting += monthsDiff * 5;
          setCurrency({ sqStarting, txStarting });
          console.log(`Updated reserves with ${monthsDiff * 5} summoning tickets. Now have ${currency.txStarting} summoning tickets`);
        };
      };

      total += difference;
      streak += difference;
      dateClone = today;
      console.log(`Updating login history to ${today}: ${total} total logins, ${streak} login streak.`);
    };

    // Update currency with new login rewards.
    setLoginData({
      total: total || 0,
      streak: streak || 0,
      date: dateClone || today
    });
  }, []);

  // TODO: We could make a treatment function that just loops through two arguments' year / month / day fields, but since different functions do different things with the data it may be too convoluted.

  // Calculates master missions. Could rename to calcStreak instead to be clearer what data it cares about and produces.
  const calcWeeklies = (start, numDays, origin = 0) => {
    // console.log(`Calculating weeklies. Start: ${start}; numDays: ${numDays}.`);

    // console.log(`${numDays} days from today to start date.`)

    // The weekly index of the start day.
    let index;
    // console.log(origin || numDays);

    origin <= 6 ? index = origin : index = (loginData.streak + numDays) % 7;

    let weeklyGains = {
      sq: 0,
      tx: 0
    };

    const masterMissionGains = calcMasterMissions(start, numDays);
    // console.log(`Calculating Master Mission. Start: ${start}; Number of Days: ${numDays}.`);
    weeklyGains.sq += masterMissionGains;
    // console.log(`Added ${masterMissionGains} SQ from Master Missions.`);
    // console.log(weeklyGains);

    // Daily login bonus courser.
    for (let i = 0; i < numDays; i++) {
      const trueI = (i + index) % 7;

      const thisLogin = periodic.weeklyLogin[trueI];
      // console.log(`Today's login reward: ${JSON.stringify(thisLogin)}`);

      // Course through weeklyGains to find matching rewards.
      if (thisLogin.type in weeklyGains) {
        weeklyGains[thisLogin.type] += thisLogin.val;
      };
    };
    return weeklyGains;
  };

  const calcMasterMissions = (start, difference) => {
    let dayInc = 0;
    let sqGains = 0;
    start = dayjs(start);
    // console.log(start, difference);

    for (var i = 0; i < difference; i++) {
      dayInc++;
      const currentDay = start.add(dayInc, 'day').format('ddd');
      if (currentDay === "Sun") {
        sqGains += 3;
        // console.log(`Adding 3 SQ to total`)
      };
    };
    return sqGains;
  };

  // Calculates login streaks.
  const calcLogins = (start, end) => {
    const { total } = loginData;
    // console.log(loginData);
    const startIndex = total % 50;
    // console.log(startIndex);

    // Changed from ceil to floor.
    let distance = Math.floor(end.diff(start, 'days', true));

    const endingLogins = startIndex + distance;
    const loginSQ = Math.floor(endingLogins / 50) * 30;

    // console.log(`${distance} days until end date. Total logins gain will be ${loginSQ} Quartz.`);

    return loginSQ;
  };

  // Calculates standard MP shop (not special MP shop items; those go in calcEvents).
  const calcShop = (monthDistance) => {

    const shopTx = monthDistance * 5;

    // console.log(`${monthDistance} shop resets within target range, giving ${shopTx} Tickets.`);

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
  const calcPurchases = (numMonths) => {
    const { sqPurchase, purchasePeriod, alreadyPurchased } = currency;
    // console.log(sqPurchase, purchasePeriod, alreadyPurchased);

    const numPurchases = parseInt(purchasePeriod) === 0 ? 1 : numMonths + 1 - alreadyPurchased;
    // console.log(sqPurchase, numPurchases);

    const totalPurchases = parseInt(sqPurchase) * numPurchases || 0;
    // console.log(totalPurchases);
    return totalPurchases;
  };

  const calcSums = () => {
    // Purchases should be sent as an object and destructured into number of purchases and number of SQ per. Everything else can probably come from state since the element sending the function call probably won't have direct access to that data.

    const start = dayjs(dateData.start);
    const end = dayjs(dateData.end);

    if (end.diff(start) < 0) {
      return;
    };

    let numDays = Math.ceil(dayjs(end).diff(dayjs(start), 'day', true));
    const numMonths = (end.$y - start.$y) * 12 + (end.$M - start.$M);

    const startingSq = currency.sqStarting || 0
    const startingTx = currency.txStarting || 0;
    const weeklies = calcWeeklies(start, numDays);
    const logins = calcLogins(start, end);
    const shop = calcShop(numMonths);
    const events = calcEvents(start, end);
    const purchases = calcPurchases(numMonths) || 0;
    const eventSq = parseInt(currency.sqEvent) || 0;
    const eventTx = parseInt(currency.txEvent) || 0;
    const otherSq = parseInt(currency.sqExtra) || 0;
    const otherTx = parseInt(currency.txExtra) || 0;
    const spentSq = parseInt(currency.sqMinus) || 0;
    const spentTx = parseInt(currency.txMinus) || 0;
    const dailySpending = parseInt(currency.dailySingles) * numDays || 0;

    const gainedSq = parseInt(weeklies.sq + logins + events.sq);
    const gainedTx = parseInt(weeklies.tx + shop + events.tx);


    const newSq = gainedSq + startingSq + purchases + eventSq + otherSq - spentSq - dailySpending || 0;
    const newTx = gainedTx + startingTx + +eventTx + otherTx - spentTx || 0;

    const newSummons = totalSummons(newSq, newTx);
    setSums({ sqSum: newSq, txSum: newTx, totalSummons: newSummons });

    const newOdds = calcOdds(newSummons, summonStats.prob, summonStats.desired);

    setElementState({ ...elementState, odds: true });
    setSummonStats({ ...summonStats, summonOdds: newOdds });
  };

  const calcOdds = (n, p, k) => {
    // n: total summons
    // p: prob
    // k: desired

    if (p > 1) p = 1;

    var stats = new Statistics({
      n,
      p,
      // q: (1 - summonStats.prob),
      k
    });

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

    const percentage = parseFloat(totalProb * 100).toFixed(2);

    let oddsRender = `${percentage}%`;

    if (k === 1 && n >= 330) {
      oddsRender = `Pity (330 summons)`
    };

    return oddsRender;
  };

  const totalSummons = (sq, tx, rolls) => {
    const total = rolls || Math.floor((sq / 3 + tx) + Math.floor((sq / 3 + tx) / 10));

    if (isNaN(total) || total < 0) {
      total = 0;
    };

    return total;
  };

  const handleFormUpdate = (e) => {
    // const currencyVals = ['sqPurchase', 'purchasePeriod', 'alreadyPurchased', 'sqStarting', 'txStarting', 'sqIncome', 'txIncome', 'sqExtra', 'txExtra'];

    // Sanitize any ints passed as strings.
    let targetVal = e.target.value;

    if (!isNaN(parseInt(targetVal))) {
      targetVal = parseInt(targetVal);
    };
    // console.log(targetVal);

    // Handle login updates. (Dates are handled separately.)
    if (e.target.name === 'start' || e.target.name === 'end') {
      setDateData({ ...dateData, [e.target.name]: e.target.value });
    } else if (e.target.name === 'total' || e.target.name === 'streak') {
      setLoginData({ ...loginData, [e.target.name]: parseInt(e.target.value) });
    }

    else if (e.target.name === 'alreadyPurchased') {
      setCurrency({ ...currency, alreadyPurchased: e.target.checked })
    }

    // Handle all other updates with proper integer or string.
    else {
      setCurrency({ ...currency, [e.target.name]: targetVal });
    };
    // I think we're running calcSums everywhere where relevant state changes via useEffects, so this one is causing stale loops.
    // calcSums();
  };

  // Does this even have a point any longer?
  useEffect(() => {
    setElementState({ ...elementState, odds: false });
    const currencyClone = { ...currency };
    // console.log(currency);
    const sanitizedCurrency = sanitizeEmpty(currencyClone);
    // console.log(sanitizedCurrency);
    localStorage.setItem('currency', JSON.stringify(sanitizedCurrency));
    // console.log('Dates: ', dateData);
    calcSums();
    // console.log(`State changed: ${summonStats.summonOdds}`);
  }, [loginData, currency, dateData]);

  // Set local storage when updating login streak or currency totals.
  useEffect(() => {
    if (loginData.total || loginData.streak || loginData.date) {
      // console.log('Storing', loginData);
      localStorage.setItem('login-data', JSON.stringify(loginData));
    };
  }, [loginData]);

  useEffect(() => {
    if (dateData) {
      localStorage.setItem('calendar-data', JSON.stringify(dateData))
    }
  }, [dateData]);

  useEffect(() => {
    savedRolls.length > 0 && console.log('Saved Roll Data: ', savedRolls);
    localStorage.setItem('saved-rolls', JSON.stringify(savedRolls));
  }, [savedRolls]);

  const clearForm = () => {
    setCurrency({
      ...currency,
      sqPurchase: '',
      sqStarting: '',
      txStarting: '',
      sqIncome: '',
      txIncome: '',
      sqEvent: '',
      txEvent: '',
      sqExtra: '',
      txExtra: '',
      sqMinus: '',
      txMinus: '',
      dailySingles: ''
    });
  };

  const probHandler = (e) => {
    if (e.target.name === 'rarity') {
      setSummonStats({ ...summonStats, numRateup: 1 });
      const newProb = oddsObj[e.target.value][summonStats.numRateup - 1] || oddsObj[e.target.value][0];
      console.log('New Prob: ', newProb);
      setSummonStats({ ...summonStats, [e.target.name]: e.target.value, prob: newProb });
    } else if (e.target.name === 'numRateup') {
      if (e.target.value != 0) {
        console.log(e.target.value);
        const newProb = oddsObj[summonStats.rarity][e.target.value - 1];
        console.log('New Prob: ', newProb);
        setSummonStats({ ...summonStats, [e.target.name]: e.target.value, prob: newProb });
      } else {
        setSummonStats({ ...summonStats, numRateup: 0 });
      }
    } else if (e.target.name === 'prob') {
      let newProb = e.target.value;
      if (parseFloat(newProb) > 1) newProb = 1.00;
      setSummonStats({ ...summonStats, prob: newProb });
    } else if (e.target.name === 'desired') {
      setSummonStats({ ...summonStats, desired: parseFloat(e.target.value) || 1 });
    };
  };

  const saveSnapshot = () => {
    const savedRoll = {
      ...dateData,
      ...currency,
      ...sums,
      ...summonStats,
    };

    // If making a new entry, generate a slot and save it.
    if (editState === false) {
      savedRoll.slot = getSlot();
      console.log(`Saving`, savedRoll);
      setSavedRolls([...savedRolls, savedRoll]);
    }
    // If editing a roll, find its index and update it.
    else if (editState >= 0) {
      let rollsClone = [...savedRolls];
      console.log(rollsClone);
      const rollIndex = savedRoll.slot;
      console.log(`Updating roll index ${rollIndex}`);
      const updatedRolls = rollsClone.map((roll, i) => {
        if (roll.slot === rollIndex) {
          // console.log(`Matched roll index ${rollIndex}. Returning`, savedRoll);
          return savedRoll;
        } else {
          return roll;
        };
      });
      console.log(updatedRolls);
      setSavedRolls(updatedRolls);
      clearForm();
    };

    setSummonStats({ ...summonStats, targetNo: '', targetName: '', targetImage: 'https://static.atlasacademy.io/JP/Faces/f_8001000.png', summonNotes: '' });
    setEditState(false);
  };

  const handleEditCancel = () => {
    setEditState(false)
    setSummonStats({ ...summonStats, targetNo: '', targetName: '', targetImage: 'https://static.atlasacademy.io/JP/Faces/f_8001000.png', summonNotes: '' });
  };

  const totalDays = () => {
    const start = dayjs(dateData.start);
    const end = dayjs(dateData.end);
    let range = Math.floor(end.diff(start, 'days', true));
    // console.log(range);
    isNaN(range) ? range = 0 : range = range;
    return range;
  };

  const handleBulkUpdate = (sq, tx) => {
    sq = parseInt(sq) || 0;
    tx = parseInt(tx) || 0;
    console.log(sq, tx);

    const newRolls = savedRolls.map((roll, pos) => {
      if (roll.draft) {
        return roll;
      };

      const nSummons = totalSummons(roll.sqSum + sq, roll.txSum + tx);
      const newMath = calcOdds(nSummons, summonStats.prob, summonStats.desired);
      console.log(newMath);
      const updatedObj = { ...roll, sqStarting: roll.sqStarting + sq, txStarting: roll.txStarting + tx, sqSum: roll.sqSum + sq, txSum: roll.txSum + tx, totalSummons: nSummons, summonOdds: newMath };
      return updatedObj;
    });

    console.log(newRolls);
    setSavedRolls(newRolls);
  };

  const rollMap = () => {
    {
      return savedRolls.map((roll, pos) => (
        <GridItem key={`${roll.slot}-${JSON.stringify(roll)}`}>
          <RollSnapshot key={pos}
            rollObj={roll}
            savedRolls={savedRolls} setSavedRolls={setSavedRolls} setDateData={setDateData} setCurrency={setCurrency} setSums={setSums} summonStats={summonStats} setSummonStats={setSummonStats} editState={editState} setEditState={setEditState} rollIndex={roll.slot} calcOdds={calcOdds} noteChangeHandler={noteChangeHandler} noteSubmitHandler={noteSubmitHandler}
          />
        </GridItem>
      ));
    };
  };

  const noteChangeHandler = (e) => {
    setSummonStats({ ...summonStats, summonNotes: e.target.value });
  };

  const noteSubmitHandler = (e) => {
    // console.log(editState);
    const currentRoll = savedRolls[editState];
    const updatedRoll = { ...currentRoll, summonNotes: summonStats.summonNotes };
    console.log(updatedRoll);

    const updatedRolls = savedRolls.map((roll, pos) => {
      if (roll.slot === editState) {
        return updatedRoll;
      } else {
        return roll;
      }
    });
    // console.log(updatedRolls);
    setSavedRolls(updatedRolls);
  };

  return (
    <>
      <Flex mt={8} pb='80px' flexDirection={isLargerThan1680 ? 'row' : 'column'}>
        <div style={style.formEl}>
          <FormControl maxW="600px" marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
            <Grid h='' templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Login Streak:</FormLabel>
                <Input className="form-input" name="streak" type="number" placeholder="0" value={loginData.streak === 0 ? '' : loginData.streak} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Total Logins:</FormLabel>
                <Input className="form-input" name="total" type="number" placeholder="0" value={loginData.total === 0 ? '' : loginData.total} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Starting Quartz:</FormLabel>
                <Input className="form-input" name="sqStarting" type="number" placeholder="0" value={currency.sqStarting === 0 ? '' : currency.sqStarting} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Starting Tickets:</FormLabel>
                <Input className="form-input" name="txStarting" type="number" placeholder="0" value={currency.txStarting === 0 ? '' : currency.txStarting} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>SQ Purchases:</FormLabel>
                <Input className="form-input" name="sqPurchase" type="number" placeholder="0" value={currency.sqPurchase === 0 ? '' : currency.sqPurchase} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Frequency:</FormLabel>
                <Select className="form-input" name="purchasePeriod" type="text" value={currency.purchasePeriod}>
                  <option value={0}>One-time</option>
                  <option value={1}>Monthly</option>
                </Select>
              </GridItem>
              <GridItem rowSpan={1} colSpan={2}>
                <Checkbox name="alreadyPurchased" disabled={currency.purchasePeriod === 0} defaultChecked={false} >Already purchased first month?</Checkbox>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Event SQ:</FormLabel>
                <Input className="form-input" name="sqEvent" type="number" placeholder="0" value={currency.sqEvent === 0 ? '' : currency.sqEvent} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Event Tickets:</FormLabel>
                <Input className="form-input" name="txEvent" type="number" placeholder="0" value={currency.txEvent === 0 ? '' : currency.txEvent} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Extra SQ:</FormLabel>
                <Input className="form-input" name="sqExtra" type="number" placeholder="0" value={currency.sqExtra === 0 ? '' : currency.sqExtra} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Extra Tickets:</FormLabel>
                <Input className="form-input" name="txExtra" type="number" placeholder="0" value={currency.txExtra === 0 ? '' : currency.txExtra} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Expected SQ Spending:</FormLabel>
                <Input className="form-input" name="sqMinus" type="number" placeholder="0" value={currency.sqMinus === 0 ? '' : currency.sqMinus} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Expected Ticket Spending:</FormLabel>
                <Input className="form-input" name="txMinus" type="number" placeholder="0" value={currency.txMinus === 0 ? '' : currency.txMinus} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Start Date:</FormLabel>
                <Input name="start" type="date" value={dateData.start} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>End Date:</FormLabel>
                <Input name="end" type="date" value={dateData.end} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel># Daily Singles</FormLabel>
                <Input name="dailySingles" type="number" placeholder="0" value={currency.dailySingles === 0 ? '' : currency.dailySingles} />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Total Days</FormLabel>
                <Input name="dateRange" type="number" disabled={true} placeholder="0" value={totalDays() === 0 ? '' : totalDays()} />
              </GridItem>
            </Grid>
            <Grid mt={6} templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Total Quartz:</FormLabel>
                <Input className="form-input" isReadOnly={true} name="sqSum" value={sums.sqSum} placeholder="0" />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
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
            <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={2}>
              <RateupMenu probHandler={probHandler} summonStats={summonStats} setSummonStats={setSummonStats} oddsObj={oddsObj} />
              <GridItem rowSpan={1} colSpan={1}>
                <FormLabel>Number of Copies Desired:</FormLabel>
                <Input className="form-input" name="desired" value={summonStats.desired} onChange={probHandler} />
              </GridItem>
              <GridItem className="results-area" rowSpan={1} colSpan={2} margin='auto'>
                <Flex flexDirection='row' justifyContent='space-evenly' gap={4} maxWidth='400px'>
                  <FormLabel textAlign='center' minWidth='120px' margin='auto'>Total Odds:</FormLabel>
                  <Input className="form-input" isReadOnly={true} name="summonOdds" value={summonStats.summonOdds} />
                </Flex>
              </GridItem>
            </Grid>
          </FormControl>
        </div>
        <Box style={style.listEl}>
          {rollMap()}
          <NewSnapshot savedRolls={savedRolls} setSavedRolls={setSavedRolls} />
        </Box>
      </Flex>
      <CalcFooter summonStats={summonStats} setSummonStats={setSummonStats} calcOdds={calcOdds} editState={editState} handleEditCancel={handleEditCancel} handleBulkUpdate={handleBulkUpdate} savedRolls={savedRolls} setSavedRolls={setSavedRolls} saveSnapshot={saveSnapshot} clearForm={clearForm} noteChangeHandler={noteChangeHandler} noteSubmitHandler={noteSubmitHandler} />
    </>
  )
};

export default SummonCalc;
