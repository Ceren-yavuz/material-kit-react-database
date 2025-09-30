import type { SelectChangeEvent } from '@mui/material/Select';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
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

type DatabaseType = 'mongodb' | 'mysql' | '';

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
          <Stack spacing={3}>
            <Typography variant="h6">
              Veritabanı Türü Seçin
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel id="database-type-label">Veritabanı Türü</InputLabel>
              <Select
                labelId="database-type-label"
                id="database-type-select"
                value={selectedDatabase}
                label="Veritabanı Türü"
                onChange={handleDatabaseChange}
              >
                <MenuItem value="mongodb">MongoDB</MenuItem>
                <MenuItem value="mysql">MySQL</MenuItem>
              </Select>
            </FormControl>

            {selectedDatabase && (
              <>
                <Divider />
                <Box sx={{ mt: 3 }}>
                  {selectedDatabase === 'mongodb' && <CreateMongoDatabaseView />}
                  {selectedDatabase === 'mysql' && <CreateMysqlDatabaseView />}
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}