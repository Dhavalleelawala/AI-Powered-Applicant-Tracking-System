import { createTheme } from '@mui/material/styles';

const ink = '#0B1F1A';
export const theme = createTheme({
  palette: {
    primary: { main: '#0B1F1A', contrastText: '#F7F4EF' },
    secondary: { main: '#1FA7A0', contrastText: '#0B1F1A' },
    background: { default: '#F7F4EF', paper: '#FFFFFF' },
    text: { primary: '#14201C', secondary: '#547069' },
    error: { main: '#B84335' },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-0.06em' },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 750, letterSpacing: '-0.04em' },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 6, padding: '10px 18px', boxShadow: 'none' }, contained: { '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' }, transition: 'transform .2s ease' } } },
    MuiPaper: { styleOverrides: { root: { border: '1px solid #D9DCD5', boxShadow: 'none' } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff', '&.Mui-focused fieldset': { borderColor: '#1FA7A0' } } } },
  },
});
