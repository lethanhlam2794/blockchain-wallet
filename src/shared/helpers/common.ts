import dayjs from 'dayjs';

export const maskRules = [
  {
    keys: ['nationalId', 'phone', 'phoneNumber', 'address'],
    pattern: /^(.*)$/,
    replacer: () => '***masked***',
  },
];

export const extractUniqueValues = <T>(data: T[], identifier: keyof T) => {
  return Array.from(new Set(data.map((item) => item[identifier] as string)));
};

export const extractDirectoryPath = (
  url: string,
  resourcePath = 'assets',
): string => {
  if (!url) return '';

  // Remove query parameters
  const path = url.split('?')[0];

  // Extract path after domain
  let fullPath = '';
  if (path.includes('://')) {
    const afterProtocol = path.split('://')[1];
    const pathStart = afterProtocol.indexOf('/');
    fullPath = pathStart === -1 ? '' : afterProtocol.substring(pathStart + 1);
  } else {
    // If no protocol, remove leading slash if exists
    fullPath = path.startsWith('/') ? path.slice(1) : path;
  }

  // Remove resourcePath from the beginning
  if (resourcePath && fullPath.startsWith(resourcePath)) {
    const remainingPath = fullPath.substring(resourcePath.length);
    // Remove leading slash if exists
    return remainingPath.startsWith('/')
      ? remainingPath.slice(1)
      : remainingPath;
  }

  return fullPath;
};

export const formatDate = (
  date: Date,
  format: string = 'YYYY-MM-DD HH:mm:ss',
) => {
  return dayjs(date).format(format);
};
