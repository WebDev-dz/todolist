import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';


const badgeVariants = cva(
  "inline-flex items-center ring-offset-2 ring-2 rounded-xl text-white border px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default:
          "border-transparent  bg-primary text-primary-foreground shadow",
        secondary:
          "border-transparent bg-dark text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<typeof TouchableOpacity>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <TouchableOpacity
      className={cn(badgeVariants({variant}), className)}
      {...props}
    >
      <Text className="text-xs font-semibold">
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export { Badge, badgeVariants };
