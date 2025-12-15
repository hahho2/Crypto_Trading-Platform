# Changes 2.0 — OTP, Email & Forgot-Password Integration

## Summary
This release (2.0) adds real two-factor authentication support (OTP via email), a forgot-password-by-OTP flow, OTP expiry handling, and minimal mail integration for development. All changes were kept minimal and backwards-compatible where possible.

## Key Changes

- **TwoFactorOTP model**
  - Added `expiresAt` (UTC Instant) to store OTP expiry (5 minutes after creation).
  - File: [src/main/java/com/jing/model/TwoFactorOTP.java](src/main/java/com/jing/model/TwoFactorOTP.java#L1-L200)

- **TwoFactorOtpServiceImpl**
  - Sets `expiresAt = now + 5 minutes` when creating an OTP.
  - Verifies OTP expiry on validation and deletes expired entries automatically.
  - File: [src/main/java/com/jing/service/TwoFactorOtpServiceImpl.java](src/main/java/com/jing/service/TwoFactorOtpServiceImpl.java#L1-L200)

- **AuthController changes**
  - Added endpoint `POST /auth/verify-signin/{otp}?id=...` — verifies signin OTP, returns the JWT from the stored OTP and deletes the OTP.
  - Added endpoint `POST /auth/forgot-password?email=...` — generates an OTP, emails it to the user, stores the OTP entry, returns `session` id and `otpExpiresAt`.
  - Added endpoint `POST /auth/verify-forgot/{otp}?id=...&newPassword=...` — verifies OTP and updates the user's password, then deletes OTP.
  - Responses now include `otpExpiresAt` (epoch ms) so clients can show remaining time.
  - File: [src/main/java/com/jing/controller/AuthController.java](src/main/java/com/jing/controller/AuthController.java#L1-L400)

- **EmailService**
  - Registered as a Spring `@Service` and uses a configured `JavaMailSender`.
  - Uses `spring.mail.username` (or configured default-from) as the From address.
  - File: [src/main/java/com/jing/service/EmailService.java](src/main/java/com/jing/service/EmailService.java#L1-L200)

- **SMTP configuration**
  - `application.properties` contains environment-aware SMTP placeholders:
    - `spring.mail.host`, `spring.mail.port`, `spring.mail.username`, `spring.mail.password`, and TLS settings read from env vars (e.g., `SMTP_HOST`, `SMTP_USERNAME`).
    - File: [src/main/resources/application.properties](src/main/resources/application.properties#L1-L200)

- **TwoFactorAuth model**
  - Added `sendToValue` to store the actual destination (email/phone) while preserving the existing `sendTo` `VerificationType` enum that indicates method (EMAIL/SMS).
  - File: [src/main/java/com/jing/model/TwoFactorAuth.java](src/main/java/com/jing/model/TwoFactorAuth.java#L1-L200)

- **UserService fixes**
  - Fixed `enableTwofactorAuthentication` signature and implementation to accept `User user` and store both `VerificationType` and destination value.
  - File: [src/main/java/com/jing/service/UserService.java](src/main/java/com/jing/service/UserService.java#L1-L200)

- **CHANGES and README**
  - Added `CHANGES.md` (existing) and this `CHANGES-2.0.md` summarizing the release.
  - File: [CHANGES-2.0.md](CHANGES-2.0.md)

## Runtime notes
- For dev/testing the app was started with a minimal `AppConfig` and a fallback `JavaMailSender` bean; replace `AppConfig` with your production security configuration before rolling out.
- The app was run on a random free port during local testing (set `server.port` to a fixed port if required).

## How OTP expiry works
- OTP entries have `expiresAt` (Instant). When validating, `TwoFactorOtpServiceImpl.verifyTwoFactorOtp()` checks expiry and deletes the OTP if expired. Verifications after expiry fail.
- Expiry period: **5 minutes** from OTP creation.

## How to enable real email delivery
1. Set environment variables or properties in `application.properties`:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_STARTTLS` (true/false)
2. Optionally set `SMTP_DEFAULT_FROM` or `spring.mail.username`.
3. Restart the app.

Example (Linux/macOS):
```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your.email@gmail.com
export SMTP_PASSWORD=your_smtp_password_or_app_token
export SMTP_STARTTLS=true
./mvnw spring-boot:run
```

## Example curl flows
- Request forgot OTP:
```bash
curl -X POST "http://localhost:<PORT>/auth/forgot-password?email=user@example.com"
# response: { "session": "<SESSION_ID>", "otpExpiresAt": 169... }
```
- Verify forgot OTP and reset password:
```bash
curl -X POST "http://localhost:<PORT>/auth/verify-forgot/<OTP>?id=<SESSION_ID>&newPassword=newpass"
```

## Recommended next steps
- Configure SMTP with a secure credentials mechanism (Vault, environment vars, or Kubernetes secrets).
- Add OTP cleanup background job to remove stale OTPs (optional; expired OTPs are deleted on validation attempts but stale unused records can remain).
- Replace the minimal `AppConfig` with your security settings.
- Add logging and metrics for OTP send/verify events.

---

**Last Updated**: December 14, 2025
