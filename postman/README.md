# Postman API tests

The project had no Postman collection checked into the repository. This collection covers the routes currently registered by the backend:

- Health check
- Authentication, profile, password change, refresh, logout, and password recovery
- Public categories, product search/filter/detail, and shop detail/list
- Client-only shop follow and idempotency
- Admin-only user and inventory endpoints, including product status, bulk actions, and soft delete
- Expected rejection cases for invalid input and insufficient roles

## Import into Postman

Import both files from this directory:

- `rikkei-ecommerce.postman_collection.json`
- `local.postman_environment.json`

Select the **Rikkei E-Commerce - Local** environment. The default API URL is `http://localhost:18080`; change `baseUrl` to `http://localhost:8080` if Compose uses its default backend port. The environment contains the local-only seed account password; never reuse it outside the local database.

## Prepare and run

From the repository root in PowerShell:

```powershell
docker compose up -d
.\database\seed-local.ps1
```

Run the full collection in Postman Collection Runner. The run registers a CLIENT named `postman-<timestamp>@example.test` and changes its password; this generated account remains in the local database. Admin inventory tests toggle and soft-delete the dedicated local fixture `960009`. To repeat the run, re-run the seed script first; it restores this fixture and the seed accounts. Use only a disposable local/test database.

The valid OTP verification/reset requests are in the separate **Manual Password Reset (requires OTP)** folder. Development OTP is intentionally not exposed by the API; trigger the recovery request, read the code with `docker compose logs backend`, set environment variable `resetOtp`, and run that folder manually. Clear `resetOtp` afterward. Invalid OTP shape is included in the normal test run.

## Run from the command line

With Node.js/npm installed, Newman can execute the same collection:

```powershell
npx --yes newman run .\postman\rikkei-ecommerce.postman_collection.json `
  --environment .\postman\local.postman_environment.json `
  --reporters cli
```

Newman does not require adding a runtime dependency to the backend or frontend. The collection must only target a disposable local/test database: it creates users and modifies/deletes test fixtures.

To run the main collection and, when the local backend has `APP_ENV=development`, automatically retrieve the test account's OTP from local backend logs and run the successful verification/reset flow. This helper refuses non-loopback hosts and non-development backends:

```powershell
.\postman\run-local-tests.ps1
```

Run `.\database\seed-local.ps1` before the collection to restore its test fixtures. The helper keeps its temporary environment (including the OTP) outside the repository and removes it when finished.
