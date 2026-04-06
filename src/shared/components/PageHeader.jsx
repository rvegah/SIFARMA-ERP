import React from 'react';
import { Box, Typography } from '@mui/material';
import { farmaColors } from '../../app/theme';

/**
 * Reusable PageHeader component to unify title typography across the app.
 * 
 * @param {string} title - The text to display as the main title
 * @param {string} subtitle - Optional subtitle below the main title
 * @param {React.ReactNode} icon - Optional icon to show next to the title
 * @param {React.ReactNode} action - Optional action buttons/components on the right side
 */
const PageHeader = ({ title, subtitle, icon, action }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            gap: 2
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {icon && (
                    <Box sx={{ 
                        background: farmaColors.gradients.primary,
                        p: 1,
                        borderRadius: 2,
                        display: 'flex',
                        boxShadow: '0 4px 15px rgba(204,108,6,0.2)'
                    }}>
                        {React.cloneElement(icon, { sx: { color: 'white', fontSize: 22 } })}
                    </Box>
                )}
                <Box>
                    <Typography 
                        variant="h6"
                        sx={{ fontWeight: 700, color: farmaColors.secondary, lineHeight: 1.2, fontSize: '1rem' }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>
            {action && (
                <Box>
                    {action}
                </Box>
            )}
        </Box>
    );
};

export default PageHeader;
