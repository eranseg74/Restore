import { useCallback } from "react";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { UploadFile } from "@mui/icons-material";
import { FormControl, Typography, FormHelperText } from "@mui/material";

type Props<T extends FieldValues> = {
  // Props will include the label field defined herer + all the props from the useController hook, and all the props from the TextField element from MaterialUi
  name: keyof T;
} & UseControllerProps<T>;

export default function AppDropzone<T extends FieldValues>(props: Props<T>) {
  const { fieldState, field } = useController({ ...props });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log(acceptedFiles);
      if (acceptedFiles.length > 0) {
        const fileWithPreview = Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        });
        field.onChange(fileWithPreview);
      }
    },
    [field],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, // We can just specify onDrop and not onDrop: onDrop because this is the exact name of the function that the useDropzone hook is expecting
  });

  const dzStyles = {
    display: "flex",
    border: "dashed 2px #767676",
    borderColor: "#767676",
    borderRadius: "5px",
    paddingTop: "30px",
    alignItems: "center",
    height: 200,
    width: 500,
  };

  const dzActive = {
    borderColor: "green",
  };

  return (
    <div {...getRootProps()}>
      <FormControl
        style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles}
        error={!!fieldState.error}
      >
        <input {...getInputProps()} />
        <UploadFile sx={{ fontSize: "100px" }} />
        <Typography variant='h4'>Drop image here</Typography>
        <FormHelperText>{fieldState.error?.message}</FormHelperText>
      </FormControl>
    </div>
  );
}
