import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { styled } from '@mui/material/styles';

const IconWrapper = styled('div')(({ theme, ownerState }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: ownerState.state === 'pending' ? `2px solid ${theme.palette.grey[500]}` : 'none',
    backgroundColor:
        ownerState.state === 'completed'
            ? theme.palette.success.main
            : ownerState.state === 'active'
                ? theme.palette.primary.main
                : 'transparent',
    color:
        ownerState.state === 'completed'
            ? theme.palette.success.contrastText
            : ownerState.state === 'active'
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary,
    transition: theme.transitions.create(['background-color', 'color', 'border'], {
        duration: theme.transitions.duration.short,
    }),
    marginRight: 4,
}));

const createStepIconComponent = (iconElement) => {
    return function CustomStepIcon(props) {
        const { active, completed } = props;
        const state = completed ? 'completed' : active ? 'active' : 'pending';

        return (
            <IconWrapper ownerState={{ state }}>
                {React.cloneElement(iconElement, {
                    style: { fontSize: 14, color: 'inherit', verticalAlign: 'middle' },
                })}
            </IconWrapper>
        );
    };
};

function CustomStepper({
    stepsData = [],
    initialStep = 0,
    alternativeLabel = true,
    sx = { width: '100%' },
    onStepChange,
}) {
    const [activeStep, setActiveStep] = useState(initialStep);

    // Handlers for navigation, passed down to step content
    const handleNext = () => {
        setActiveStep((prev) => {
            const nextStep = Math.min(prev + 1, stepsData.length - 1);
            if (onStepChange) onStepChange(nextStep);
            return nextStep;
        });
    };

    const handleBack = () => {
        setActiveStep((prev) => {
            const prevStep = Math.max(prev - 1, 0);
            if (onStepChange) onStepChange(prevStep);
            return prevStep;
        });
    };

    return (
        <Box sx={sx}>
            <Box
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none', // For Firefox
                    msOverflowStyle: 'none', // For IE and Edge
                    '&::-webkit-scrollbar': {
                        display: 'none', // For Chrome, Safari, and Opera
                    },
                }}
            >
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel={alternativeLabel}
                    sx={{
                        padding: 2,
                        minWidth: 'max-content', // Ensures the stepper doesn't wrap and can scroll
                        minHeight: 40,
                    }}
                >
                    {stepsData.map(({ label, icon }, index) => {
                        const StepIconComponent = icon ? createStepIconComponent(icon) : undefined;
                        return (
                            <Step key={index}>
                                <StepLabel
                                    StepIconComponent={StepIconComponent}
                                    sx={{ typography: 'caption', whiteSpace: 'nowrap' }}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </Box>

            <Box sx={{ mt: 2 }}>
                {stepsData[activeStep]?.content({
                    activeStep,
                    onNext: handleNext,
                    onBack: handleBack,
                }) || null}
            </Box>
        </Box>
    );
}

CustomStepper.propTypes = {
    stepsData: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            icon: PropTypes.element,
            content: PropTypes.func.isRequired,
        })
    ).isRequired,
    initialStep: PropTypes.number,
    alternativeLabel: PropTypes.bool,
    sx: PropTypes.object,
    onStepChange: PropTypes.func,
};

export default CustomStepper;