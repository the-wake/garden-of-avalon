import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel, Input, Button, Select, Checkbox } from '@chakra-ui/react'
import DatePicker from "react-datepicker";
import Statistics from "statistics.js";

import "react-datepicker/dist/react-datepicker.css";

const RollSnapshot = () => {
  const style = {
    card: {
      backgroundColor: '#8888BB',
      borderRadius: '6px',
      minHeight: '80px',
      textAlign: 'left',
      display: 'flex'
    },
    header: {
      padding: '8px 12px 0 12px'
    },
    image: {
      width: '80px',
      height: '80px'
    }
  };

  return (
    <div style={style.card}>
      <img src='https://grandorder.wiki/images/d/d5/Icon_Servant_150.png' style={style.image} />
      <Grid templateRows="repeat(1, fr)" templateColumns="repeat(11, 1fr)">
        <GridItem rowSpan={1} colSpan={3}>
          <h4 style={style.header}>Name Prop</h4>
          <h5 style={style.header}>Date Prop</h5>
        </GridItem>
        <GridItem rowSpan={1} colSpan={4}>
          Some Prop
        </GridItem>
        <GridItem rowSpan={1} colSpan={4}>
          Some Prop
        </GridItem>
      </Grid >
    </div>
  )
};

export default RollSnapshot;
