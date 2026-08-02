# Email Signup Success Path Through the Code

## 1. User completes the form

**File:** `packages/design-system/src/molecules/EmailSignup/index.tsx`

The component manages the user-entered values:

``` text
email
firstName
captchaSolution
```

When the form is submitted, it sends them to the application API:

``` ts
{
  email,
  firstName,
  captchaSolution
}
```

The request is sent to:

``` text
POST /api/email-signup
```

## 2. API reads the submitted JSON

**File:** `apps/web/src/app/api/email-signup/route.ts`

``` ts
export const POST = async (req: Request) => {
  const body = (await req.json()) as unknown;
}
```

At this point, `body` contains the submitted email, first name, and
captcha solution.

It is initially typed as `unknown` because external request data cannot
yet be trusted.

## 3. Submitted fields are validated

**File:** `apps/web/src/app/api/email-signup/route.ts`

``` ts
if (!isEmailForm(body)) {
  return new Response(JSON.stringify({ error: 'Missing or incorrect parameters' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

Validation helper:

``` ts
import { isEmailForm } from '@/lib/email-signup/email-signup';
```

For a valid submission:

``` ts
isEmailForm(body) === true
```

## 4. FriendlyCaptcha solution is verified

``` ts
const isValidCaptcha = await verifyCaptcha(body.captchaSolution);
```

``` ts
const result = await frcClient.verifyCaptchaResponse(solution);
```

``` ts
if (!result.wasAbleToVerify()) return false;
if (!result.shouldAccept()) return false;
return true;
```

## 5. Invalid captcha submissions are stopped

``` ts
if (!isValidCaptcha) {
  return new Response(JSON.stringify({ error: 'Failed captcha' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

For the success path:

``` ts
isValidCaptcha === true
```

## 6. Contact creation is requested

``` ts
const contactResponse = await createNewContact(body.email, body.firstName);
```

## 7. Dotdigital contact payload is constructed

**File:** `apps/web/src/lib/email-signup/dot-digital.ts`

``` ts
const contact = contactConstructor(email, firstName);
```

## 8. Request is sent to the external Dotdigital API

``` text
POST https://r1-api.dotdigital.com/contacts/v3
```

## 9. Dotdigital response is parsed

``` ts
const data = (await response.json()) as DotDigitalResponse;
return data;
```

Example:

``` json
{"status":"subscribed"}
```

or

``` json
{"status":"pendingOptIn"}
```

## 10. API checks whether the status is successful

``` ts
const successStatuses = ['subscribed', 'pendingOptIn'];
```

``` ts
successStatuses.includes(contactResponse.status) === true
```

Returns:

``` json
{"status":"subscribed"}
```

## 11. Client displays the success message

**File:** `packages/design-system/src/molecules/EmailSignup/index.tsx`

The component receives HTTP 200 and displays the configured success
message.

``` text
User input
    ↓
isEmailForm()
    ↓
verifyCaptcha()
    ↓
createNewContact()
    ↓
Dotdigital external API
    ↓
{"status":"subscribed"}
    ↓
HTTP 200
    ↓
Success message displayed
```
