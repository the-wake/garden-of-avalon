import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import sanitizeEmpty from '../utils/sanitizeEmpty.js'

import { useSelector, useDispatch } from 'react-redux'

import { Grid, GridItem, Flex, Spacer } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox, IconButton } from '@chakra-ui/react'
import { EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons'


import "react-datepicker/dist/react-datepicker.css";

const RollSnapshot = ({ rollObj, savedRolls, setSavedRolls, setDateData, setCurrency, setSummonStats, setSums, editState, setEditState, rollIndex }) => {

  const servantData = useSelector((state) => state.servants.roster);

  let initRoll = rollObj;
  // console.log(`Rendering component:`, initRoll);

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
      paddingTop: '4px',
      paddingBottom: '7px',
      margin: '12px'
    },
    editing: {
      backgroundColor: '#BB8888',
      borderRadius: '6px',
      minHeight: '80px',
      textAlign: 'left',
      display: 'flex',
      paddingTop: '4px',
      paddingBottom: '7px',
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

  // const dateRangeUpdate = () => {
  //   console.log('Updating date ranges.')
  //   setEditingDates(true);
  //   // console.log(editingDates);
  // };

  // TODO: Will eventually want to allow for tweaking from this form. This will have to be refactored as setting an isEdited flag, which gives a save button (in place of the 'send to editor' button).
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

      const { sqPurchase, purchasePeriod, alreadyPurchased, sqStarting, txStarting, sqIncome, txIncome, sqEvent, txEvent, sqExtra, txExtra, sqMinus, txMinus, dailySingles } = rollData;
      newRoll.currency = { sqPurchase, purchasePeriod, alreadyPurchased, sqStarting, txStarting, sqIncome, txIncome, sqEvent, txEvent, sqExtra, txExtra, sqMinus, txMinus, dailySingles };

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

  const moveSnapshot = (dir) => {
    // console.log(`Moving ${dir}.`);
    let targetIndex;
    if (dir === 'up') {
      targetIndex = rollData.slot - 1;
    } else if (dir === 'down') {
      targetIndex = rollData.slot + 1;
    };

    const targetNewIndex = rollData.slot;
    const rollsClone = [...savedRolls];
    const other = rollsClone.filter((roll) => {
      return roll.slot === targetIndex;
    })[0];
    const poppedArr = rollsClone.filter((roll) => {
      return (roll.slot !== targetIndex && roll.slot !== rollData.slot);
    });
    console.log(other, poppedArr);
    setRollData({ ...rollData, slot: targetIndex });

    // The following gets us the proper array, but it doesn't reflect the new slot order. This makes them populate in the wrong order when we map over them in the parent component.
    let updatedRolls = ([...poppedArr, { ...rollData, slot: targetIndex }, { ...other, slot: targetNewIndex }]);
    console.log(updatedRolls);
    let freshArr = [];

    for (let i = 0; i < updatedRolls.length; i++) {
      updatedRolls.map((roll, pos) => {
        if (roll.slot === i) {
          console.log(roll);
          return freshArr.push(roll);
        };
      });
    };
    console.log(freshArr);
    setSavedRolls(freshArr);
  };

  // Used by following map to give individual names to each Servant where there are duplicates.
  let servantsSoFar = [];

  const servantsMap = servantData.map((servant, pos) => {
    if (servant.rarity < 3 || servant.type === 'heroine' || servant.type === 'enemyCollectionDetail' || servant.name === 'Altria Pendragon (Lily)' || servant.name === 'Habetrot') {
      return;
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
      <option key={pos} value={servant.collectionNo}>{useName}</option>
    );

  });

  return (
    <div style={editState === rollData.slot ? cardStyles.editing : cardStyles.normal}>
      <Flex direction='column' align='center' justify='space-evenly' pr='6px'>
        <IconButton ml='4px' size='sm' aria-label='Move item up' name='moveUpIcon' isDisabled={rollData.slot === 0 || editState !== false} onClick={() => { moveSnapshot('up') }} icon={<ArrowUpIcon name='moveUp' />} />
        <IconButton ml='4px' size='sm' aria-label='Move item down' name='moveDownIcon' isDisabled={rollData.slot === savedRolls.length - 1 || editState !== false} onClick={() => { moveSnapshot('down') }} icon={<ArrowDownIcon name='moveDown' />} />
      </Flex>
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
        <Grid w='100%' gridAutoFlow="column" templateRows='repeat(2, 1fr)' templateColumns='repeat(10, 1fr)' p="6px" gap={1}>

          <GridItem rowSpan={2} colSpan={3}>
            <Grid w='100%' templateRows='repeat(2, 1fr)' templateColumns='repeat(1, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                {/* TODO: Fix up the placeholder, since selecting it causes issues. */}
                <Select className="form-input" name="targetNo" value={rollData.targetNo} placeholder={'Target Servant'} onChange={() => 1 === 1} mb="8px" >
                  {servantsMap}
                </Select>
              </GridItem>
              <GridItem>
                <Input className="form-input" name="end" type="text" readOnly={true} value={rollData.end} />
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem rowSpan={1} colSpan={2}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(2, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                <FormLabel h="100%" textAlign="right" lineHeight="40px" m="auto">SQ:</FormLabel>
              </GridItem>
              <GridItem colSpan={1} rowSpan={1}>
                <Input className="form-input" name="sq" type="number" onChange={() => 1 === 1} value={rollData.sqSum} />
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem rowSpan={1} colSpan={2}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(2, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                <FormLabel h="100%" textAlign="right" lineHeight="40px" m="auto">Tickets:</FormLabel>
              </GridItem>
              <GridItem colSpan={1} rowSpan={1}>
                <Input className="form-input" name="tx" type="number" onChange={() => 1 === 1} value={rollData.txSum} />
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem rowSpan={1} colSpan={2}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(2, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                <FormLabel h="100%" textAlign="right" lineHeight="40px" m="auto">Rolls:</FormLabel>
              </GridItem>
              <GridItem colSpan={1} rowSpan={1}>
                <Input className="form-input" name="numRolls" type="number" readOnly={true} value={rollData.totalSummons} />
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem rowSpan={1} colSpan={2}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(2, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                <FormLabel h="100%" textAlign="right" lineHeight="40px" m="auto">Rate:</FormLabel>
              </GridItem>
              <GridItem colSpan={1} rowSpan={1}>
                <Input className="form-input" name="numRolls" type="number" readOnly={true} value={rollData.prob} />
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem rowSpan={1} colSpan={3}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(3, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                <FormLabel h="100%" textAlign="right" lineHeight="40px" m="auto">Desired:</FormLabel>
              </GridItem>
              <GridItem colSpan={2} rowSpan={1}>
                <Input className="form-input" name="numDesired" type="number" readOnly={true} value={rollData.desired} />
              </GridItem>
            </Grid>
          </GridItem>

          <GridItem rowSpan={1} colSpan={3}>
            <Grid w='100%' templateRows='repeat(1, 1fr)' templateColumns='repeat(3, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                <FormLabel h="100%" textAlign="right" lineHeight="40px" m="auto">Odds:</FormLabel>
              </GridItem>
              <GridItem colSpan={2} rowSpan={1}>
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
