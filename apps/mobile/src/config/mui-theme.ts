'use client';

import { createTheme } from '@mui/material';

const MuiTheme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
});

export default MuiTheme;
