import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';

import mongoService from 'src/services/mongoService';
import mysqlService from 'src/services/mysqlService';
import { postgresService } from 'src/services/postgresService';

type DatabaseType = 'mongodb' | 'mysql' | 'postgresql' | '';

type DbItem = {
  uuid: string;
  name?: string;
  password?: string;
  remoteUser?: string;
  remoteIp?: string;
};

export function DestroyDatabaseView() {
  const [selectedDatabaseType, setSelectedDatabaseType] = useState<DatabaseType>('');
  const [selectedDb, setSelectedDb] = useState<DbItem | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbList, setDbList] = useState<DbItem[]>([]);
  const [fetching, setFetching] = useState(false);

  // Silme işlemi dummy
  const handleDestroy = async () => {
    if (!selectedDb) {
      setError('Please select a database');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (selectedDatabaseType === 'mongodb') {
        await mongoService.removeMongoOperation({ uuid: selectedDb.uuid });
      } else if (selectedDatabaseType === 'mysql') {
        await mysqlService.removeMysqlOperation({ uuid: selectedDb.uuid });
      } else if (selectedDatabaseType === 'postgresql') {
        await postgresService.removePostgreOperation({ uuid: selectedDb.uuid });
      }
      setSuccess(true);
    } catch (err) {
      setError('An error occurred while deleting the database');
    } finally {
      setLoading(false);
    }
  };

  // Seçim değişince db seçimini sıfırla
  const handleTypeChange = (type: DatabaseType) => {
    setSelectedDatabaseType(type);
    setSelectedDb(null);
    setSuccess(false);
    setError(null);
  };

  // Veritabanı listelerini çek
  useEffect(() => {
    async function fetchDatabases() {
      setFetching(true);
      setDbList([]);
      setSelectedDb(null);
      try {
        if (selectedDatabaseType === 'mongodb') {
          const result = await mongoService.getAllMongoOperations();
          setDbList(result.filter(db => !db.isDeleted).map(db => ({
            uuid: db.uuid,
            name: db.name,
            password: db.password,
            remoteUser: db.remoteUser,
            remoteIp: db.remoteIp,
          })));
        } else if (selectedDatabaseType === 'mysql') {
          const result = await mysqlService.getAllMysqlOperations();
          setDbList(result.filter(db => !db.isDeleted).map(db => ({
            uuid: db.uuid,
            name: db.name,
            password: db.password,
            remoteUser: db.remoteUser,
            remoteIp: db.remoteIp,
          })));
        } else if (selectedDatabaseType === 'postgresql') {
          const result = await postgresService.getAllPostgreOperations();
          setDbList(result.filter((db: any) => !db.isDeleted).map((db: any) => ({
            uuid: db.uuid,
            name: db.name,
            password: db.password,
            remoteUser: db.remoteUser,
            remoteIp: db.remoteIp,
          })));
        }
      } catch (err) {
        setError('An error occurred while fetching the database list');
      } finally {
        setFetching(false);
      }
    }
    if (selectedDatabaseType) {
      fetchDatabases();
    }
  }, [selectedDatabaseType]);

  // Render editing area
  const renderDestroyForm = () => {
    let label = '';
    if (selectedDatabaseType === 'mongodb') {
      label = 'MongoDB Database';
    } else if (selectedDatabaseType === 'mysql') {
      label = 'MySQL Database';
    } else if (selectedDatabaseType === 'postgresql') {
      label = 'PostgreSQL Database';
    }
    if (!selectedDatabaseType) return null;
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {label} Silme
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Database</InputLabel>
            <Select
              value={selectedDb?.uuid || ''}
              label="Select Database"
              onChange={e => {
                const db = dbList.find(item => item.uuid === e.target.value);
                setSelectedDb(db || null);
              }}
              disabled={loading || fetching}
            >
              {dbList.length === 0 && !fetching && (
                <MenuItem value="" disabled>
                  No registered database
                </MenuItem>
              )}
              {dbList.map(db => (
                <MenuItem key={db.uuid} value={db.uuid}>{db.name || db.uuid}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="error"
            disabled={loading || !selectedDb}
            onClick={handleDestroy}
          >
            {loading ? 'Deleting...' : 'Delete Database'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Veritabanı Silme İşlemi
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Destroy Database
            </Typography>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Database Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant={selectedDatabaseType === 'mongodb' ? 'contained' : 'outlined'}
                onClick={() => handleTypeChange('mongodb')}
                sx={{ minWidth: 140 }}
              >
                MongoDB
              </Button>
              <Button
                variant={selectedDatabaseType === 'mysql' ? 'contained' : 'outlined'}
                onClick={() => handleTypeChange('mysql')}
                sx={{ minWidth: 140 }}
              >
                MySQL
              </Button>
              <Button
                variant={selectedDatabaseType === 'postgresql' ? 'contained' : 'outlined'}
                onClick={() => handleTypeChange('postgresql')}
                sx={{ minWidth: 140 }}
              >
                PostgreSQL
              </Button>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You can permanently delete a database from here. Please be careful!
          </Typography>
          <Divider sx={{ my: 2 }} />
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Database deleted successfully!
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {renderDestroyForm()}
        </CardContent>
      </Card>
    </Container>
  );
}
