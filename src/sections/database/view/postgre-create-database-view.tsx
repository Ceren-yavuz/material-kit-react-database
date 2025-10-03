import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

import { postgresService, type CreatePostgresInput } from 'src/services/postgresService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CreatePostgreDatabaseViewProps {
}

export function CreatePostgreDatabaseView() {
  const navigate = useNavigate();
  
  // PostgreSQL API parameters (bizim backend için doğru field'lar)
  const [remoteIp, setRemoteIp] = useState('');
  const [sshUser, setSshUser] = useState('');
  const [sshPassword, setSshPassword] = useState('');
  const [dbVersion, setDbVersion] = useState('');
  const [useEdb, setUseEdb] = useState(false);
  const [licenseCode, setLicenseCode] = useState('');
  const [createdBy, setCreatedBy] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!remoteIp || !sshUser || !sshPassword || !dbVersion || !createdBy) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      const input: CreatePostgresInput = {
        remote_ip: remoteIp,
        ssh_user: sshUser,
        ssh_password: sshPassword,
        dbVersion: dbVersion,
        use_edb: useEdb,
        license_code: useEdb ? licenseCode : '123', // Community version için 123
        createdBy: createdBy,
      };
      
      const result = await postgresService.createPostgres(input);
      console.log('PostgreSQL operation created:', result);
      setSuccess(true);
      setTimeout(() => {
        navigate('/database?type=postgresql');
      }, 2000);
      // Reset form
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veritabanı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRemoteIp('');
    setSshUser('');
    setSshPassword('');
    setDbVersion('');
    setUseEdb(false);
    setLicenseCode('');
    setCreatedBy('');
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          PostgreSQL başarıyla oluşturuldu! Veritabanı listesine yönlendiriliyorsunuz...
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
              PostgreSQL Configuration
            </Typography>
            <TextField
              label="Remote IP"
              value={remoteIp}
              onChange={(e) => setRemoteIp(e.target.value)}
              required
              fullWidth
              placeholder="e.g., 192.168.1.100"
              disabled={loading}
              helperText="Remote IP address for PostgreSQL installation"
            />

            <TextField
              label="SSH User"
              value={sshUser}
              onChange={(e) => setSshUser(e.target.value)}
              required
              fullWidth
              placeholder="e.g., ubuntu, root"
              disabled={loading}
              helperText="SSH user for PostgreSQL installation"
            />

            <TextField
              label="SSH Password"
              type="password"
              value={sshPassword}
              onChange={(e) => setSshPassword(e.target.value)}
              required
              fullWidth
              placeholder="SSH password"
              disabled={loading}
              helperText="SSH password for PostgreSQL installation"
            />

            <FormControl fullWidth required>
              <InputLabel>PostgreSQL Version</InputLabel>
              <Select
                value={dbVersion}
                onChange={(e) => setDbVersion(e.target.value)}
                label="PostgreSQL Version"
                disabled={loading}
              >
                <MenuItem value="16">PostgreSQL 16</MenuItem>
                <MenuItem value="15">PostgreSQL 15</MenuItem>
                <MenuItem value="14">PostgreSQL 14</MenuItem>
                <MenuItem value="13">PostgreSQL 13</MenuItem>
                <MenuItem value="12">PostgreSQL 12</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>PostgreSQL Edition</InputLabel>
              <Select
                value={useEdb ? 'edb' : 'community'}
                onChange={(e) => setUseEdb(e.target.value === 'edb')}
                label="PostgreSQL Edition"
                disabled={loading}
              >
                <MenuItem value="community">Community (Free)</MenuItem>
                <MenuItem value="edb">Enterprise DB (Paid)</MenuItem>
              </Select>
            </FormControl>

            {useEdb && (
              <TextField
                label="License Code"
                value={licenseCode}
                onChange={(e) => setLicenseCode(e.target.value)}
                fullWidth
                placeholder="Enter EDB license code"
                disabled={loading}
                helperText="Required for Enterprise DB edition"
              />
            )}

            <TextField
              label="Created By"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              required
              fullWidth
              placeholder="Enter your name"
              disabled={loading}
              helperText="Name of the person making this request"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
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
    </>
  );
}