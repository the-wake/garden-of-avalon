import React, { useState } from 'react';

const SummonCalc = () => {

  const [startingSQ, setStartingSQ] = useState();
  const [startingTx, setStartingTx] = useState();

  const calcWeeklies = (origin, start, target) => {
    // Have this get today's index of the weekly rotation.
    const index = origin;
    // Have this get the remainder of the final week if n < 7.
    const remainder = start - target;
    // This gets the values of each full weeks' gains.
    const weeks = start - target;

    const gains = index + remainder + weeks;
    return gains;
  };

  const calcEvents = (origin, start, target) => {
    // I have no idea.
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
