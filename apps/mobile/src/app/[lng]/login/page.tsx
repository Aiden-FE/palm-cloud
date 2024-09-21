'use client';

import { TextField } from '@mui/material';
import Box from '@mui/material/box';

export default function Login() {
  return (
    <div className="w-full h-full p-4">
      <Box component="form" autoComplete="off">
        <TextField fullWidth required label="Email" />
        <TextField fullWidth required label="Password" type="password" />
      </Box>
    </div>
  );
}
