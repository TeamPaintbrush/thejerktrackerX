"use client";

import { Order, Location, MenuItem } from '@/lib/dynamodb';

const API_BASE_URL = (process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL || '').trim().replace(/\/$/, '');
const MOBILE_API_KEY = process.env.NEXT_PUBLIC_MOBILE_API_KEY;
const LOCATION_ADMIN_KEY = process.env.NEXT_PUBLIC_MOBILE_LOCATION_ADMIN_KEY;

type HeadersDictionary = Record<string, string>;

type OrderUpdate = Partial<Omit<Order, 'createdAt' | 'pickedUpAt' | 'deliveredAt'>> & {
  createdAt?: string | Date;
  pickedUpAt?: string | Date;
  deliveredAt?: string | Date;
};

const toObject = (headers?: HeadersInit): HeadersDictionary => {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const result: HeadersDictionary = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    return headers.reduce<HeadersDictionary>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  return { ...(headers as HeadersDictionary) };
};

const buildUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  if (API_BASE_URL) return `${API_BASE_URL}${path}`;
  return path;
};

const buildHeaders = (headers?: HeadersInit, includeAdminKey = false): HeadersInit => {
  const base: HeadersDictionary = {
    'Content-Type': 'application/json',
  };

  if (MOBILE_API_KEY) {
    base['x-mobile-api-key'] = MOBILE_API_KEY;
  }

  if (includeAdminKey && LOCATION_ADMIN_KEY) {
    base['X-Location-Admin-Key'] = LOCATION_ADMIN_KEY;
  }

  return {
    ...base,
    ...toObject(headers),
  };
};

async function request<T>(path: string, init: RequestInit = {}, includeAdminKey = false): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init.headers, includeAdminKey),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

const normalizeDate = (value?: string | Date | null) => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

const normalizeOrder = (order: any): Order => ({
  ...order,
  createdAt: normalizeDate(order.createdAt) ?? new Date(),
  pickedUpAt: normalizeDate(order.pickedUpAt),
  deliveredAt: normalizeDate(order.deliveredAt),
});

const normalizeLocation = (location: any): Location => ({
  ...location,
  createdAt: normalizeDate(location.createdAt) ?? new Date(),
  updatedAt: normalizeDate(location.updatedAt),
  billing: {
    ...location.billing,
    activatedAt: normalizeDate(location.billing?.activatedAt),
    deactivatedAt: normalizeDate(location.billing?.deactivatedAt),
  },
  qrCodes: location.qrCodes
    ? {
        ...location.qrCodes,
        generated: normalizeDate(location.qrCodes.generated) ?? new Date(),
        lastUsed: normalizeDate(location.qrCodes.lastUsed),
      }
    : location.qrCodes,
  verification: location.verification
    ? {
        ...location.verification,
        verifiedAt: normalizeDate(location.verification.verifiedAt),
      }
    : location.verification,
});

const normalizeMenuItem = (item: any): MenuItem => ({
  ...item,
  createdAt: normalizeDate(item.createdAt) ?? new Date(),
  updatedAt: normalizeDate(item.updatedAt),
});

async function getAllOrders(): Promise<Order[]> {
  const data = await request<any[]>('/api/orders/');
  return data.map(normalizeOrder);
}

async function getOrderById(orderId: string): Promise<Order | null> {
  const order = await request<any>(`/api/orders/${orderId}`);
  if (!order) return null;
  return normalizeOrder(order);
}

async function createOrder(orderData: Record<string, any>): Promise<Order> {
  const order = await request<any>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  return normalizeOrder(order);
}

async function updateOrder(orderId: string, updates: OrderUpdate): Promise<Order> {
  const order = await request<any>(`/api/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return normalizeOrder(order);
}

async function updateOrderStatus(orderId: string, status: Order['status']) {
  const updatePayload: OrderUpdate = { status };

  if (status === 'picked_up') {
    updatePayload.pickedUpAt = new Date();
  }

  if (status === 'delivered') {
    updatePayload.deliveredAt = new Date();
  }

  return updateOrder(orderId, updatePayload);
}

async function getLocationsByBusinessId(businessId: string): Promise<Location[]> {
  const data = await request<{ locations: any[] }>(`/api/locations?businessId=${encodeURIComponent(businessId)}`);
  return (data.locations || []).map(normalizeLocation);
}

async function createLocation(payload: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location | null> {
  const data = await request<{ location: any }>(
    '/api/locations',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true
  );

  return data.location ? normalizeLocation(data.location) : null;
}

async function updateLocation(locationId: string, updates: Partial<Location>): Promise<boolean> {
  await request<{ location: any }>(
    `/api/locations/${locationId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    true
  );
  return true;
}

async function deleteLocation(locationId: string): Promise<boolean> {
  await request(`/api/locations/${locationId}`,
    {
      method: 'DELETE',
    },
    true
  );
  return true;
}

async function getMenuItems(businessId: string, locationId?: string, search?: string): Promise<MenuItem[]> {
  const params = new URLSearchParams({ businessId });
  if (locationId) params.set('locationId', locationId);
  if (search) params.set('search', search);

  const data = await request<{ menuItems: any[] }>(`/api/mobile/menu?${params.toString()}`);
  return (data.menuItems || []).map(normalizeMenuItem);
}

export const MobileDataService = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  getLocationsByBusinessId,
  createLocation,
  updateLocation,
  deleteLocation,
  getMenuItems,
};
