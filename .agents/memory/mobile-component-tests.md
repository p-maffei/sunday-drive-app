---
name: Mobile component tests
description: Version-specific behavior to account for when writing Sunday Drive component tests.
---

React Native Testing Library v14 exposes asynchronous rendering, queries, and event helpers. Await `render`, each query, and each `fireEvent` call in component tests.

**Why:** The v14 API is asynchronous, unlike older examples that use synchronous React Native Testing Library calls.

**How to apply:** When adding or updating Expo component tests, follow the installed v14 API and keep tests exercising the actual rendered controls.
