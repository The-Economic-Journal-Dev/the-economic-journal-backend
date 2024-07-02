# API Documentation for Frontend Developers

# Very important notes

## PLEASE READ THIS BEFORE ANYTHING

#### **Alternatively**, you can use this link `https://the-entrepreneur-website.onrender.com` to use the api but using it after inactivity will take 50s or more to bootup the server (then the response will be faster). But using the docker method down here will be the fastest.

### Steps to start server using docker

#### 1. To start the server, you must first install Docker Desktop [here](https://www.docker.com/products/docker-desktop/). Then, clone this project by running the following command in a working directory `git clone git@github.com:d8rp/the-entrepreneur-website.git`. Then, open the console in the project folder and run `docker compose -f docker-compose.dev.yaml up`. The server should now be accessible on `localhost:3000`.

#### 2. All the static files like HTML, CSS, JS and images must be stored in the public folder after you cloned the project.

#### 3. You will need to a `.env` file for the server to start and run with no errors. Ask derp for it.

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
   2. [Activate User](#activate-user-endpoint)
   3. [Login](#login-endpoint)
   4. [Check Session](#check-session-endpoint)
   5. [Logout](#logout-endpoint)
2. [Posts Endpoints](#posts)
   1. [Tips and Tricks](#tips-and-tricks)
   2. [Quill HTML editor](#quill-html-editor)
   3. [Create a New Post](#create-a-new-post)
   4. [Get Posts](#get-posts)
   5. [Get Single Post](#get-single-post)
   6. [Edit Post](#edit-post)
   7. [Delete Post](#edit-post)
3. [User Profile Endpoints](#user-profile-endpoints)
4. [Errors](#errors)

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

## Activate User Endpoint

### URL

`/auth/verify`

### Method

`POST`

### QUERY

add an `?=` after the URL lie this: `/auth/verify?token={INSERT TOKEN HERE}`

### Request Body

```json
{
  "code": "123456"
}
```

### Response

```json
{
  "success": true,
  "msg": "Email validation successful"
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

# Posts

## Tips and Tricks

It's written in pairs of `Name: Type`

### Post JSON format:

```json
{
  "_id": string,
   "title": string,
   "authorId": string,
   "datePublished": Date,
   "imageURL": string,
   "summary": string,
   "postBody": string, // postBody is just html of the post in plain text
}
```

The frontend currently only need to send in the body this in FormData:

```json
{
   "title": string,
   "summary": string,
   "postBody": Object, // postBody is just html of the post in plain text. See "Quill HTML editor" for more info
}
```

**_IMPORTANT:_** To supply the post with an image for the banner, a form with the `enctype="multipart/form-data"` type must be present and a `<input>` with property `name="image"` (only a single image is allowed). Remember to send the data though FormData if you're using javascript to send the request.
<br></br>

#### Example file input html:

`<input type="file" id="imageUpload" name="image" accept="image/*">`<br></br>
\*Put this in a form

## Quill HTML editor

See `new-post.html` for more clarity.

### 1. Make a HTML editor

```html
<div class="editor-container">
  <div id="editor" style="height: 200px"></div>
</div>
<script>
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],
    ["link", "formula"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];

  const quill = new Quill("#editor", {
    modules: {
      toolbar: toolbarOptions,
    },
    theme: "snow",
  });
</script>
```

To get the HTML out of the editor to send to the backend, use:

```javascript
const html = quill.getSemanticHTML(0);
```

## Create a New Post

Creates a new post with specified details and optionally uploads an image.

### URL:

`/api/posts`

### Method:

`POST`

### Request File(s):

`image (file): Optional updated image file to upload.`

### Request:

```json
{
  "title": "example title",
  "summary": "example summary",
  "postBody": "<p>Example Body</p>"
}
```

### Response

```json
{
  "success": true,
  "msg": "Post created successfully",
  "post": { ... } // Details of the created post
}
```

## Get Posts

Retrieves a list of posts with optional pagination and content inclusion.

### URL:

`/api/posts`

### Method:

`GET`

### Request:

```json
{
  "pageNumber": 1, // (number, default: 1): Page number for pagination.
  "count": 20, // (number, default: 20): Number of posts per page.
  "includeBody": true // (boolean, default: false): Whether to include full post body.
}
```

### Response

```json
{
  "success": true,
  "msg": "Posts fetched successfully",
  "posts": [ ... ] // Array of posts
}
```

## Get Single Post

Retrieves details of a single post by its ID.

### URL:

`/api/post/:id`

### Method:

`GET`

### Path Parameters:

`id (string): ID of the post to retrieve.`

### Request:

```json
{
  "pageNumber": 1, // (number, default: 1): Page number for pagination.
  "count": 20, // (number, default: 20): Number of posts per page.
  "includeBody": true // (boolean, default: false): Whether to include full post body.
}
```

### Response

```json
{
  "success": true,
  "msg": "Post fetched successfully",
  "post": { ... } // Details of the fetched post
}
```

## Edit Post

Updates details of an existing post identified by its ID.

### URL:

`/api/post/:id`

### Method:

`PATCH`

### Path Parameters:

`id (string): ID of the post to retrieve.`

### Request File(s):

`image (file): Optional updated image file to upload.`

### Request Body:

```json
{
  "title": 1, // (string): Updated title of the post
  "summary": 20, // (string): Updated summary or excerpt of the post.
  "postBody": true // (string): Updated main content body of the post.
}
```

### Response

```json
{
  "success": true,
  "msg": "Post with id: {postId} edited successfully.",
  "post": { ... } // Details of the edited post
}
```

## Delete Post

Deletes an existing post identified by its ID.

### URL:

`/api/post/:id`

### Method:

`DELETE`

### Path Parameters:

`id (string): ID of the post to delete.`

### Request File(s):

`image (file): Optional updated image file to upload.`

### Request:

```json
{
  "title": 1, // (string): Updated title of the post
  "summary": 20, // (string): Updated summary or excerpt of the post.
  "postBody": true // (string): Updated main content body of the post.
}
```

### Response

```json
{
  "success": true,
  "msg": "Post deleted successfully"
}
```

# User Profile Endpoints

## Edit User Profile

Updates details of an existing user identified by their ID.

### URL:

`/api/user/:id`

### Method:

`PATCH`

### Path Parameters:

`id (string): ID of the user to retrieve and edit.`

### Request Body:

```json
{
  "email": "email@email.com", // (optional): The new email address.
  "username": "username", // (optional): The new username.
  "password": "password" // (required): The current password to verify the user's identity.
}
```

### Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

## Delete User

Delete an existing user identified by their ID.

### URL:

`/api/user/:id`

### Method:

`DELETE`

### Path Parameters:

`id (string): ID of the user to be deleted.`

### Request Body:

```json
{
  "password": "password" // (required): The current password to verify the user's identity.
}
```

### Response

```json
{
  "success": true,
  "msg": "Profile deleted successfully"
}
```

## Get User Profile

Get an existing user's profile identified by their ID.

### URL:

`/api/user/:id`

### Method:

`GET`

### Path Parameters:

`id (string): ID of the user to be retrieved.`

### Response

```json
{
  "success": true,
  "msg": "Profile retrieved successfully"
}
```

# Errors

- Currently if there are any errors during a request, a JSON will be returned with a `success` value of `false` and an error object like this:

```json
{
  "success": false,
  "error": {
    "message": "An error occurred",
    "status": 500
  }
}
```

- Let me know if you want errors to be done differently
