define({ "api": [
  {
    "type": "post",
    "url": "/api/justify",
    "title": "Justify a given text",
    "name": "justify",
    "group": "API",
    "permission": [
      {
        "name": "Bearer Authentication"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer Authentication</p>"
          },
          {
            "group": "Header",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>The input format (text/plain)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "Text",
            "description": "<p>The justified text</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Error",
            "description": "<p>The error message (PaymentRequired | NoCredentialsSent | WrongCredentialsFormat | WrongCredentials)</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/api.route.js",
    "groupTitle": "API"
  },
  {
    "type": "post",
    "url": "/api/token",
    "title": "Generate/Get token of a user",
    "name": "token",
    "group": "API",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "Email",
            "description": "<p>The user email</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "Token",
            "description": "<p>The user token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Error",
            "description": "<p>The error message (Only email field needed, Please Supply a valid email address, Please Supply an email address)</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/api.route.js",
    "groupTitle": "API"
  }
] });
