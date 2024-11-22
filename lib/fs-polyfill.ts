export const promises = {
  readFile: async (path: string): Promise<Buffer> => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to read file: ${path}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
};

export default {
  promises
}; 