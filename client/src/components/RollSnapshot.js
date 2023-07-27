import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import sanitizeEmpty from '../utils/sanitizeEmpty.js'

import { useSelector, useDispatch } from 'react-redux'

import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox, IconButton } from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import DatePicker from "react-datepicker";


import "react-datepicker/dist/react-datepicker.css";

const RollSnapshot = ({ rollObj, savedRolls, setSavedRolls, setDateData, setCurrency, setSummonStats, setSums, editState, setEditState, rollIndex }) => {

  const servantData = useSelector((state) => state.servants.roster);

  let initRoll = rollObj;
  console.log(`Rendering component:`, initRoll);

  const [rollData, setRollData] = useState(initRoll);

  const [editingDates, setEditingDates] = useState(false);

  const [editStyle, setEditStyle] = useState(false);

  const style = {
    class: {
      saber: {
        backgroundColor: '#a8a8a8'
      },
      archer: {
        backgroundColor: '#cc8d8d'
      },
      lancer: {
        backgroundColor: '#7daab5'
      },
      rider: {
        backgroundColor: '#d69fce'
      },
      caster: {
        backgroundColor: '#675c6e'
      },
      assassin: {
        backgroundColor: '#666666'
      },
      berserker: {
        backgroundColor: '#613c3c'
      },
      extra: {
        backgroundColor: '#c0e8bc'
      },
    },
    card: {
      backgroundColor: '#8888BB',
      borderRadius: '6px',
      minHeight: '80px',
      textAlign: 'left',
      display: 'flex',
      margin: '12px'
    },
    header: {
      padding: '8px 12px 0 12px'
    },
    image: {
      width: '80px',
      height: '80px'
    }
  };

  const cardStyles = {
    normal: {
      backgroundColor: '#8888BB',
      borderRadius: '6px',
      minHeight: '80px',
      textAlign: 'left',
      display: 'flex',
      margin: '12px'
    },
    editing: {
      backgroundColor: '#BB8888',
      borderRadius: '6px',
      minHeight: '80px',
      textAlign: 'left',
      display: 'flex',
      margin: '12px'
    }
  };

  // Have to reformat to make value Servant ID, then have useEffect set their name.
  const handleFormUpdate = (e) => {
    if (e.target.name === 'targetNo') {
      const collectionNo = e.target.value;
      console.log(`Finding Servant ID ${collectionNo}`);
      const targetIndex = servantData.findIndex(servant => servant.collectionNo == collectionNo);
      const targetServant = servantData[targetIndex];
      console.log(targetServant.name, targetServant.face);
      const targetName = servantData[targetIndex].name;
      const targetImage = servantData[targetIndex].face;
      setRollData({
        ...rollData,
        targetNo: collectionNo,
        targetName,
        targetImage,
      });
    } else {
      setRollData({ ...rollData, [e.target.name]: e.target.value });
    };
  };

  const dateRangeUpdate = () => {
    console.log('Updating date ranges.')
    setEditingDates(true);
    // console.log(editingDates);
  };

  // Run setSavedRolls whenever an individual roll is updated.
  useEffect(() => {
    const rollIndex = rollData.slot;
    const updatedRolls = savedRolls.map((roll, i) => {
      if (roll.slot === rollIndex) {
        // console.log(`Matched roll index ${rollIndex}.`)
        // console.log(rollData);
        return rollData;
      } else {
        return roll;
      };
    });
    // console.log(updatedRolls);
    setSavedRolls(updatedRolls);
    // setEditingDates(false);
  }, [rollData]);

  // Save to local storage whenever savedRolls state is updated.
  useEffect(() => {
    // console.log(`Saving rolls`, savedRolls);
    localStorage.setItem('saved-rolls', JSON.stringify(savedRolls));
  }, [savedRolls]);

  // TODO: Should this pull the data from local storage to make sure it's consistent across reloads.
  const confirmEdit = () => {
    if (window.confirm('Load selected roll into the editing form?')) {
      console.log('Editing roll:', rollData);
      let newRoll = {};

      const { sqPurchase, purchasePeriod, alreadyPurchased, sqStarting, txStarting, sqIncome, txIncome, sqExtra, txExtra, sqMinus, txMinus } = rollData;
      newRoll.currency = { sqPurchase, purchasePeriod, alreadyPurchased, sqStarting, txStarting, sqIncome, txIncome, sqExtra, txExtra, sqMinus, txMinus };

      const { start, end } = rollData;
      newRoll.dateData = { start, end };

      const { sqSum, txSum, totalSummons } = rollData;
      newRoll.sums = { sqSum, txSum, totalSummons };

      const { targetNo, targetName, targetImage, rarity, numRateup, prob, desired, summonOdds, slot } = rollData;
      newRoll.summonStats = { targetNo, targetName, targetImage, rarity, numRateup, prob, desired, summonOdds, slot };

      sanitizeEmpty(newRoll.currency);
      console.log(newRoll);

      setCurrency(newRoll.currency);
      setDateData(newRoll.dateData);
      setSummonStats(newRoll.summonStats);

      setEditState(newRoll.summonStats.slot);
      setEditStyle(true);
    };
  };

  const confirmDelete = () => {
    if (window.confirm('Delete selected roll?')) {
      console.log('Deleting roll.')

      let foundTarget = false;

      const rollIndex = rollData.slot;
      const updatedRolls = savedRolls.filter((roll, i) => {
        if (roll.slot === rollIndex) {
          console.log(`Matched roll index ${rollIndex}.`)
          console.log(rollData);
          foundTarget = true;
          return;
        } else {
          if (foundTarget) {
            roll.slot--
          };
          return roll;
        };
      });
      console.log(updatedRolls);
      setSavedRolls(updatedRolls);
      setEditingDates(false);
      setEditState(false);
    };
  };

  // Used by following map to give individual names to each Servant where there are duplicates.
  let servantsSoFar = [];

  const servantsMap = servantData.map((servant) => {
    if (servant.rarity < 3 || servant.type === 'heroine' || servant.type === 'enemyCollectionDetail') {
      return
    };

    let useName = servant.name;

    if (servantsSoFar.includes(servant.name)) {
      const appendClass = `${servant.className.charAt(0).toUpperCase()}${servant.className.slice(1)}`;
      const appendedName = `${servant.name} (${appendClass})`;
      // console.log(`Servant name ${servant.name} already in array. Appending name to ${appendedName}`);
      servantsSoFar.push(appendedName);
      useName = appendedName;
    } else {
      // console.log(`Pushing ${servant.name} to array so far.`);
      servantsSoFar.push(servant.name);
    };

    return (
      <>
        <option value={servant.collectionNo}>{useName}</option>
      </>
    )

  });

  return (
    <div style={editState === rollData.slot ? cardStyles.editing : cardStyles.normal}>
      {/* TODO: Refactor this into one big grid when the elements and styles are set. */}
      <Grid w='80px' h='80px' templateRows='repeat(4, 1fr)' templateColumns='repeat(2, 1fr)' gap={0.5}>
        <GridItem rowSpan={1} colSpan={2}>
          <img src={rollData.targetImage} style={style.image} />
        </GridItem>
        <GridItem rowSpan={3} colSpan={1}>
          <IconButton ml='4px' size='sm' aria-label='Edit item' icon={<EditIcon />} onClick={confirmEdit} />
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <IconButton mr='4px' size='sm' aria-label='Delete item' icon={<DeleteIcon />} onClick={confirmDelete} />
        </GridItem>
      </Grid>
      <FormControl marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
        <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(10, 1fr)' p="6px" gap={5}>
          <GridItem rowSpan={1} colSpan={3}>
            <Select className="form-input" name="targetNo" value={rollData.targetNo} placeholder={'Target Servant'} onChange={() => 1 === 1} mb="8px" >
              {servantsMap}
            </Select>
            <Input className="form-input" name="bannerDate" type="date" onChange={() => 1 === 1} value={rollData.end} />
            {/* <Input className="form-input" name="bannerDate" type="text" hidden={editingDates === true} readOnly={true} onClick={dateRangeUpdate} onChange={() => 1 === 1} value={rollData.end} format={'yyyy/MM/dd'} />
            <GridItem hidden={editingDates === false}>
              <DatePicker format={'yyyy/MM/dd'} selected={rollData.end} autoFocus onBlur={() => setEditingDates(false)} onChange={(date) => setRollData({ ...rollData, bannerDate: new Date(date) })} />
            </GridItem> */}
          </GridItem>
          <GridItem rowSpan={2} colSpan={3}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(8, 1fr)' gap={2} >
              <GridItem colSpan={1}>
                <FormLabel>SQ:</FormLabel>
              </GridItem>
              <GridItem colSpan={7}>
                <Input className="form-input" name="sq" type="number" onChange={() => 1 === 1} value={rollData.sqSum} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Tickets:</FormLabel>
              </GridItem>
              <GridItem colSpan={7}>
                <Input className="form-input" name="tx" type="number" onChange={() => 1 === 1} value={rollData.txSum} />
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem rowSpan={2} colSpan={4}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(8, 1fr)' gap={2} >
              <GridItem colSpan={1}>
                <FormLabel>Rolls:</FormLabel>
              </GridItem>
              <GridItem colSpan={3}>
                <Input className="form-input" name="numRolls" type="number" readOnly={true} value={rollData.totalSummons} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Rate:</FormLabel>
              </GridItem>
              <GridItem colSpan={3}>
                <Input className="form-input" name="numRolls" type="number" readOnly={true} value={rollData.prob} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Desired:</FormLabel>
              </GridItem>
              <GridItem colSpan={3}>
                <Input className="form-input" name="numDesired" type="number" readOnly={true} value={rollData.desired} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Odds:</FormLabel>
              </GridItem>
              <GridItem colSpan={3}>
                <Input className="form-input" name="numRolls" type="text" readOnly={true} value={rollData.summonOdds} />
              </GridItem>
            </Grid>
          </GridItem>
        </Grid >
      </FormControl>
    </div>
  )
};

export default RollSnapshot;
