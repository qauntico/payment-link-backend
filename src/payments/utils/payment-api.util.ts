interface PaymentApiConfig {
  baseUrl: string;
  clientKey: string;
  clientSecret: string;
  token?: string;
}

interface PaymentApiResponse<T = any> {
  message: string;
  data: T;
}

/**
 * Makes a POST request to the payment API
 */
export async function paymentApiPost<T = any>(
  endpoint: string,
  config: PaymentApiConfig,
  body?: any,
): Promise<PaymentApiResponse<T>> {
  const { baseUrl, clientKey, clientSecret, token } = config;
  // console.log('baseUrl', baseUrl);
  // console.log('clientKey', clientKey);
  // console.log('clientSecret', clientSecret);
  // console.log('token', token);
  const headers: Record<string, string> = {
    'client-key': clientKey,
    'client-secret': clientSecret,
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log('response', response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      statusText: response.statusText,
      message: errorData.message || response.statusText,
      data: errorData,
    };
  }

  return await response.json();
}

/**
 * Makes a GET request to the payment API
 */
export async function paymentApiGet<T = any>(
  endpoint: string,
  config: PaymentApiConfig,
): Promise<PaymentApiResponse<T>> {
  const { baseUrl, clientKey, clientSecret, token } = config;

  const headers: Record<string, string> = {
    'client-key': clientKey,
    'client-secret': clientSecret,
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      statusText: response.statusText,
      message: errorData.message || response.statusText,
      data: errorData,
    };
  }

  return await response.json();
}
