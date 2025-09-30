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
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateMysqlDatabaseView({ onSuccess, onCancel }: CreateMysqlDatabaseViewProps) {
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
      setError('Lütfen tüm alanları doldurun');
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
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MySQL oluşturulurken bir hata oluştu');
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
      <Typography variant="h5" sx={{ mb: 3 }}>
        Create MySQL Database
      </Typography>

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
                <MenuItem value="8.0">8.0</MenuItem>
                <MenuItem value="5.7">5.7</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              placeholder="SSH key path or password"
              disabled={loading}
              helperText="SSH key path for MySQL installation"
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
                onClick={onCancel || handleReset}
                disabled={loading}
              >
                {onCancel ? 'Cancel' : 'Reset'}
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