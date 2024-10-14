import React, { createContext, useContext, useId } from 'react';
import { View, Text, TextInput, TextInputProps, ViewComponent, ViewProps, TextProps } from 'react-native';
import { useForm, Controller, UseFormReturn, UseFormProps, ControllerProps ,FieldPath,
  FieldValues,
  useFormContext,
  FormProvider,} from 'react-hook-form';
import { cn } from '@/lib/utils';

  type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}



type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)



const Form = FormProvider

// Form Field Context
const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)


const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}



// Custom hook to use form field
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// Form Item

const FormItem = React.forwardRef<View,ViewProps>(({ className,children, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <View ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
});

// Form Label
const FormLabel = React.forwardRef<View,ViewProps>(({ className,children, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Text
      ref={ref}
      className={cn(error && "text-destructive", className)}
      
      {...props}
    />
  )
});
FormLabel.displayName = "FormLabel"


// Form Control
const FormControl = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  
  return (
    <View
      ref={ref}
      id={formItemId}
      
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

// Form Description


const FormDescription = React.forwardRef<
 Text,
  TextProps
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <Text
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

// Form Message
const FormMessage = React.forwardRef<
  Text,
  TextProps
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <Text
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </Text>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
