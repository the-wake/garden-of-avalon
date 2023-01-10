import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import './SummonCalc.css'

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

  const calc = () => {
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

  useEffect(() => {
    console.log(startingSQ, startingTx)
  }, [startingSQ, startingTx]);

  return (
    <>
      <h1>Calculate SQ</h1>
      <br />
      <br />
      <form id="calc-form" onChange={handleFormUpdate}>
        <div>Quartz: <input className="form-input" name="startingSQ" placeholder="0" /></div>
        <div>Tickets: <input className="form-input" name="startingTx" placeholder="0" /></div>
      </form>
    </>
  )
};

export default SummonCalc;
