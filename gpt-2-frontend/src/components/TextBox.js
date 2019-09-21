import React from 'react';
import { TextField } from '@material-ui/core';

const TextBox = ({ text, setText }) => (
    <TextField
        margin='normal'
        label="Write something..."
        variant="outlined"
        fullWidth
        multiline
        rows='4'
        value={text}
        onChange={e => setText(e.target.value)}
    />
);

export default TextBox;
