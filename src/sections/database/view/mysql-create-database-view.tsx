import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import mysqlService from 'src/services/mysqlService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CreateMysqlDatabaseViewProps {
}

export function CreateMysqlDatabaseView() {
  // MySQL API parameters
  const [mysqlEdition, setMysqlEdition] = useState('');
  const [mysqlVersion, setMysqlVersion] = useState('');
  const [password, setPassword] = useState('');
  const [remoteUser, setRemoteUser] = useState('');
  const [remoteIp, setRemoteIp] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mysqlEdition || !mysqlVersion || !password || !remoteUser || !remoteIp) {
      setError('Please complete all fields');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await mysqlService.createMysqlOperation({
        mysqlEdition,
        mysqlVersion,
        password,
        remoteUser,
        remoteIp,
      });
      console.log('MySQL operation created:', result);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/database?type=mysql';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating MySQL');
      console.error('Error creating MySQL:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMysqlEdition('');
    setMysqlVersion('');
    setPassword('');
    setRemoteUser('');
    setRemoteIp('');
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          MySQL başarıyla oluşturuldu!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              MySQL Configuration
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>MySQL Edition</InputLabel>
              <Select
                value={mysqlEdition}
                onChange={(e) => setMysqlEdition(e.target.value)}
                label="MySQL Edition"
                disabled={loading}
              >
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>MySQL Version</InputLabel>
              <Select
                value={mysqlVersion}
                onChange={(e) => setMysqlVersion(e.target.value)}
                label="MySQL Version"
                disabled={loading}
              >
                <MenuItem value="9.4.0">9.4.0</MenuItem>
                <MenuItem value="8.0.43">8.0.43</MenuItem>
                <MenuItem value="8.4.6">8.4.6</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              placeholder="SSH password"
              disabled={loading}
              helperText="SSH password for MySQL installation"
            />

            <TextField
              label="Remote User"
              value={remoteUser}
              onChange={(e) => setRemoteUser(e.target.value)}
              required
              fullWidth
              placeholder="e.g., ubuntu, root"
              disabled={loading}
              helperText="Remote user for MySQL installation"
            />

            <TextField
              label="Remote IP"
              value={remoteIp}
              onChange={(e) => setRemoteIp(e.target.value)}
              required
              fullWidth
              placeholder="e.g., 192.168.1.100"
              disabled={loading}
              helperText="Remote IP address for MySQL installation"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="eva:arrow-ios-upward-fill" />}
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="mingcute:add-line" />}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create MySQL'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}