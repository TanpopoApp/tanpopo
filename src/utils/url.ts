import { v4 as uuidv4 } from 'uuid';
import { IServer } from '@/store/modules/server';
import { TYPE_TROJAN, TYPE_SS } from '@/utils/const';
import { b64DecodeUnicode } from './resolveSub';

export function parseTrojanURL(url: string) {
  const serverData = url.match(/^trojan:\/\/(.*?)@(.*?):(\d+)(?:#?)(.*)/);
  if (Array.isArray(serverData)) {
    const serverInfo: IServer = {
      uuid: uuidv4(),
      type: TYPE_TROJAN,
      name: serverData[4],
      password: serverData[1],
      host: serverData[2],
      port: Number(serverData[3])
    };
    return serverInfo;
  } else {
    return null;
  }
}

export function parseSSURL(url: string) {
  const base64Data = url.match(/^ss:\/\/([a-z0-9A-Z+/]+)(?:#?)(.*)/);
  if (Array.isArray(base64Data)) {
    const data = b64DecodeUnicode(base64Data[1]);
    const serverData = data.match(/^(.*?):(.*?)@(.*?):(\d+)(?:#?)(.*)/);
    if (Array.isArray(serverData)) {
      const serverInfo: IServer = {
        uuid: uuidv4(),
        type: TYPE_SS,
        name: base64Data[2],
        password: serverData[2],
        host: serverData[3],
        port: Number(serverData[4]),
        method: serverData[1]
      };
      return serverInfo;
    }
  }
  return null;
}
