module.exports = {
  Box: ({ children, ...props }) => children,
  Container: ({ children, ...props }) => children,
  Typography: ({ children, ...props }) => children,
  Grid: ({ children, ...props }) => children,
  Card: ({ children, ...props }) => children,
  CardContent: ({ children, ...props }) => children,
  CardMedia: ({ children, ...props }) => children || null,
  TextField: () => null,
  InputAdornment: ({ children, ...props }) => children,
  FormControl: ({ children, ...props }) => children,
  Select: ({ children, ...props }) => children,
  MenuItem: ({ children, ...props }) => children,
  InputLabel: ({ children, ...props }) => children,
  // Improved Button mock to handle role and disabled state
  Button: ({ children, disabled, ...props }) => (
    <button role="button" disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Paper: ({ children, ...props }) => children,
  Rating: () => null,
  Divider: () => null,
  Chip: ({ label }) => label || null,
  IconButton: ({ children, ...props }) => (
    <button role="button" {...props}>
      {children}
    </button>
  ),
  Tabs: ({ children, ...props }) => children,
  Tab: () => null,
  Drawer: ({ children, open, ...props }) => open ? children : null,
};