/** Holds a file when navigating from Index to Workspace */
let pendingFile: File | null = null;

export const setPendingUploadFile = (file: File) => {
  pendingFile = file;
};

export const getAndClearPendingUploadFile = (): File | null => {
  const file = pendingFile;
  pendingFile = null;
  return file;
};
