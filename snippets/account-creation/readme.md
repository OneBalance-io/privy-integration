# OneBalance account creation

> Snippet available at `account-creation.ts`.

The snippet contains an `initializeOneBalanceAccount` function, that can be called from your client-side application, to create a OneBalance account. The function returns an address of the OneBalance account. This address can be used as the deposit address for the OneBalance account. It is worth noting that this will not actually deploy the OneBalance account on any chains - that only happens during the first transaction.

OneBalance accounts are based on three keys - a session key, an admin key, and a co-signer key. Your application is in charge of the session and the admin keys. When initializing a OneBalance account with the `initializeOneBalanceAccount` function - you need to provide the addresses of the session and admin keys.

Below is an example of OneBalance account initialization by using Privy embedded wallet as the session key.

```ts
import { useWallets } from "@privy-io/react-auth";
import { Address } from "viem";
import { sepolia } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const { wallets } = useWallets();
const embeddedWallet = wallets.find(
  (wallet) => wallet.walletClientType === "privy"
);
const depositAddress = await initializeOneBalanceAccount({
  sessionKeyAddress: embeddedWallet.address as Address,

  // chain and admin key address are here for completeness. Below are just example values.
  chain: sepolia,
  // below is a random ETH address, please change this as per your requirements.
  adminKeyAddress: "0xc162a3cE45ad151eeCd0a5532D6E489D034aB3B8",
});
```

In the example above - we use Privy's `useWallets` react hook, to get ahold of all user's wallets. Among them - we find the Privy embedded wallet. That wallet's address is then passed as the session key address into the `initializeOneBalanceAccount` function.
In the interest of completeness - the snippet uses a sepolia chain, and a randomly generated admin key address. The specific implementation of the chain and admin key - is left up to the developer.
