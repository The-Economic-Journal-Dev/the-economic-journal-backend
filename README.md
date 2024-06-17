# API Documentation for Frontend Developers

## Table of Contents

1. [Authentication Endpoints](#Authentication)
   1. [Register](#register-endpoint)
   2. [Login](#login-endpoint)
   3. [Check Session](#check-session-endpoint)
   4. [Logout](#logout-endpoint)

# Authentication

## Register Endpoint

### URL

`/register/:method`

### Method

`POST`

### Parameters

- `method` (string): The registration method (e.g., `local`).
- Currently, the only method available is `local`

### Request Body

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "confirmPassword": "password"
}
```

### Response

```json
{
  "success": true,
  "msg": "Register successful"
}
```

## Login Endpoint

### URL

`/login/:method`

### Method

`GET`

### Parameters

- `method` (string): The registration method (e.g., `local`).
- Currently, the only method available is `local`

### Request Body

```json
{
  "username": "username",
  "password": "password"
}
```

### Response

```json
{
  "success": true,
  "msg": "Login successful"
}
```

## Check Session Endpoint

### URL

`/check-session`

### Method

`GET`

### Response

```json
{
  "authenticated": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

## Logout Endpoint

### URL

`/logout`

### Method

`DELETE`

### Response

```json
{
  "success": true,
  "msg": "Logout successful"
}
```
