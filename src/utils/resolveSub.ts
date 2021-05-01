import { IServer } from '@/store/modules/server';
import { parseTrojanURL } from './url';
import log from 'electron-log';

export function b64DecodeUnicode(str: string) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

function resolveNodes(text: string): Array<IServer> {
  const servers = b64DecodeUnicode(text).split('\n');
  return servers
    .map(server => {
      return parseTrojanURL(server);
    })
    .filter(x => x) as Array<IServer>;
}

export function getSubscriptionNodes(URL: string) {
  if (URL.startsWith('sub://')) {
    URL = b64DecodeUnicode(URL.replace('sub://', ''));
  }
  return fetch(URL)
    .then(async res => {
      if (res.ok) {
        const text = await res.text();
        return resolveNodes(text);
      } else {
        throw res.status;
      }
    })
    .catch((err: Error) => {
      log.warn(URL);
      log.warn(err.message);
    });
}
