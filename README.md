# API Documentation for Frontend Developers

# Very important notes

## PLEASE READ THIS BEFORE ANYTHING

#### **Alternatively**, you can use this link `api.derpdevstuffs.org` to use the api but using it after inactivity will take 50s or more to bootup the server (then the response will be faster). But using the docker method down here will be the fastest.

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
2. [Articles Endpoints](#articles)
   1. [Tips and Tricks](#tips-and-tricks)
   2. [Quill HTML editor](#quill-html-editor)
   3. [Create a New Article](#create-a-new-article)
   4. [Get Articles](#get-articles)
   5. [Get Single Article](#get-single-article)
   6. [Edit Article](#edit-article)
   7. [Delete Article](#edit-article)
   8. [Create New Comment](#create-new-comment)
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
  "message": "Register successful"
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
  "message": "Email validation successful"
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
  "message": "Login successful"
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
  "message": "Logout successful"
}
```

# Articles

## Tips and Tricks

It's written in pairs of `Name: Type`

### Article JSON format:

```json
{
  "_id": string,
   "title": string,
   "authorId": string,
   "datePublished": Date,
   "imageURL": string,
   "summary": string,
   "articleBody": string, // articleBody is just html of the article in plain text
}
```

The frontend currently only need to send in the body this in FormData:

```json
{
   "title": string,
   "summary": string,
   "articleBody": Object, // articleBody is just html of the article in plain text. See "Quill HTML editor" for more info
}
```

**_IMPORTANT:_** To supply the article with an image for the banner, a form with the `enctype="multipart/form-data"` type must be present and a `<input>` with property `name="image"` (only a single image is allowed). Remember to send the data though FormData if you're using javascript to send the request.
<br></br>

#### Example file input html:

`<input type="file" id="imageUpload" name="image" accept="image/*">`<br></br>
\*Put this in a form

## Quill HTML editor

See `new-article.html` for more clarity.

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

## Create a New Article

Creates a new article with specified details and optionally uploads an image.

### URL:

`/api/articles`

### Method:

`POST`

### Request File(s):

`image (file): Optional updated image file to upload.`

### Request:

```json
{
  "title": "example title",
  "summary": "example summary",
  "articleBody": "<p>Example Body</p>"
}
```

### Response

```json
{
  "success": true,
  "message": "Article created successfully",
  "article": { ... } // Details of the created article
}
```

## Get Articles

Retrieves a list of articles with optional pagination and content inclusion.

### URL:

`/api/articles`

### Method:

`GET`

### Request:

```json
{
  "pageNumber": 1, // (number, default: 1): Page number for pagination.
  "count": 20, // (number, default: 20): Number of articles per page.
  "includeBody": true // (boolean, default: false): Whether to include full article body.
}
```

### Response

```json
{
  "success": true,
  "message": "Articles fetched successfully",
  "articles": [ ... ] // Array of articles
}
```

## Get Single Article

Retrieves details of a single article by its ID.

### URL:

`/api/article/:id`

### Method:

`GET`

### Path Parameters:

`id (string): ID of the article to retrieve.`

### Request:

```json
{
  "pageNumber": 1, // (number, default: 1): Page number for pagination.
  "count": 20, // (number, default: 20): Number of articles per page.
  "includeBody": true // (boolean, default: false): Whether to include full article body.
}
```

### Response

```json
{
  "success": true,
  "message": "Article fetched successfully",
  "article": { ... } // Details of the fetched article
}
```

## Edit Article

Updates details of an existing article identified by its ID.

### URL:

`/api/article/:id`

### Method:

`PATCH`

### Path Parameters:

`id (string): ID of the article to retrieve.`

### Request File(s):

`image (file): Optional updated image file to upload.`

### Request Body:

```json
{
  "title": 1, // (string): Updated title of the article
  "summary": 20, // (string): Updated summary or excerpt of the article.
  "articleBody": true // (string): Updated main content body of the article.
}
```

### Response

```json
{
  "success": true,
  "message": "Article with id: {articleId} edited successfully.",
  "article": { ... } // Details of the edited article
}
```

## Delete Article

Deletes an existing article identified by its ID.

### URL:

`/api/article/:id`

### Method:

`DELETE`

### Path Parameters:

`id (string): ID of the article to delete.`

### Request:

```json
{
  "title": 1, // (string): Updated title of the article
  "summary": 20, // (string): Updated summary or excerpt of the article.
  "articleBody": true // (string): Updated main content body of the article.
}
```

### Response

```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

## Search Articles

Retrieves articles based on various search criteria and pagination parameters.

### Endpoint

`GET /search`

### Query Parameters

| Parameter  | Type    | Description                                           |
| ---------- | ------- | ----------------------------------------------------- |
| search     | string  | Search term for article title, text, and summary      |
| category   | string  | Single category to filter articles                    |
| categories | string  | Comma-separated list of categories to filter articles |
| startDate  | string  | ISO date string for the earliest publication date     |
| endDate    | string  | ISO date string for the latest publication date       |
| page       | integer | Page number for pagination (default: 1)               |
| count      | integer | Number of articles per page (default: 20)             |

### Response

#### Success Response

**Code:** 200 OK

**Content example:**

````json
{
  "success": true,
  "message": "Articles searched and fetched successfully",
  "articles": [
    {
      // Article object
    },
    // More article objects...
  ]
}

## Create New Comment

### URL:

`/api/article/:id/comment`

### Method:

`POST`

### Request:

```json
{
  "content": "body of the comment", // (string): The text content of the comment
  "targetId": "exampleID" // (string): The id of the target comment to create a comment for. Leave blank or dont provide a target if commenting on a article
}
````

### Response:

```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": newComment, // The new comment object that was created
}
```

## Delete Comment

### URL:

`/api/article/:id/comment`

### Method:

`DELETE`

### Request:

```json
{
  "targetId": "exampleID" // (string): The id of the target comment to delete
}
```

### Response:

```json
{
  "success": true,
  "message": "Comment delete successfully",
  "comment": null
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
