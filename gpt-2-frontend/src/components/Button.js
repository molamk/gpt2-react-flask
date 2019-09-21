import { Button as MaterialButton } from '@material-ui/core';
import React from 'react';


const Button = ({ onClick }) => (
    <MaterialButton
        style={{ marginTop: '1em', width: 'fit-content' }}
        onClick={onClick}
        variant="outlined"
        color="primary">
        Generate
  </MaterialButton>
)

export default Button;