# Impersonation Permission & Approval Workflow - Full Documentation

This document provides complete technical specifications, backend API documentation, database schema definitions, WebSocket event payloads, and Next.js frontend integration code for the Impersonation Permission & Approval Workflow.

---

## 1. Overview & Business Logic

### Workflow Summary
1. **Request Phase**: Superadmin, Admin, or Supporter initiates an impersonation request for a target user (`POST /api/v1/usermanagement/{userId}/request-impersonate`).
2. **Notification & Consent**: The target user receives a real-time WebSocket push notification (`notification` namespace) and an email. The user can **Approve** or **Reject** the request (`POST /api/v1/usermanagement/impersonate-requests/{requestId}/respond`).
3. **Expiration**: Impersonation approvals remain valid for **15 minutes**.
4. **Impersonated Token Generation**: Once approved, the admin/supporter calls `POST /api/v1/usermanagement/{userId}/login-as-user` to obtain JWT access & refresh tokens.
5. **One-Time Use**: Upon successful token generation, the request status is marked as `USED` to prevent token re-generation without fresh consent.

---

## 2. Database Schema Definition

### Prisma Model (`prisma/models/impersonationRequest.prisma`)
```prisma
model ImpersonationRequest {
  id           String                     @id @default(uuid())
  requesterId  String
  targetUserId String
  status       ImpersonationRequestStatus @default(PENDING)
  reason       String?
  expiresAt    DateTime
  createdAt    DateTime                   @default(now())
  updatedAt    DateTime                   @updatedAt

  requester  User @relation("ImpersonationRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  targetUser User @relation("ImpersonationTarget", fields: [targetUserId], references: [id], onDelete: Cascade)

  @@index([requesterId])
  @@index([targetUserId])
  @@index([status])
}
```

### Prisma Enum (`prisma/models/enum.prisma`)
```prisma
enum ImpersonationRequestStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
  USED
}
```

---

## 3. Backend API Reference

### Endpoints Overview

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/usermanagement/:userId/request-impersonate` | `SUPERADMIN`, `ADMIN`, `SUPPORTER` | Sends an impersonation request to target user. |
| `GET` | `/api/v1/usermanagement/impersonate-requests/my-requests` | Any Logged-in User | Retrieves active pending requests for current user. |
| `POST` | `/api/v1/usermanagement/impersonate-requests/:requestId/respond` | Any Logged-in User | User approves (`APPROVED`) or rejects (`REJECTED`) request. |
| `POST` | `/api/v1/usermanagement/:userId/login-as-user` | `SUPERADMIN`, `ADMIN`, `SUPPORTER` | Generates JWT tokens (requires prior user approval). |

---

### Endpoint 1: Request Impersonation Permission
- **URL**: `POST /api/v1/usermanagement/:userId/request-impersonate`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Request Body**:
```json
{
  "reason": "Investigating audio timeline configuration issue"
}
```
- **Response (201 Created)**:
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Impersonation request sent successfully",
  "data": {
    "message": "Impersonation request sent to user successfully",
    "requestId": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "expiresAt": "2026-07-25T10:30:00.000Z"
  }
}
```

---

### Endpoint 2: Get My Pending Impersonation Requests
- **URL**: `GET /api/v1/usermanagement/impersonate-requests/my-requests`
- **Headers**: `Authorization: Bearer <USER_JWT_TOKEN>`
- **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Pending impersonation requests retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "requesterId": "admin-uuid-123",
      "targetUserId": "user-uuid-456",
      "status": "PENDING",
      "reason": "Investigating audio timeline configuration issue",
      "expiresAt": "2026-07-25T10:30:00.000Z",
      "createdAt": "2026-07-25T10:15:00.000Z",
      "requester": {
        "id": "admin-uuid-123",
        "username": "superadmin",
        "full_name": "Super Admin User",
        "role": "SUPERADMIN",
        "image_url": "https://cdn.example.com/avatar.jpg"
      }
    }
  ]
}
```

---

### Endpoint 3: Respond to Impersonation Request
- **URL**: `POST /api/v1/usermanagement/impersonate-requests/:requestId/respond`
- **Headers**: `Authorization: Bearer <USER_JWT_TOKEN>`
- **Request Body**:
```json
{
  "status": "APPROVED" // or "REJECTED"
}
```
- **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Impersonation request has been approved",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "requesterId": "admin-uuid-123",
    "targetUserId": "user-uuid-456",
    "status": "APPROVED",
    "updatedAt": "2026-07-25T10:18:00.000Z"
  }
}
```

