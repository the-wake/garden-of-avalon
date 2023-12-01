const dateHelper = (str) => {
  // console.log(str);
  let splitDate = str.split("/");
  const treatedStrs = splitDate.map((subStr) => {
    if (subStr.length === 1) {
      return `0${subStr}`
    } else {
      return subStr;
    };
  });

  const [month, date, year] = treatedStrs;
  // console.log(month, date, year);
  const treatedDate = `${year}-${month}-${date}`;
  // console.log(treatedDate);
  return treatedDate;
};

export default dateHelper;
