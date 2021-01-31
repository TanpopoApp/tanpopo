import { IServer } from '@/store/modules/server';
import { v4 as uuidv4 } from 'uuid';

export function parseTrojanURL(url: string) {
  const serverData = url.match(/^trojan:\/\/(.*?)@(.*?):(\d+)(?:#?)(.*)/);
  if (Array.isArray(serverData)) {
    const serverInfo: IServer = {
      uuid: uuidv4(),
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