---

### Endpoint 4: Login as User (Impersonation Token Generation)
- **URL**: `POST /api/v1/usermanagement/:userId/login-as-user`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Response (200 OK)**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login tokens generated successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "user-uuid-456",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```
- **Error Response (403 Forbidden)** (If no approval or expired):
```json
{
  "statusCode": 403,
  "message": "Impersonation permission has not been approved by the user or has expired. Please send an impersonation request first.",
  "error": "Forbidden"
}
```

---

## 4. WebSocket Notification Event Payload

- **Namespace**: `/notification`
- **Room**: `user_{targetUserId}`
- **Event Name**: `notification`
- **Event Payload Structure**:
```json
{
  "notificationId": "notif-uuid-789",
  "title": "Impersonation Access Request",
  "body": "Super Admin User (SUPERADMIN) is requesting permission to access your account. Reason: \"Investigating audio timeline configuration issue\"",
  "type": "WARNING",
  "resourceId": null,
  "notificationStatus": "impersonate_request",
  "createdAt": "2026-07-25T10:15:00.000Z",
  "metadata": {
    "requestId": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "requesterId": "admin-uuid-123",
    "requesterName": "Super Admin User",
    "requesterRole": "SUPERADMIN",
    "reason": "Investigating audio timeline configuration issue",
    "expiresAt": "2026-07-25T10:30:00.000Z"
  }
}
```

---

## 5. Next.js Integration Guide

### 5.1 API Client Helper (`services/impersonationApi.ts`)
```typescript
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const requestImpersonate = async (targetUserId: string, reason?: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(
    `${API_BASE}/usermanagement/${targetUserId}/request-impersonate`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getMyPendingRequests = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(
    `${API_BASE}/usermanagement/impersonate-requests/my-requests`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const respondToImpersonateRequest = async (
  requestId: string,
  status: 'APPROVED' | 'REJECTED'
) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(
    `${API_BASE}/usermanagement/impersonate-requests/${requestId}/respond`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const loginAsUser = async (targetUserId: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(
    `${API_BASE}/usermanagement/${targetUserId}/login-as-user`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
```

### 5.2 User Consent Modal (`components/ImpersonationRequestModal.tsx`)
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getMyPendingRequests, respondToImpersonateRequest } from '../services/impersonationApi';

export default function ImpersonationRequestModal() {
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Check pending requests on load
    getMyPendingRequests().then((res) => {
      if (res.data && res.data.length > 0) {
        const first = res.data[0];
        setActiveRequest({
          requestId: first.id,
          requesterName: first.requester?.full_name || first.requester?.username,
          requesterRole: first.requester?.role,
          reason: first.reason,
        });
      }
    }).catch(console.error);

    // Socket.IO Listener
    const socket = io('http://localhost:5000/notification', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });

    socket.on('notification', (data: any) => {
      if (data.notificationStatus === 'impersonate_request' && data.metadata) {
        setActiveRequest(data.metadata);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!activeRequest) return null;

  const handleResponse = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await respondToImpersonateRequest(activeRequest.requestId, status);
      setActiveRequest(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-lg font-semibold mb-1">Admin Access Request</h3>
        <p className="text-sm text-slate-300 mb-4">
          <span className="font-bold text-amber-400">{activeRequest.requesterName}</span> ({activeRequest.requesterRole}) requests permission to log into your account.
        </p>
        {activeRequest.reason && (
          <p className="text-xs bg-slate-800/80 p-3 rounded-lg text-slate-400 italic mb-6">
            "{activeRequest.reason}"
          </p>
        )}
        <div className="flex space-x-3">
          <button
            onClick={() => handleResponse('REJECTED')}
            disabled={loading}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium"
          >
            Deny
          </button>
          <button
            onClick={() => handleResponse('APPROVED')}
            disabled={loading}
            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-sm font-semibold"
          >
            Allow Access
          </button>
        </div>
      </div>
    </div>
  );
}
```
