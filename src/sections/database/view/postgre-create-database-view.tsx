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

import { postgresService, type CreatePostgresInput } from 'src/services/postgresService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CreatePostgreDatabaseViewProps {
}

export function CreatePostgreDatabaseView() {
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
      console.log('PostgreSQL Database created:', result);
      setSuccess(true);
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
            <TextField
              fullWidth
              label="Remote IP"
              value={remoteIp}
              onChange={(e) => setRemoteIp(e.target.value)}
              placeholder="Server IP adresini girin (örn: 192.168.1.100)"
              required
            />

            <TextField
              fullWidth
              label="SSH User"
              value={sshUser}
              onChange={(e) => setSshUser(e.target.value)}
              placeholder="SSH kullanıcı adını girin"
              required
            />

            <TextField
              fullWidth
              type="password"
              label="SSH Password"
              value={sshPassword}
              onChange={(e) => setSshPassword(e.target.value)}
              placeholder="SSH şifresini girin"
              required
            />

            <FormControl fullWidth>
              <InputLabel>Database Version</InputLabel>
              <Select
                value={dbVersion}
                label="Database Version"
                onChange={(e) => setDbVersion(e.target.value)}
                required
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
                label="PostgreSQL Edition"
                onChange={(e) => setUseEdb(e.target.value === 'edb')}
              >
                <MenuItem value="community">Community (Ücretsiz)</MenuItem>
                <MenuItem value="edb">Enterprise DB (Ücretli)</MenuItem>
              </Select>
            </FormControl>

            {useEdb && (
              <TextField
                fullWidth
                label="License Code"
                value={licenseCode}
                onChange={(e) => setLicenseCode(e.target.value)}
                placeholder="EDB lisans kodunu girin"
              />
            )}

            <TextField
              fullWidth
              label="Created By"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="İsteği yapan kişinin adını girin"
              required
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