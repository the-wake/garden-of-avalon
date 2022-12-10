import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const Servant = () => {

  const { id } = useParams();
  // Look at the context and use the id param to get the Servant's data from there.

  return (
    <>
      <p>Servant page for Servant ID {id}.</p>
    </>
  )
};

export default Servant;
