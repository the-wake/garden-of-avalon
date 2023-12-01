const periodic = {
  weeklyLogin: [
    {
      type: 'fp',
      val: 2000
    },
    {
      type: 'sq',
      val: 1
    },
    {
      type: 'xp',
      val: 1
    },
    {
      type: 'sq',
      val: 1
    },
    {
      type: 'xp',
      val: 2
    },
    {
      type: 'sq',
      val: 2
    },
    {
      type: 'tx',
      val: 1
    },
  ],
  fullWeek: {
    sq: 4,
    tx: 1
  },
  totalLogin: {
    sq: 30
  },
  shop: {
    tx: 5
  },
};


const oddsObj = {
  ssr: [0.008, 0.004],
  sr: [0.015, 0.012, 0.007, 0.007, 0.005],
  r: [0.04],
};

export { periodic, oddsObj };
