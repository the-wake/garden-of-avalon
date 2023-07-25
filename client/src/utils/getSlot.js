// TODO: Could refactor this to re-arrange by target date as well.
const getSlot = () => {
  const savedRolls = JSON.parse(localStorage.getItem('saved-rolls')) || [];
  const slot = savedRolls.length;
  console.log(`Assigning slot`, slot);
  return slot;
};

export default getSlot;