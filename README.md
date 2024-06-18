# API Documentation for Frontend Developers

All the URLs are extension of the base URL of {**_insert domain here_**}.
For example, if the domain is foo.com and the URL in the documentation is `/something` then the URL in the browser should be `foo.com/something`.
<br></br>
However, requests should still be made using the URL in the docs like so:

```javascript
fetch("/something")
  .then((response) => response.json())
  .then((data) => {
    // Do Something
  });
```

## Table of Contents

1. [Authentication Endpoints](#authentication)
   1. [Register](#register-endpoint)
   2. [Login](#login-endpoint)
   3. [Check Session](#check-session-endpoint)
   4. [Logout](#logout-endpoint)
   5. [Errors](#errors)
2. [Posts Endpoints](#posts)

# Authentication

## Register Endpoint

### URL

`/auth/register/:method`

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

`/auth/login/:method`

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

`/auth/check-session`

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

`/auth/logout`

### Method

`DELETE`

### Response

```json
{
  "success": true,
  "msg": "Logout successful"
}
```

## Errors

- Currently if there are any errors during a request, a JSON will be returned with a `success` value of `false` and the error message will be in the `msg` property _(Most of the time)_
- Let me know if you want errors to be done differently

# Posts (WIP)

## JSON format

It's written in pairs of `Name: Type`

### 1. Post:

```json
{
   title: string,
   authorId: string,
   datePublished: Date,
   imageURL: string,
   summary: string,
   postBody: Object[], // Object is a JSON, [] mean its an array
}
```

Every single property should exist but the frontend currently only need to send in the body this in FormData:

```json
{
   title: string,
   summary: string,
   postBody: Object, // Object is a JSON, see "2. postBody" for more information
}
```

To supply the post with an image for the banner, a form with the `enctype="multipart/form-data"` type must be present and a `<input>` with property `name="image"` (only a single image is allowed). Remember to send the data though FormData if you're using javascript to send the request.
<br></br>

#### Example file input html:

`<input type="file" id="imageUpload" name="image" accept="image/*">`<br></br>
Put this in a form

### 2. postBody:

Only one element must exist in the each JSON:

```json
{
   paragraph?: string, // ? means that it might not exists
   header?: string,
   quote?: string,
}
```
