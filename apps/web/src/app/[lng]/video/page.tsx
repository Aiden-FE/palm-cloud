'use client';

import { useEffect, useState } from 'react';
import Player from 'xgplayer';
import 'xgplayer/dist/xgplayer.min.css';
import LivePreset from 'xgplayer/es/presets/live';
import { getVideos } from '@/api';
import { Listbox, ListboxItem } from '@nextui-org/react';

export default function VideoPage() {
  const [list, setList] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  async function mountXgplayer() {
    let player = new Player({
      id: 'mse',
      url: videoUrl,
      height: '100%',
      width: '100%',
      presets: ['default', LivePreset],
    });
  }

  async function getAllVideos() {
    const res = await getVideos();
    setList(res);
  }

  function selectedVideo(name: string) {
    const target = list.find((item) => item.name === name);
    if (target) {
      setVideoUrl(target.url);
      mountXgplayer();
    }
  }

  useEffect(() => {
    getAllVideos();
    mountXgplayer();
  }, []);

  return (
    <div>
      <div className="w-full border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
        <div className="w-[800px] h-[500px] max-w-full max-h-[70vh]">
          <div id="mse"></div>
        </div>
        <Listbox aria-label="List" onAction={(key: any) => selectedVideo(key)}>
          {list?.map?.((item: any) => <ListboxItem key={item.name}>{item.name}</ListboxItem>)}
        </Listbox>
      </div>
    </div>
  );
}
