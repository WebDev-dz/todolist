import React from 'react';
import { Text, TextProps } from 'react-native';

export interface LabelProps extends TextProps {
  disabled?: boolean;
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        className={`text-sm font-medium leading-none ${
          disabled ? 'opacity-70' : ''
        } ${className || ''}`}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export { Label };
