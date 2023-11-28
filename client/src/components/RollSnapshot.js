import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import sanitizeEmpty from '../utils/sanitizeEmpty.js'

import { useSelector, useDispatch } from 'react-redux'

import { Heading, Grid, GridItem, Flex, Spacer, Tooltip, Textarea } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox, IconButton, Box } from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'

import { EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon, ArrowBackIcon } from '@chakra-ui/icons'

import "react-datepicker/dist/react-datepicker.css";

const RollSnapshot = ({ rollObj, savedRolls, setSavedRolls, setDateData, setCurrency, summonStats, setSummonStats, setSums, editState, setEditState, rollIndex, noteChangeHandler, noteSubmitHandler }) => {

  const servantData = useSelector((state) => state.servants.roster);
  const { isOpen, onOpen, onClose } = useDisclosure();

  let initRoll = rollObj;
  // console.log(`Rendering component:`, initRoll);

  const [rollData, setRollData] = useState(initRoll);

  const [editingDates, setEditingDates] = useState(false);

  const [editStyle, setEditStyle] = useState(false);

  const [noteOverride, setNoteOverride] = useState({ slot: 0, summonNotes: "" });

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
      // console.log(`Finding Servant ID ${collectionNo}`);
      const targetIndex = servantData.findIndex(servant => servant.collectionNo == collectionNo);
      const targetServant = servantData[targetIndex];
      // console.log(targetServant.name, targetServant.face);
      const targetName = servantData[targetIndex].name;
      const targetImage = servantData[targetIndex].face;
      setRollData({
        ...rollData,
        targetNo: collectionNo,
        targetName,
        targetImage,
      });
      // Changing end date on drafts was giving problems so trying some exception handling for it.
    } else if (e.target.name !== 'end') {
      setRollData({ ...rollData, [e.target.name]: e.target.value });
    }
  };

  // This runs on blur to avoid running afoul of the weird date elements in Chakra.
  const dateChangeHandler = (e) => {
    setRollData({ ...rollData, [e.target.name]: e.target.value })
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
  const confirmEdit = (message) => {
    console.log(message);
    
    let str = 'Load roll into the editing form?'
    
    if (message === true) {
      str += ' (You can edit dates from the editor.)';
    }; 
    
    if (window.confirm(str)) {
      console.log('Editing roll:', rollData);
      let newRoll = {};

      const { sqPurchase, purchasePeriod, alreadyPurchased, sqStarting, txStarting, sqIncome, txIncome, sqEvent, txEvent, sqExtra, txExtra, sqMinus, txMinus, dailySingles } = rollData;
      newRoll.currency = { sqPurchase, purchasePeriod, alreadyPurchased, sqStarting, txStarting, sqIncome, txIncome, sqEvent, txEvent, sqExtra, txExtra, sqMinus, txMinus, dailySingles };

      const { start, end } = rollData;
      newRoll.dateData = { start, end };

      const { sqSum, txSum, totalSummons } = rollData;
      newRoll.sums = { sqSum, txSum, totalSummons };

      const { targetNo, targetName, targetImage, rarity, numRateup, prob, desired, summonOdds, summonNotes, slot } = rollData;
      newRoll.summonStats = { targetNo, targetName, targetImage, rarity, numRateup, prob, desired, summonOdds, summonNotes, slot };

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
      setSummonStats({ ...summonStats, summonNotes: '' });
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

  const welfareServants = [1, 4, 61, 69, 73, 92, 111, 115, 133, 137, 138, 141, 162, 166, 174, 182, 190, 191, 197, 208, 211, 219, 225, 233, 243, 252, 264, 271, 283, 288, 301, 304, 308, 315, 320, 326, 328, 330, 338, 359, 360, 361, 364, 367, 376, 389];

  // Used by following map to give individual names to each Servant where there are duplicates.
  let servantsSoFar = [];

  const mapServant = (servant) => {
    if (servant.rarity < 3 || welfareServants.includes(servant.collectionNo) || servant.type === 'enemyCollectionDetail') {
      return false;
    };
  };

  // Need to clone servantData here to avoid errors.
  const servantsMap = [...servantData].sort((a, b) => (a.name > b.name) ? 1 : -1).map((servant, pos) => {
    // Call function to check if target is gacha Servant.
    if (mapServant(servant) === false) {
      return;
    };

    let useName = servant.name;

    if (servantsSoFar.includes(servant.name) || servant.name === 'Mélusine') {
      const appendClass = `${servant.className.charAt(0).toUpperCase()}${servant.className.slice(1)}`;
      const appendedName = `${servant.name} (${appendClass})`;
      // console.log(`Servant name ${servant.name} already in array. Appending name to ${appendedName}`);
      servantsSoFar.push(appendedName);
      useName = appendedName;
    }
    else {
      // console.log(`Pushing ${servant.name} to array so far.`);
      servantsSoFar.push(servant.name);
    };

    return (
      <option key={pos} value={servant.collectionNo}>{useName}</option>
    );
  });

  const targetServantHandler = (e) => {
    setRollData({ ...rollData, targetNo: e.target.value });
  };

  const noteGetter = (roll) => {
    console.log(roll.summonNotes);
    setNoteOverride({ slot: roll.slot, summonNotes: roll.summonNotes });
  };

  const overrideChangeHandler = (e) => {
    setNoteOverride({ ...noteOverride, summonNotes: e.target.value });
  };

  const dateClickHandler = () => {
    if (rollData.draft === true) {
      return;
    } else {
      confirmEdit(true);
    };
  };

  const overrideSubmitHandler = () => {
    // console.log(editState);
    const currentRoll = savedRolls[noteOverride.slot];
    const updatedRoll = { ...currentRoll, summonNotes: noteOverride.summonNotes };
    console.log(updatedRoll);

    const updatedRolls = savedRolls.map((roll, pos) => {
      console.log(roll);
      if (roll.slot === noteOverride.slot) {
        return updatedRoll;
      } else {
        return roll;
      }
    });
    // console.log(updatedRolls);
    setSavedRolls(updatedRolls);
  };

  return (
    <div style={editState === rollData.slot ? cardStyles.editing : cardStyles.normal}>
      <Flex direction='column' align='center' justify='space-between' pr='6px' gap={1}>
        <IconButton ml='4px' size='sm' aria-label='Move item up' name='moveUpIcon' isDisabled={rollData.slot === 0 || editState !== false} onClick={() => { moveSnapshot('up') }} icon={<ArrowUpIcon name='moveUp' />} />
        <IconButton ml='4px' size='sm' aria-label='Move item down' name='moveDownIcon' isDisabled={rollData.slot === savedRolls.length - 1 || editState !== false} onClick={() => { moveSnapshot('down') }} icon={<ArrowDownIcon name='moveDown' />} />
        <IconButton ml='4px' size='sm' aria-label='Edit item' icon={<ArrowBackIcon />} isDisabled={editState !== false} onClick={confirmEdit} />
      </Flex>
      <Grid w='80px' h='80px' templateRows='repeat(4, 1fr)' templateColumns='repeat(1, 1fr)' gap={0.5}>
        <GridItem rowSpan={3} colSpan={1} w='80px' h='80px'>
          <Box as="img" src={rollData.targetImage} style={style.image} borderRadius="6px" />
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <Flex gap={1} justifyContent='space-evenly'>
            <IconButton ml='4px' size='sm' aria-label='See notes' value={rollData} onClick={() => {
              noteGetter(rollData);
              onOpen();
            }} icon={<EditIcon />} />
            <IconButton mr='4px' size='sm' aria-label='Delete item' icon={<DeleteIcon />} onClick={confirmDelete} />
          </Flex>
        </GridItem>
      </Grid>
      <FormControl marginLeft="auto" marginRight="auto" onChange={handleFormUpdate}>
        <Grid w='100%' gridAutoFlow="column" templateRows='repeat(2, 1fr)' templateColumns='repeat(10, 1fr)' p="6px" gap={1}>

          <GridItem rowSpan={2} colSpan={3}>
            <Grid w='100%' templateRows='repeat(2, 1fr)' templateColumns='repeat(1, 1fr)' gap={1}>
              <GridItem colSpan={1} rowSpan={1}>
                {/* TODO: Fix up the placeholder, since selecting it causes issues. */}
                <Select className="form-input" name="targetNo" value={rollData.targetNo} placeholder={'Target Servant'} onChange={targetServantHandler} mb="8px" >
                  {servantsMap}
                </Select>
              </GridItem>
              <GridItem>
                <Input name="end" type="date" isReadOnly={rollData.draft !== true} defaultValue={rollData.end} onBlur={dateChangeHandler} />
              </GridItem>
            </Grid>
          </GridItem>

          {
            rollData.draft === true
              ? <GridItem rowSpan={2} colSpan={7} cursor="pointer" onClick={confirmEdit}>
                <Flex flexDirection="row" justifyContent="space-evenly" height="100%">
                  <Heading as="h3" size="md" textAlign='center' margin='auto'>Load Draft Into Editor</Heading>
                </Flex>
              </GridItem>
              : <>
                <GridItem rowSpan={1} colSpan={2}>
                  <Grid w="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap={1}>
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
              </>
          }
        </Grid >
      </FormControl>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea h='250px' name='summonNotes' value={noteOverride.summonNotes} onChange={overrideChangeHandler}></Textarea>
          </ModalBody>

          <ModalFooter>
            {/* <Button mr={3} variant="ghost" onClick={onClose}>Cancel</Button> */}
            <Button colorScheme="blue"
              onClick={() => {
                overrideSubmitHandler();
                onClose();
              }}
            >Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div >
  );
};

export default RollSnapshot;
