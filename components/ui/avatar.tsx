import React from 'react';
import { View, Image, Text } from 'react-native';



interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

interface AvatarImageProps {
  className?: string;
  src: string;
  alt?: string;
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ className, children, ...props }) => (
  <View
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  >
    {children}
  </View>
);

const AvatarImage: React.FC<AvatarImageProps> = ({ className, src, alt, ...props }) => (
  <Image
    source={{ uri: src }}
    className={`aspect-square h-full w-full ${className}`}
    accessibilityLabel={alt}
    {...props}
  />
);

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children, ...props }) => (
  <View
    className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
    {...props}
  >
    {typeof children === 'string' ? (
      <Text className="text-sm font-medium">{children}</Text>
    ) : (
      children
    )}
  </View>
);

export { Avatar, AvatarImage, AvatarFallback };
