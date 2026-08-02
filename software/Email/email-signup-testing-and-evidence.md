# Email Signup Feature Validation

## Testing

|Scenario|Environment|Action|Expected|
|---|---|---|---|
|Existing email (1st submit)|Local feature branch|Submit registered email|**HTTP 400**`{"status":"contacts:identifierConflict"}`|
|Existing email (2nd submit)|Local feature branch|Submit again without refresh|Captcha resets → Complete **I am human** again → **HTTP 400**`{"status":"contacts:identifierConflict"}`|
|Existing email (2nd submit)|Live|Submit again without refresh|Captcha **does not** reset → **HTTP 400**`{"error":"Failed captcha"}`|
|New email|Local feature branch|Submit new email|`{"status":"noSubscription"}` → Success UI displayed|

## Evidence gathered

| Scenario                                | Live                                                     | Local feature branch                                                                                        | Result                              |
| --------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Existing email (1st submit)             | HTTP `400`<br>`{"status":"contacts:identifierConflict"}` | HTTP `400`<br>`{"status":"contacts:identifierConflict"}`                                                    | Same behaviour                      |
| Existing email (2nd submit, no refresh) | HTTP `400`<br>`{"error":"Failed captcha"}`               | Captcha reset, second request reached Dotdigital and returned<br>`{"status":"contacts:identifierConflict"}` | **Expected behavioural difference** |
| New email                               | `{"status":"noSubscription"}` and success UI             | `{"status":"noSubscription"}` and success UI                                                                | Same behaviour                      |

## Conclusion

**Testing confirms the following behaviour**:

- **Initial submissions**: Unchanged for both existing and new email addresses.
- **Completion flow**: The existing completion flow is unchanged, with new email submissions continuing to display the configured success message.
- **Recoverable Dotdigital failure:** Following a `contacts:identifierConflict` response, the feature branch resets the FriendlyCaptcha widget, allowing the user to retry without refreshing the page.
- **Current live behaviour:** In contrast, the current live implementation does not reset the FriendlyCaptcha widget. A second submission therefore reuses the consumed captcha token and returns:: `{"error":"Failed captcha"}`