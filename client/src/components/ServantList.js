import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addServant, removeServant } from '../features/servant/servantSlice.js';

import { Button, Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider, FormControl, FormLabel, FormErrorMessage, FormHelperText, Input, Switch } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Downshift from 'downshift';
import './ServantList.css';

// To reduce burden, should store this as a context so it can just load on initialization.
import servantDataNA from '../servantDataNA.json';
import servantDataJP from '../servantDataJP.json';
import classList from '../utils/classList.js';

const ServantList = () => {

  // Access roster from Redux store.
  const roster = useSelector((state) => state.servants.roster);
  const dispatch = useDispatch();

  const [region, setRegion] = useState('NA');
  const [servantData, setServantData] = useState(servantDataNA);
  const [filterState, setFilterState] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Need something here that actually works to append class or some other identifier for duplicate names.
  const servantNamesNA = servantDataNA.map((servant) => {
    // if (servantDataNA.includes(servant.name)) {
    return servant.name;
    // } else {
    //   return `${servant.name} - ${servant.className}`;
    // };
  });

  // const servantNamesNA = servantData.forEach(servant => {
  //   if (servantNamesNA.includes(servant.name)) {
  //     return servant.name;
  //   } else {
  //     return `${servant.name} - ${servant.className}`;
  //   };
  // });


  // console.log(servantNamesNA);

  const servantNamesJP = servantDataJP.map((servant) => {
    return servant.name;
  });

  // useEffect(() => {
  //   console.log(roster);
  // }, [roster]);

  // console.log(servantNamesNA);
  // console.log(servantNamesJP);

  let servants = servantData

  servants.sort((a, b) => {
    let noA = a.collectionNo;
    let noB = b.collectionNo;

    if (noA < noB) {
      return -1;
    }
    if (noA > noB) {
      return 1;
    }
    return 0;
  });

  let servantList = servants.filter(servant => {
    return servant.className === filterState;
  });

  if (filterState === '') {
    servantList = servants;
  };

  // const handleFilterUpdate = () => {
  //   console.log('Stuff happen');
  // };

  // console.log(servants)

  const handleRegionChange = () => {
    if (region === 'NA') {
      setRegion('JP');
      setServantData(servantDataJP)
    } else {
      setRegion('NA');
      setServantData(servantDataNA)
    }
  };

  const handleClassChange = (event) => {
    const selection = event.target;
    setClassFilter(selection.name);
    console.log(`Selected ${selection.name}`);
    console.log(classFilter);
  };

  const saveServantData = () => {
    localStorage.setItem('servant-data', JSON.stringify(servantData[0]));
  };

  // let servantSelectArr = [];

  // const setServantList = () => {
  //   servants.forEach((servant) => {
  //     if (!servantSelectArr.includes({ value: servant.name })) {
  //       servantSelectArr.push({ value: servant.name });
  //     };
  //   });
  //   console.log(servantSelectArr)
  // };

  // setServantList();


  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}>
          {classFilter === ''
            ? 'Select Class'
            : classFilter
          }
        </MenuButton>
        <MenuList>
          {classList.map((cls, pos) => (
            cls !== 'Shielder'
              ? <MenuItem
                name={cls}
                key={pos}
                onClick={handleClassChange}
              >
                {cls}
              </MenuItem>
              : null
          ))}
        </MenuList>
      </Menu>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}>
          Select Servant
        </MenuButton>
        <MenuList>
          {servantList.map((servant, pos) => (
            servant.className === classFilter.toLowerCase()
              ? <MenuItem
                name={servant.id}
                key={pos}
              >
                {servant.name}
              </MenuItem>
              : null
          ))}
        </MenuList>
      </Menu>
      {/* <Form>
        <div className="mb-3">
          {classList.map((cls) => (
            <Form.Check
              key={`inline-${cls}`}
              inline
              label={cls}
              name='group1'
              type='checkbox'
              id={`${cls}-checkbox`}
            />
          ))}
        </div>
      </Form> */}
      {/* <p>Roster: {roster.map((servant) => servant.name)}
        </p> */}
      {/* <Form id="region-select">
        <Form.Check
          type="switch"
          id="custom-switch"
          label={`Region: ${region}`}
          onChange={handleRegionChange}
        />
      </Form> */}
      {/* <label className="inline-flex relative items-center cursor-pointer">
        <input type="checkbox" value="" className="sr-only peer" onChange={handleRegionChange} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Current Region: {region}</span>
      </label> */}
      {/* <DropdownButton id="dropdown-basic-button" title="Dropdown button" align="lg:start">
        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
      </DropdownButton> */}
      {/* {servantList.map((servant, pos) => (
        <>
          <Link to={`/servants/${servant.collectionNo}`} key={pos}>{servant.name} — ID {servant.collectionNo}</Link>
          <Button onClick={() => dispatch(addServant(servant))}>Add</Button>
        </>
      ))}; */}
    </>
  )
};

export default ServantList;
