'use client';

import { getWebsite } from '@/api';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/react';
import { useState } from 'react';

export default function PureReadPage() {
  const [url, setUrl] = useState('https://baidu.com');

  function handleSubmit() {
    if (!url) {
      return;
    }
    getWebsite(url).then((res) => {
      console.log(res);
    });
  }

  return (
    <div className="p-4">
      <Input
        key="primary"
        type="text"
        value={url}
        label="待读取的站点"
        placeholder="Enter your url"
        onValueChange={setUrl}
      />
      <div className="my-4">
        <Button onClick={() => handleSubmit()} fullWidth color="primary">
          提交
        </Button>
      </div>
    </div>
  );
}
