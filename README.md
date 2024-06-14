
```
auth-project
├─ .gitignore
├─ .prettierignore
├─ .prettierrc
├─ .vscode
│  └─ settings.json
├─ dist
│  ├─ app.js
│  ├─ auth
│  │  ├─ login-method-factory.js
│  │  ├─ login-strategies
│  │  │  └─ local.strategy.js
│  │  ├─ register-manager.js
│  │  ├─ register-method-factory.js
│  │  └─ register-strategies
│  │     └─ register-local.js
│  ├─ config
│  │  ├─ multer-config.js
│  │  ├─ passport-config.js
│  │  ├─ register-config.js
│  │  ├─ session-config.js
│  │  └─ strategies
│  │     └─ local.strategy.js
│  ├─ controllers
│  │  ├─ logout.js
│  │  ├─ upload-file-to-s3.js
│  │  ├─ upload-file.js
│  │  ├─ validate-email.js
│  │  └─ views-counter.js
│  ├─ db
│  │  └─ connect.js
│  ├─ middleware
│  │  ├─ auth-guard.js
│  │  ├─ auth-jwt.js
│  │  ├─ file-parser.js
│  │  ├─ login-method-factory.js
│  │  ├─ login.js
│  │  ├─ regenerateSession.js
│  │  ├─ regenerateSessionAfterLogin.js
│  │  ├─ register.js
│  │  └─ schema-validator.js
│  ├─ models
│  │  ├─ EmailVerifictionTokenModel.js
│  │  ├─ User.js
│  │  └─ UserModel.js
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  └─ mainRoutes.js
│  ├─ schema
│  │  └─ UserSchema.js
│  ├─ services
│  │  └─ aws
│  │     ├─ clients
│  │     │  └─ s3.js
│  │     └─ s3-file-upload.js
│  └─ utils
│     ├─ email-validator.js
│     ├─ mailer.js
│     ├─ schema-validator.js
│     └─ token-generator.js
├─ eslint.config.js
├─ package copy.json
├─ package-lock copy.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ browser-app.js
│  ├─ dashboard.html
│  └─ index.html
├─ README.md
├─ tsconfig.json
└─ types.d.ts

```