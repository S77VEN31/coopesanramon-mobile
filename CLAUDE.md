# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile banking app for Coopesanramon (Costa Rican credit union). Built with Expo 54, React Native 0.81, TypeScript, and Zustand. All UI text is in Spanish.

## Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web
npm run build:dev      # EAS development build
npm run clean          # Clear caches
npm run clean:full     # Full cache clear (watchman + metro + tmp)
npm run prebuild:clean # Clean native prebuild
```

No test framework or linter is configured.

## Architecture

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json and babel.config.js).

### Navigation

React Navigation v7 with auth-gated navigation in `src/navigation/AppNavigator.tsx`:
- **Not authenticated** → AuthStack (Login)
- **Authenticated** → MainStack with DrawerNavigator (Dashboard, Accounts, Movements, Transfers, Loans, TimeDeposits, FavoriteAccounts) plus additional stack screens (AccountDetail, MyLoans, PaymentPlan, Payments, MyInvestments, Coupons, MyFavoriteAccounts)

Navigation types are defined in `src/navigation/types.ts`.

### State Management (Zustand)

All stores live in `src/lib/states/` and follow this pattern:

```typescript
export const useExampleStore = create<StateInterface>()(
  devtools(
    (set, get) => ({
      data: [],
      isLoading: false,
      error: null,
      load: async () => { /* ... */ },
      clear: () => { /* ... */ },
    }),
    { name: 'ExampleStore', enabled: __DEV__ }
  )
);
```

Key stores: `auth.store`, `accounts.store`, `movements.store`, `loans.store`, `investments.store`, `secondFactor.store`, `internalTransfers.store`, `sinpeTransfers.store`, `sinpeMovilTransfers.store`.

On logout, `src/lib/utils/store-cleanup.ts` (`clearAllStores()`) resets every store.

### API Layer

`src/services/api.ts` — custom fetch-based client with Bearer token auth, `ApiException` error class, and debug logging toggle (`DEBUG_LOGGING`).

```
api.get<T>(endpoint, requiresAuth?)
api.post<T>(endpoint, body?, requiresAuth?)
api.put<T>(endpoint, body?, requiresAuth?)
api.delete<T>(endpoint, requiresAuth?)
```

Domain-specific API functions are in `src/services/api/*.api.ts` (accounts, favorites, transfers, loans, investments, secondFactor). Shared auth helpers (token save/get/remove, login, JWT decode) are in `shared.api.ts`.

Auth errors: 401 triggers logout; 403 checks `codigoRespuesta` before deciding to logout. Error messages are mapped from `src/constants/api.errors.ts` (Spanish).

### Authentication Flow

1. Login via `shared.api.ts` → receives JWT `access_token`
2. Token stored in `expo-secure-store`
3. JWT payload decoded client-side (server validates signature)
4. 60-second expiration margin applied
5. Device metadata (OS, model, brand, IP via ipify) sent with login

### Color Scheme / Dark Mode

Components accept an optional `colorScheme` prop. Helper functions in `App.tsx` provide themed colors: `getBackgroundColor()`, `getTextColor()`, `getSecondaryTextColor()`, `getBorderColor()`, `getCardBackgroundColor()`, `getInputBackgroundColor()`.

Brand primary color: `#a61612`.

### Key Conventions

- **Component files**: PascalCase. **Utility/hook files**: kebab-case.
- **Stores**: named `use<Name>Store`.
- **Enums**: centralized in `src/constants/enums.ts` (account types, transaction types, loan types, transfer operations, challenge types, etc.).
- **Format utilities** in `src/lib/utils/format.utils.ts`: `formatCurrency`, `formatIBAN`, `formatDate`, `formatDateTime`, `formatDateForApiStart`, `formatDateForApiEnd`.
- **Transfer hooks** (`src/hooks/`): `use-local-transfer`, `use-sinpe-transfer`, `use-sinpe-movil-transfer` encapsulate multi-step transfer flows.
- **2FA**: managed via `secondFactor.store` and `use-operations-with-challenge` hook. OTP input component at `src/components/ui/OTPInput.tsx`.
- **UI components** in `src/components/ui/`: Button (variants: default/outline/ghost/destructive), Card, Input, MaskedInput, Modal (success/error/warning/info), IbanInput.
- **SVG support**: configured via `react-native-svg-transformer` in `metro.config.js`.
