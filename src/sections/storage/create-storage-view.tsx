import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import minioService from 'src/services/minioService';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CreateMinioForm {
  ssh_user: string;
  ssh_password: string;
  remote_ip: string;
  createdBy: string;
  license_code: string;
  use_edb: boolean;
}

export function CreateStorageView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateMinioForm>({
    ssh_user: '',
    ssh_password: '',
    remote_ip: '',
    createdBy: 'admin',
    license_code: '',
    use_edb: false,
  });

  const [errors, setErrors] = useState<Partial<CreateMinioForm>>({});

  // Check if we're specifically creating MinIO storage
  const isMinioType = new URLSearchParams(location.search).get('type') === 'minio';

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateMinioForm> = {};

    if (!formData.ssh_user.trim()) {
      newErrors.ssh_user = 'SSH User is required';
    }

    if (!formData.ssh_password.trim()) {
      newErrors.ssh_password = 'SSH Password is required';
    }

    if (!formData.remote_ip.trim()) {
      newErrors.remote_ip = 'Remote IP is required';
    } else {
      // Basic IP validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.remote_ip)) {
        newErrors.remote_ip = 'Please enter a valid IP address';
      }
    }

    if (!formData.createdBy.trim()) {
      newErrors.createdBy = 'Created By is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateMinioForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const createInput = {
        ssh_user: formData.ssh_user,
        ssh_password: formData.ssh_password,
        remote_ip: formData.remote_ip,
        createdBy: formData.createdBy,
        license_code: formData.license_code || undefined,
        use_edb: formData.use_edb,
      };

      const result = await minioService.createMinioStorage(createInput);
      
      if (result.minio) {
        setSuccess(`MinIO storage creation initiated successfully!`);
        setTimeout(() => {
          navigate('/storage');
        }, 2000);
      } else {
        setError('Storage creation failed - no storage data returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating storage');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/storage');
  };

  return (
    <DashboardContent>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Create New MinIO Storage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure a new MinIO object storage instance
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success">
              {success}
            </Alert>
          )}

          <Card sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Typography variant="h6">
                  Storage Configuration
                </Typography>

                <TextField
                  fullWidth
                  label="SSH User"
                  value={formData.ssh_user}
                  onChange={handleInputChange('ssh_user')}
                  error={!!errors.ssh_user}
                  helperText={errors.ssh_user}
                  disabled={loading}
                  required
                />

                <TextField
                  fullWidth
                  label="SSH Password"
                  type="password"
                  value={formData.ssh_password}
                  onChange={handleInputChange('ssh_password')}
                  error={!!errors.ssh_password}
                  helperText={errors.ssh_password}
                  disabled={loading}
                  required
                />

                <TextField
                  fullWidth
                  label="Remote IP Address"
                  value={formData.remote_ip}
                  onChange={handleInputChange('remote_ip')}
                  error={!!errors.remote_ip}
                  helperText={errors.remote_ip || 'IP address of the server where MinIO will be installed'}
                  disabled={loading}
                  required
                />

                <TextField
                  fullWidth
                  label="Created By"
                  value={formData.createdBy}
                  onChange={handleInputChange('createdBy')}
                  error={!!errors.createdBy}
                  helperText={errors.createdBy}
                  disabled={loading}
                  required
                />

                <TextField
                  fullWidth
                  label="License Code (Optional)"
                  value={formData.license_code}
                  onChange={handleInputChange('license_code')}
                  helperText="MinIO enterprise license code (if enterprise version is selected)"
                  disabled={loading || !formData.use_edb}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.use_edb}
                      onChange={handleInputChange('use_edb')}
                      disabled={loading}
                    />
                  }
                  label="Enterprise Version"
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Iconify icon="mingcute:add-line" />
                      )
                    }
                  >
                    {loading ? 'Creating...' : 'Create Storage'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </DashboardContent>
  );
}