import { getAlovaInstance } from '#/utils';
import { readFileSync } from 'fs';
import path from 'path';
import { Result, delay } from 'root/testUtils';

describe('request adapter GlobalFetch', () => {
  test('the cache response data should be saved', async () => {
    const alova = getAlovaInstance({
      responseExpect: r => r.json()
    });
    const mockFn = jest.fn();
    const Get = alova.Get('/unit-test', {
      cacheFor: 100 * 1000,
      transformData: ({ data }: Result, headers) => {
        mockFn(data, headers);
        return data;
      }
    });
    await Get.send();
    expect(mockFn.mock.calls[0][0]).toStrictEqual({
      path: '/unit-test',
      method: 'GET',
      params: {}
    });
    expect(mockFn.mock.calls[0][1].get('content-type')).toBe('application/json');
  });

  test('The Content-Type should be set to `application/json` default', async () => {
    const alova = getAlovaInstance({
      responseExpect: r => r.json()
    });
    const method = alova.Post<Record<string, any>>('/unit-test-headers', {});
    const { data } = await method;
    expect(data.requestHeaders['content-type']).toBe('application/json;charset=UTF-8');
  });

  test('The Content-Type should be what you set when set the Content-Type', async () => {
    const alova = getAlovaInstance({
      responseExpect: r => r.json()
    });
    let method = alova.Post<Record<string, any>>(
      '/unit-test-headers',
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    let res = await method;
    expect(res.data.requestHeaders['content-type']).toBe('application/x-www-form-urlencoded');

    method = alova.Post<Record<string, any>>(
      '/unit-test-headers',
      {},
      {
        headers: {
          'Content-Type': undefined
        }
      }
    );
    res = await method;
    expect(res.data.requestHeaders['content-type']).toBe('undefined');
  });

  test('The Content-Type should be undefined when pass the FormData', async () => {
    const alova = getAlovaInstance({
      responseExpect: r => r.json()
    });
    let method = alova.Post<Record<string, any>>('/unit-test-headers', new FormData());
    let res = await method;
    expect(res.data.requestHeaders['Content-Type']).toBeUndefined();

    method = alova.Post<Record<string, any>>('/unit-test-headers', new FormData(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    res = await method;
    expect(res.data.requestHeaders['content-type']).toBe('application/x-www-form-urlencoded');
  });

  test.skip('should throw error when upload files with fetch api', async () => {
    const alova = getAlovaInstance({
      responseExpect: r => r.json()
    });
    const { requestAdapter } = alova.options;
    alova.options.requestAdapter = ((...args: any) => {
      // eslint-disable-next-line
      const ctrls = requestAdapter.apply(null, args);
      ctrls.onUpload = () => {
        throw new Error('upload files with fetch api is not supported');
      };
    }) as typeof requestAdapter;

    // 使用formData上传文件
    const formData = new FormData();
    formData.append('f1', 'f1');
    formData.append('f2', 'f2');
    const imageFile = new File([readFileSync(path.resolve(__dirname, '../../../../../assets/img-test.jpg'))], 'file', {
      type: 'image/jpeg'
    });
    formData.append('file', imageFile);

    const Post = alova.Post('/unit-test-upload', formData, {
      transformData: async (data: Result<string>) => {
        await delay(500);
        return data;
      }
    });
    Post.onUpload(() => {});
    await Post.send();
    await delay(1000);
  });
});
