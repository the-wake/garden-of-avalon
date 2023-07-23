import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox, IconButton } from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import DatePicker from "react-datepicker";


import "react-datepicker/dist/react-datepicker.css";

const RollSnapshot = ({ savedRolls, setSavedRolls, purchaseData, setPurchaseData, dates, setDates, reserves, setReserves, currency, setCurrency, extras, setExtras, summonStats, setSummonStats, summonOdds, setSummonOdds, editState, setEditState, thisRoll }) => {

  const [rollData, setRollData] = useState(thisRoll);
  // console.log(rollData);

  const [editingDates, setEditingDates] = useState(false);

  const [snapshotData, setSnapshotData] = useState({ savedRolls, purchaseData, dates, reserves, currency, extras, summonStats, summonOdds });

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

  const handleFormUpdate = (e) => {
    setRollData({ ...rollData, [e.target.name]: e.target.value });
  };

  const dateRangeUpdate = () => {
    console.log('Updating date ranges.')
    setEditingDates(true);
    console.log(editingDates);
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

  useEffect(() => {
    // If the probability is still p, treat it and convert it into a percent; otherwise just copy it from probability.
    if (typeof rollData.percentage === 'number') {
      const percentage = parseFloat(rollData.probability * 100).toFixed(2);
      setRollData({ ...rollData, percentage: `${percentage}%` });
    } else {
      setRollData({ ...rollData, percentage: rollData.probability })
    };
  }, [rollData.probability]);

  const confirmEdit = () => {
    console.log(snapshotData);
    if (window.confirm('Load selected roll into the editing form?')) {
      console.log('Editing roll:', snapshotData.purchaseData, new Date(rollData.bannerDate), snapshotData.reserves, snapshotData.extras, rollData.targetName, snapshotData.summonOdds);
      setPurchaseData(snapshotData.purchaseData);
      setDates({ ...dates, start: new Date(rollData.savingDate), target: new Date(rollData.bannerDate) });
      setReserves({ sq: snapshotData.reserves.sq || 0, tx: snapshotData.reserves.tx || 0 });
      // setCurrency(snapshotData.currency);
      setExtras(snapshotData.extras);
      // TODO: Don't have way of adjusting num desired yet.
      setSummonStats({ ...summonStats, targetName: rollData.targetName, slot: rollData.slot });
      setSummonOdds(snapshotData.summonOdds);
      setEditState(1);
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
    };
  };

  // useEffect(() => {
  //   // console.log(JSON.parse(localStorage.getItem('saved-rolls')));
  // }, [savedRolls]);

  return (
    <div style={style.card}>
      {/* TODO: Refactor this into one big grid when the elements and styles are set. */}
      <Grid w='80px' h='80px' templateRows='repeat(4, 1fr)' templateColumns='repeat(2, 1fr)' gap={0.5}>
        <GridItem rowSpan={1} colSpan={2}>
          <img src='https://grandorder.wiki/images/d/d5/Icon_Servant_150.png' style={style.image} />
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
            <Select className="form-input" name="targetName" value={rollData.targetName} placeholder={'Target Servant'} onChange={() => 1 === 1} mb="8px" >
              <option value="Merlin">Merlin</option>
              <option value="Oberon">Oberon</option>
              <option value="Archetype: Earth">Archetype: Earth</option>
            </Select>
            {/* I don't think it makes sense to have date range editing here. Probably just have a button to send the data back to the calculator if you want to re-calculate ranges. */}
            {
              editingDates === false
                ? <Input className="form-input" name="bannerDate" type="text" readOnly={true} onClick={dateRangeUpdate} onChange={() => 1 === 1} value={rollData.bannerDate} />
                : <DatePicker format={'yyyy/MM/dd'} selected={new Date(rollData.bannerDate)} autoFocus onBlur={() => setEditingDates(false)} onChange={(date) => setRollData({ ...rollData, bannerDate: dayjs(date).format('YYYY/MM/DD') })} />
            }
            {/* <DatePicker format={'yyyy/MM/dd'} selected={new Date(rollData.bannerDate)} onBlur={() => setEditingDates(false)} onChange={(date) => setRollData({ ...rollData, bannerDate: dayjs(date).format('YYYY/MM/DD') })} /> */}
          </GridItem>
          <GridItem rowSpan={2} colSpan={3}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(8, 1fr)' gap={2} >
              <GridItem colSpan={1}>
                <FormLabel>SQ:</FormLabel>
              </GridItem>
              <GridItem colSpan={7}>
                <Input className="form-input" name="sq" type="number" onChange={() => 1 === 1} value={rollData.budget.sq} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Tickets:</FormLabel>
              </GridItem>
              <GridItem colSpan={7}>
                <Input className="form-input" name="tx" type="number" onChange={() => 1 === 1} value={rollData.budget.tx} />
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem rowSpan={2} colSpan={4}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(8, 1fr)' gap={2} >
              <GridItem colSpan={1}>
                <FormLabel>Rolls:</FormLabel>
              </GridItem>
              <GridItem colSpan={3}>
                <Input className="form-input" name="numRolls" type="number" readOnly={true} value={rollData.numRolls} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Rate:</FormLabel>
              </GridItem>
              <GridItem colSpan={3}>
                <Input className="form-input" name="numRolls" type="number" readOnly={true} value={rollData.rate} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Desired:</FormLabel>
              </GridItem>
              {/* TODO: Run calc when updating relevant values? Or just make them send it back to the editor? */}
              <GridItem colSpan={3}>
                <Input className="form-input" name="numDesired" type="number" readOnly={true} value={rollData.numDesired} />
              </GridItem>
              <GridItem colSpan={1}>
                <FormLabel>Odds:</FormLabel>
              </GridItem>
              <GridItem colSpan={3}>
                <Input className="form-input" name="numRolls" type="text" readOnly={true} value={rollData.percentage} />
              </GridItem>
            </Grid>
          </GridItem>
        </Grid >
      </FormControl>
    </div>
  )
};

export default RollSnapshot;
