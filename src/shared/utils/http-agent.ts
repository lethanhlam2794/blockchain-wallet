import * as http from 'http';
import * as https from 'https';

export const httpAgent = new http.Agent({ keepAlive: true });
export const httpsAgent = new https.Agent({ keepAlive: true });
