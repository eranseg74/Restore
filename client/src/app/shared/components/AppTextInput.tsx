import { TextField, type TextFieldProps } from "@mui/material";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  // Props will include the label field defined herer + all the props from the useController hook, and all the props from the TextField element from MaterialUi
  label: string;
  name: keyof T;
} & UseControllerProps<T> &
  TextFieldProps;

export default function AppTextInput<T extends FieldValues>(props: Props<T>) {
  const { fieldState, field } = useController({ ...props });
  return (
    <TextField
      {...props} // Passing all of the props
      {...field} // Passing all of the field props
      multiline={props.multiline}
      rows={props.rows}
      type={props.type}
      fullWidth
      value={field.value || ""}
      variant='outlined'
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
}
