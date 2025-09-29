import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CreateDatabaseView() {
  const [databaseName, setDatabaseName] = useState('');
  const [databaseType, setDatabaseType] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle database creation logic here
    console.log('Creating database:', { databaseName, databaseType });
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Create New Database
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Database Name"
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              required
              fullWidth
              placeholder="Enter database name"
            />

            <FormControl fullWidth required>
              <InputLabel>Database Type</InputLabel>
              <Select
                value={databaseType}
                onChange={(e) => setDatabaseType(e.target.value)}
                label="Database Type"
              >
                <MenuItem value="MySQL">MySQL</MenuItem>
                <MenuItem value="PostgreSQL">PostgreSQL</MenuItem>
                <MenuItem value="MongoDB">MongoDB</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              multiline
              rows={4}
              placeholder="Enter database description (optional)"
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="eva:arrow-ios-upward-fill" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Create Database
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </DashboardContent>
  );
}