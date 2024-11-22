import path from 'path';
import Handlebars from 'handlebars';

// Register all Handlebars helpers
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('not', function(value) {
    return !value;
  });

  Handlebars.registerHelper('or', function() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  });

  Handlebars.registerHelper('and', function() {
    return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
  });

  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Helper for converting file paths to relative graphics paths
  Handlebars.registerHelper('getImageUrl', function(filePath) {
    if (!filePath) {
      console.log('getImageUrl: No filePath provided');
      return '';
    }

    // First normalize the path by removing any duplicate 'uploads/evidence'
    const normalizedPath = filePath.replace(/uploads\/evidence\/uploads\/evidence/, 'uploads/evidence');
    
    // Extract just the filename from the normalized path
    const filename = path.basename(normalizedPath);
    const graphicsPath = `graphics/${filename}`;
    
    console.log('getImageUrl:', {
      input: filePath,
      normalized: normalizedPath,
      filename: filename,
      output: graphicsPath,
      basename: path.basename(filePath)
    });

    return graphicsPath;
  });

  Handlebars.registerHelper('lowercase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('formatDate', function(date: string | Date | null) {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  });

  Handlebars.registerHelper('formatFileSize', function(bytes: number | null) {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  });

  Handlebars.registerHelper('isImage', function(mimeType: string) {
    if (!mimeType) return false;
    return mimeType.startsWith('image/');
  });
}
