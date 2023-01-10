import React, { useState } from 'react';
import dayjs from 'dayjs';


const SummonCalc = () => {

  const [startingSQ, setStartingSQ] = useState();
  const [startingTx, setStartingTx] = useState();

  const today = { y: dayjs().$y, m: dayjs().$M + 1, d: dayjs().$D };
  console.log(today);

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

  const handleFormUpdate = () => {
    // Set these up to read the correct value and useState.
    setStartingSQ();
    setStartingTx();
  };

  return (
    <>
      <h1>Calculate SQ</h1>
    </>
  )
};

export default SummonCalc;
