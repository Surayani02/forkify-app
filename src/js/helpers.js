import { TIMEOUT_SECONDS } from './config';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const result = await Promise.race([fetchPro, timeout(TIMEOUT_SECONDS)]);
    const data = await result.json();
    if (!result.ok) throw new Error(`${data.message} (${result.status})`);
    return data;
  } catch (error) {
    throw error;
  }
};
