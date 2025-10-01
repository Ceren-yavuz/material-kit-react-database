import type { SelectChangeEvent } from '@mui/material/Select';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';

import { CreateMongoDatabaseView } from './view/mongo-create-database-view';
import { CreateMysqlDatabaseView } from './view/mysql-create-database-view';

// ----------------------------------------------------------------------

type DatabaseType = 'mongodb' | 'mysql' | 'postgresql' | '';

export function CreateDatabaseView() {
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType>('');

  const handleDatabaseChange = useCallback((event: SelectChangeEvent) => {
    setSelectedDatabase(event.target.value as DatabaseType);
  }, []);

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
                {selectedDatabase === 'postgresql' && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    PostgreSQL desteği yakında eklenecek!
                  </Typography>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}