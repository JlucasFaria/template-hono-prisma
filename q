[33mcommit 6178ba9067e6053d519bad765002eee82784009b[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mfeature/middleware-infrastructure[m[33m)[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Mon Feb 23 19:55:50 2026 -0300

    feat: add graceful shutdown on SIGINT and SIGTERM

[33mcommit 1dac243bbc9e2cd5b70deacdf89d01552de0a283[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Mon Feb 23 19:50:33 2026 -0300

    feat: add body size limit of 1MB on API routes

[33mcommit 6b01c156300fb0585eba41dd58a12f190c222654[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Mon Feb 23 19:46:02 2026 -0300

    fix: fix rate limiter memory leak with periodic cleanup

[33mcommit 00807b81518800fe35a177f1c4bba0d75c2dc8e5[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Thu Feb 19 21:50:24 2026 -0300

    feat: improve error handler with P2025 support

[33mcommit 54beb438f3612ade6749cd89b960783e24b8782c[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Thu Feb 19 21:39:13 2026 -0300

    chore: translate index.ts comments and strings to English

[33mcommit 25351781835531ee0191c004fdfc792a819ed5e6[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Thu Feb 19 21:33:21 2026 -0300

    feat: add health check endpoint with database connectivity verification

[33mcommit 42f9790055d92e5f598bd9431ef09f1d36157a37[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mmain[m[33m)[m
Merge: cbde944 4c732ac
Author: João Lucas Faria <150162199+JlucasFaria@users.noreply.github.com>
Date:   Tue Feb 17 02:04:31 2026 -0300

    Merge pull request #5 from JlucasFaria/feature/phase-1-and-2-setup
    
    feat: add JWT auth with refresh tokens, password hashing, and user registration

[33mcommit 4c732ac15951e56514adb2e531092aa488680449[m[33m ([m[1;31morigin/feature/phase-1-and-2-setup[m[33m)[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Feb 17 01:48:23 2026 -0300

    refactor: improve schema validations, remove dead code, and harden tests
    
    Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

[33mcommit c28b871a60a526804f143f811192138525f56eed[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Feb 17 01:36:14 2026 -0300

    feat: complete Phase 2 - auth routes, user routes, CORS, and test fixes
    
    - Add login, refresh (with token rotation), and logout endpoints
    - Update user routes with pagination, error schemas, and password support
    - Configure CORS with env-based origin support
    - Fix tests to match new password requirement and paginated response
    
    Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

[33mcommit c7f4bfab5bd5cc559d046194e1bbde2423da997c[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Mon Feb 16 02:02:06 2026 -0300

    feat: add auth, service, shared schemas, and user password support

[33mcommit 8303b8e3463736ad1d855b841af81f63d71c1de4[m[33m ([m[1;31morigin/feature/phase-1-database[m[33m)[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Wed Feb 11 21:56:37 2026 -0300

    feat: add password and refresh token schema, env config and .env.example

[33mcommit cbde944b37f03f676b501886632ada4961bb7ba4[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Feb 10 23:22:47 2026 -0300

    add the `CLAUDE.md` file to your `.gitignore`

[33mcommit 6e4d8f1553367bec0008aff17a54f066a2a14b91[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Sun Feb 8 17:28:58 2026 -0300

    add the `project.md` file to your `.gitignore`

[33mcommit 9f06e29512b0522b6187a416b498b51e4a7b164b[m
Merge: 59b3ea7 ea7645b
Author: João Lucas Faria <150162199+JlucasFaria@users.noreply.github.com>
Date:   Sat Jan 31 00:38:28 2026 -0300

    Merge pull request #3 from JlucasFaria/feature/middleware-setup
    
    add middlewares, utilities and standardize API responses

[33mcommit ea7645b132494a5e7f797757472dae8dac9b0b7d[m[33m ([m[1;31morigin/feature/middleware-setup[m[33m)[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Sat Jan 31 00:20:39 2026 -0300

    minor adjustment

[33mcommit ae1ef73fac7f2eacf5e4c68bad899dceaef90530[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Mon Jan 5 21:21:38 2026 -0300

    feat: add middlewares, utilities and standardize API responses

[33mcommit 59b3ea7112fecf68288beee475a64bc6b03eb327[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Wed Dec 31 13:44:39 2025 -0300

    docs: add essential code comments

[33mcommit 8d7b2a9e12a9d1d9a2e7e55e25ec79611cd412d0[m
Merge: 309bfdb ff6d572
Author: João Lucas Faria <150162199+JlucasFaria@users.noreply.github.com>
Date:   Wed Dec 31 00:31:53 2025 -0300

    Merge pull request #2 from JlucasFaria/feat/auth-setup
    
    fix JWT middleware typing and implement route-specific protected handler

[33mcommit ff6d572a5ebde2ecef1dc7b8dd0dae40df174497[m[33m ([m[1;31morigin/feat/auth-setup[m[33m)[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Wed Dec 31 00:23:12 2025 -0300

    fix(auth): fix JWT middleware typing and implement route-specific protected handler

[33mcommit 309bfdb4921a33328ae76d802e562bc7e04cee63[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 23:25:53 2025 -0300

    refactor: reorganize project structure into api-based architecture

[33mcommit 8a1adbc27e54244c2e1f2e049bbf4348b3c5b5df[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 23:01:53 2025 -0300

    refactor: configure POST route with OpenAPI and fix undefined fields handling in user service

[33mcommit 735447376f65fb5eb6a1fbe964a7ae019a030039[m
Merge: 6b48e7a 0cdc5f2
Author: João Lucas Faria <150162199+JlucasFaria@users.noreply.github.com>
Date:   Tue Dec 23 22:44:22 2025 -0300

    Merge pull request #1 from JlucasFaria/openapi-setup
    
    Integrate interface API

[33mcommit 0cdc5f2d95b08b480a3c17a1e46fb9879897748a[m[33m ([m[1;31morigin/openapi-setup[m[33m)[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 22:36:48 2025 -0300

    feat: add database migration for createdAt and updatedAt

[33mcommit 355e708cf83da1bc432b82ba2e0543437413e769[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 22:23:25 2025 -0300

    feat: integrate OpenAPI with Swagger UI and add timestamps to User model

[33mcommit 6b48e7ac389b10051824f561827ea1c3e2fb6408[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 01:00:03 2025 -0300

    fix: add missing env variables in CI and fix UserService initialization order

[33mcommit 877b07e4b2c3c136a8f5e21b9894ce932208cc46[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 00:54:02 2025 -0300

    fix: replace deprecated Zod methods and configure Prettier line endings

[33mcommit 3b76226b81573c76a78ad57d6d302fc93e5f1862[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 00:29:00 2025 -0300

    ci: add PostgreSQL service to test workflow with database setup

[33mcommit 603225cf72e94fce44119e9556a98c0626d61a75[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Tue Dec 23 00:17:53 2025 -0300

    feat: setup project template with user CRUD, tests, CI/CD workflows and linting config

[33mcommit 9987c1c6af800a8361bc7f3738c7b2eba7fa8f5d[m
Author: João Lucas <j.lucasffilho@gmail.com>
Date:   Fri Dec 19 01:17:22 2025 -0300

    initial commit
