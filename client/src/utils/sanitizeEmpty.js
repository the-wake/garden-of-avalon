const sanitizeEmpty = (obj) => {
  Object.entries(obj).forEach(entry => {
    const [key, value] = entry;
    // console.log(key, value);
    if (value === '' || value === null || value === undefined) {
      // console.log(`Sanitizing ${value}`);
      obj[key] = 0;
    };
  });
  // console.log('Sanitized', obj);
  return obj;
};

export default sanitizeEmpty;