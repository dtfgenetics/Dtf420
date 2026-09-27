# Learning runtime boundary

This directory contains server-side infrastructure for authenticated learner progress, assessment attempts, grading, and credential verification.

Public education content must not depend on these runtime secrets.

Protected learning APIs must call `requireLearningRuntime()` before using authentication or database services. If required configuration is absent or the configured public origins drift from `https://dtfseeds.com`, protected functionality fails closed while public lessons remain available.

Do not log:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- session tokens
- assessment answer keys
- private learner records

The database/auth adapters will be added in a separate dependency-bearing change after package/lockfile installation is verified.
