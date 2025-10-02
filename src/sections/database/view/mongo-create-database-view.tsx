import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import mongoService from 'src/services/mongoService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CreateMongoDatabaseView() {
  const navigate = useNavigate();
  
  
  // MongoDB API parameters
  const [mongoEdition, setMongoEdition] = useState('');
  const [mongoVersion, setMongoVersion] = useState('');
  const [password, setPassword] = useState('');
  const [remoteUser, setRemoteUser] = useState('');
  const [remoteIp, setRemoteIp] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mongoEdition || !mongoVersion || !password || !remoteUser || !remoteIp) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await mongoService.createMongoOperation({
        mongoEdition,
        mongoVersion,
        password,
        remoteUser,
        remoteIp,
      });
      console.log('MongoDB operation created:', result);
      setSuccess(true);
      setTimeout(() => {
        navigate('/database');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veritabanı oluşturulurken bir hata oluştu');
      console.error('Error creating database:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          MongoDB başarıyla oluşturuldu! Veritabanı listesine yönlendiriliyorsunuz...
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
              MongoDB Configuration
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>MongoDB Edition</InputLabel>
              <Select
                value={mongoEdition}
                onChange={(e) => setMongoEdition(e.target.value)}
                label="MongoDB Edition"
                disabled={loading}
              >
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>MongoDB Version</InputLabel>
              <Select
                value={mongoVersion}
                onChange={(e) => setMongoVersion(e.target.value)}
                label="MongoDB Version"
                disabled={loading}
              >
                <MenuItem value="8.0">8.0</MenuItem>
                <MenuItem value="7.0">7.0</MenuItem>
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
              helperText="SSH password for MongoDB installation"
            />

            <TextField
              label="Remote User"
              value={remoteUser}
              onChange={(e) => setRemoteUser(e.target.value)}
              required
              fullWidth
              placeholder="e.g., ubuntu, root"
              disabled={loading}
              helperText="Remote user for MongoDB installation"
            />

            <TextField
              label="Remote IP"
              value={remoteIp}
              onChange={(e) => setRemoteIp(e.target.value)}
              required
              fullWidth
              placeholder="e.g., 192.168.1.100"
              disabled={loading}
              helperText="Remote IP address for MongoDB installation"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="eva:arrow-ios-upward-fill" />}
                onClick={() => navigate('/database')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="mingcute:add-line" />}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create MongoDB'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}