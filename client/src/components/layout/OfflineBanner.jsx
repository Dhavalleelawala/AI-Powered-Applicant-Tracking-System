import { Alert, Slide } from '@mui/material';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <Slide direction="down" in={!online} mountOnEnter unmountOnExit>
      <Alert
        severity="warning"
        sx={{
          borderRadius: 0,
          justifyContent: 'center',
          py: 0.5,
        }}
      >
        You’re offline. Changes may not save until your connection returns.
      </Alert>
    </Slide>
  );
}
