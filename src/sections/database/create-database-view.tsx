import type { SelectChangeEvent } from '@mui/material/Select';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { CreateMongoDatabaseView } from './view/mongo-create-database-view';
import { CreateMysqlDatabaseView } from './view/mysql-create-database-view';
import { CreatePostgreDatabaseView } from './view/postgre-create-database-view';

// ----------------------------------------------------------------------

type DatabaseType = 'mongodb' | 'mysql' | 'postgresql' | '';

export function CreateDatabaseView() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType>('');

  // URL'den type parametresini al
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && (type === 'mongodb' || type === 'mysql' || type === 'postgresql')) {
      setSelectedDatabase(type);
    }
  }, [searchParams]);

  const handleDatabaseChange = useCallback((event: SelectChangeEvent) => {
    setSelectedDatabase(event.target.value as DatabaseType);
  }, []);

  useEffect(() => {
    if (location.state && location.state.defaultType === 'mysql') {
      setSelectedDatabase('mysql');
    } else if (location.state && location.state.defaultType === 'mongodb') {
      setSelectedDatabase('mongodb');
    } else if (location.state && location.state.defaultType === 'postgresql') {
      setSelectedDatabase('postgresql');
    }
  }, [location.state]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Yeni Veritabanı Oluşturun
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Create New Database
            </Typography>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Database Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant={selectedDatabase === 'mongodb' ? 'contained' : 'outlined'}
                onClick={() => setSelectedDatabase('mongodb')}
                sx={{ minWidth: 140 }}
              >
                MongoDB
              </Button>
              <Button
                variant={selectedDatabase === 'mysql' ? 'contained' : 'outlined'}
                onClick={() => setSelectedDatabase('mysql')}
                sx={{ minWidth: 140 }}
              >
                MySQL
              </Button>
              <Button
                variant={selectedDatabase === 'postgresql' ? 'contained' : 'outlined'}
                onClick={() => setSelectedDatabase('postgresql')}
                sx={{ minWidth: 140 }}
              >
                PostgreSQL
              </Button>
            </Box>
          </Box>
          {selectedDatabase && (
            <>
              <Divider />
              <Box sx={{ mt: 3 }}>
                {selectedDatabase === 'mongodb' && <CreateMongoDatabaseView />}
                {selectedDatabase === 'mysql' && <CreateMysqlDatabaseView />}
                {selectedDatabase === 'postgresql' && <CreatePostgreDatabaseView />}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}