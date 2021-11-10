import { UploaderFn } from "./Uploader";

const saveFileAsBase64 = (
  file: File
): Promise<{ name: string; size: number; url: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        resolve({
          name: file.name,
          size: file.size,
          url: reader.result as string,
        });
      },
      false
    );
    reader.readAsDataURL(file);
  });
};

export const defaultUploader: UploaderFn = (files) => {
  const items: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) {
      continue;
    }
    items.push(file);
  }
  return Promise.all(items.map((item) => saveFileAsBase64(item)));
};
