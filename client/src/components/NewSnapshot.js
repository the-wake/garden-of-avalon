import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Flex, Heading, FormControl, FormLabel } from '@chakra-ui/react';
import getSlot from '../utils/getSlot.js';
import dateHelper from '../utils/dateHelper.js'

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'

const NewSnapshot = ({ savedRolls, setSavedRolls }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);

  const [bannerData, setBannerData] = useState({
    end: dateHelper(new Date().toLocaleDateString()),
    targetNo: '',
    targetName: '',
    targetImage: 'https://static.atlasacademy.io/JP/Faces/f_8001000.png'
  });

  const style = {
    backgroundColor: '#8888BB',
    borderRadius: '6px',
    minHeight: '123px',
    textAlign: 'center',
    display: 'flex',
    paddingTop: '4px',
    paddingBottom: '7px',
    margin: '12px',
  };

  const rollUpdateHandler = (e) => setBannerData({ ...bannerData, [e.target.name]: e.target.value });

  // useEffect(() => {
  //   console.log(bannerData);
  // }, [bannerData]);

  // TODO: Could add Servant Selection to this as well, but that would make more sense if we refactor this list into a store.

  const newRollHandler = () => {

    const newRoll = {
      start: dateHelper(new Date().toLocaleDateString()),
      end: bannerData.end,
      sqPurchase: "",
      purchasePeriod: 0,
      alreadyPurchased: false,
      sqStarting: "",
      txStarting: "",
      sqIncome: "",
      txIncome: "",
      sqEvent: "",
      txEvent: "",
      sqExtra: "",
      txExtra: "",
      sqMinus: "",
      txMinus: "",
      dailySingles: "",
      sqSum: 0,
      txSum: 0,
      totalSummons: 0,
      targetNo: bannerData.targetNo,
      targetName: "",
      targetImage: "https://static.atlasacademy.io/JP/Faces/f_8001000.png",
      rarity: "ssr",
      numRateup: 1,
      prob: 0.008,
      desired: 1,
      summonOdds: "0.00%",
      summonNotes: "",
      slot: getSlot(),
      priority: 0,
      draft: true
    };

    setSavedRolls([...savedRolls, newRoll]);
  };

  return (
    <div style={style} >
      <Flex direction="column" align="center" justify="space-evenly" pr="6px" width="100%" cursor="pointer" onClick={onOpen} >
        <Heading as="h3" size="md" >New Blank Snapshot</Heading>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save a New Snapshot</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl onChange={rollUpdateHandler}>
              <Flex flexDirection="row" gap={4}>
                <FormLabel>End Date</FormLabel>
                <Input name="end" type="date" value={bannerData.end} />
              </Flex>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={() => {
              onClose();
              setBannerData({ ...bannerData, end: dateHelper(new Date().toLocaleDateString()) });
            }}>Cancel</Button>
            <Button colorScheme="blue" ref={initialRef}
              onClick={() => {
                newRollHandler();
                setBannerData({ ...bannerData, end: dateHelper(new Date().toLocaleDateString()) });
                onClose();
              }}
            >Save Snapshot</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div >
  );
};

export default NewSnapshot;
