import { NavigateNext } from '@mui/icons-material';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function AppBreadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" />}
      sx={{
        mb: 2.5,
        flexWrap: 'wrap',
        rowGap: 0.5,
        '& .MuiBreadcrumbs-ol': { flexWrap: 'wrap', rowGap: 0.5 },
      }}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const last = index === items.length - 1;
        if (last || !item.to) {
          return (
            <Typography key={`${item.label}-${index}`} color="text.primary" fontWeight={600}>
              {item.label}
            </Typography>
          );
        }
        return (
          <MuiLink key={`${item.label}-${index}`} component={Link} to={item.to} underline="hover" color="text.secondary">
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
