# Email Signup Documentation

## Overview

This directory contains documentation for the email signup flow and the FriendlyCaptcha changes introduced to support single-use captcha tokens.

## Documents

| Category           | Document                                                                         | Purpose                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Implementation** | [captcha_index.md](./captcha_index.md)                                           | Documents the changes made to the `FriendlyCaptcha` component, including the forwarded ref, imperative `reset()` API, and widget reset behaviour.              |
| **Implementation** | [emailSignup_index.md](./emailSignup_index.md)                                   | Documents the changes made to the `EmailSignup` component to reset the captcha, clear expired or invalid tokens, and handle unsuccessful submissions.          |
| **Process**        | [email-signup-flow.md](./email-signup-flow.md)                                   | Provides an overview of the email signup flow, component responsibilities, and the interaction between the frontend, backend, FriendlyCaptcha, and Dotdigital. |
| **Process**        | [email-signup-flow-through-the-code.md](./email-signup-flow-through-the-code.md) | Describes the end-to-end execution path through the code, from user input to the browser response.                                                             |
| **Validation**     | [email-signup-testing-and-evidence.md](./email-signup-testing-and-evidence.md)   | Validates the email signup feature, including testing scenarios and evidence gathered.                                                                         |
