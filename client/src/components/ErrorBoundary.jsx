import { Alert, Box, Button, Typography } from '@mui/material';
import { Component } from 'react';

/** Catches render errors so the shell stays usable instead of a blank screen. */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ maxWidth: 520, mx: 'auto', mt: 10, px: 2 }}>
          <Typography variant="h4" gutterBottom>
            Something went wrong
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {String(this.state.error?.message || this.state.error)}
          </Alert>
          <Button variant="contained" color="secondary" onClick={() => window.location.assign('/')}>
            Back to home
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
