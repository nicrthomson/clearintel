export const posix = {
  normalize: (path: string) => {
    // Remove duplicate slashes
    path = path.replace(/\/+/g, '/');
    
    // Remove trailing slash except for root
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    return path;
  },

  join: (...paths: string[]) => {
    return paths
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/');
  },

  extname: (path: string) => {
    const match = /\.[^.]+$/.exec(path);
    return match ? match[0] : '';
  }
};

export default {
  posix,
  join: posix.join,
  extname: posix.extname
}; 