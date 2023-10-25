const dateHelper = (str) => {
  let splitDate = str.split("/");
  const [month, date, year] = splitDate;
  // console.log(month, date, year);
  const treatedDate = `${year}-${month}-${date}`;
  // console.log(treatedDate);
  return treatedDate;
};

export default dateHelper;
