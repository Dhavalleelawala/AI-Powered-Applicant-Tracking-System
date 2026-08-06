import { Box, Button, Typography } from '@mui/material';
import { Component } from 'react';
import { ErrorState } from './ui/Primitives';

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
          <Typography
            sx={{ fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '1.75rem', mb: 2 }}
          >
            Rolefit hit a snag
          </Typography>
          <ErrorState
            title="This view crashed"
            error={this.state.error?.message || this.state.error}
            sx={{ mb: 2.5 }}
          />
          <Button variant="contained" color="secondary" onClick={() => window.location.assign('/')}>
            Back to home
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
