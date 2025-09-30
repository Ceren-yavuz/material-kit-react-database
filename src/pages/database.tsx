// src/pages/database.tsx
import { CONFIG } from 'src/config-global';

import { DatabaseView } from 'src/sections/database/database-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Database - ${CONFIG.appName}`}</title>

      <DatabaseView />
    </>
  );
}
