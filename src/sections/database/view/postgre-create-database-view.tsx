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

import postgreService from 'src/services/postgreService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CreatePostgreDatabaseViewProps {
}

export function CreatePostgreDatabaseView() {
  // PostgreSQL API parameters
  const [postgreEdition, setPostgreEdition] = useState('');
  const [postgreVersion, setPostgreVersion] = useState('');
  const [password, setPassword] = useState('');
  const [remoteUser, setRemoteUser] = useState('');
  const [remoteIp, setRemoteIp] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!postgreEdition || !postgreVersion || !password || !remoteUser || !remoteIp) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await postgreService.createPostgreOperation({
        postgreEdition,
        postgreVersion,
        password,
        remoteUser,
        remoteIp,
      });
      console.log('PostgreSQL Database created:', result);
      setSuccess(true);
      // Reset form
      setPostgreEdition('');
      setPostgreVersion('');
      setPassword('');
      setRemoteUser('');
      setRemoteIp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veritabanı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPostgreEdition('');
    setPostgreVersion('');
    setPassword('');
    setRemoteUser('');
    setRemoteIp('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Create New PostgreSQL Database
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          PostgreSQL veritabanı başarıyla oluşturuldu!
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>PostgreSQL Edition</InputLabel>
              <Select
                value={postgreEdition}
                label="PostgreSQL Edition"
                onChange={(e) => setPostgreEdition(e.target.value)}
              >
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>PostgreSQL Version</InputLabel>
              <Select
                value={postgreVersion}
                label="PostgreSQL Version"
                onChange={(e) => setPostgreVersion(e.target.value)}
              >
                <MenuItem value="16.0">16.0</MenuItem>
                <MenuItem value="15.4">15.4</MenuItem>
                <MenuItem value="14.9">14.9</MenuItem>
                <MenuItem value="13.12">13.12</MenuItem>
                <MenuItem value="12.16">12.16</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PostgreSQL root şifresini girin"
            />

            <TextField
              fullWidth
              label="Remote User"
              value={remoteUser}
              onChange={(e) => setRemoteUser(e.target.value)}
              placeholder="Uzak bağlantı kullanıcı adını girin"
            />

            <TextField
              fullWidth
              label="Remote IP"
              value={remoteIp}
              onChange={(e) => setRemoteIp(e.target.value)}
              placeholder="Uzak IP adresini girin (örn: 192.168.1.100)"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="mingcute:add-line" />}
              >
                {loading ? 'Creating...' : 'Create PostgreSQL Database'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}