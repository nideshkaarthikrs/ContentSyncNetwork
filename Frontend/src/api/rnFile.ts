/** React Native's shape for a FormData file part (not a browser Blob). */
export interface RNFile {
  uri: string;
  name: string;
  type: string;
}

export function appendRNFile(form: FormData, field: string, file: RNFile) {
  // React Native's FormData accepts this object shape at runtime; the DOM lib types don't model it.
  form.append(field, file as unknown as Blob);
}
