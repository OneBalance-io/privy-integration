# Signing typed data with Privy

> There are two different implementations that both have their own pros and cons from a code point of view, they are the same functionally. Snippets available at `sign-with-provider.ts` and `sign-with-hook.ts` files.

Before executing a quote that you have received from the OneBalance API - you will need to sign it with a wallet that you used as the `sessionKeyAddress` during OneBalance account creation.

The quote contains a number of `originChainOperations`, and an optional `destinationChainOperation`. Each operation needs to be signed individually. Each operation has a `signature` key on it that needs to be updated with the signature of the typed data signed by the aforementioned session key address.

As such, an example to sign a single quote could be something along the lines of:

```ts
const signQuote = (quote: Quote): Promise<Quote> => {
  const signOperation = async (
    operation: ChainOperation
  ): Promise<ChainOperation> => {
    const signature = await signTypedData({
      typedData: operation.typedDataToSign,
    });

    return {
      ...operation,
      userOp: { ...operation.userOp, signature },
    };
  };

  const signedQuote = {
    ...quote,
  };
  signedQuote.originChainsOperations = await Promise.all(
    quote.originChainsOperations.map(signOperation)
  );
  if (quote.destinationChainOperation) {
    signedQuote.destinationChainOperation = await signOperation(
      quote.destinationChainOperation
    );
  }
  return signedQuote;
};
```

In the example above - the `Quote` interface corresponds to a JSON parsed response from one of OneBalance API's quote endpoints.

The two mentioned snippets contain the different version of the `signTypedData` functions. Below, is an explanation of each snippet version.

## Signing with provider

> The explanation of `sign-with-provider.ts` snippet.

Example usage of the snippet:

```ts
import { useWallets } from "@privy-io/react-auth";
import { signTypedDataWithWallet } from "./sign-with-provider.ts";

const { wallets } = useWallets();
const embeddedWallet = wallets.find(
  (wallet) => wallet.walletClientType === "privy"
);

const signTypedData = signTypedDataWithWallet(embeddedWallet);
```

This snippet uses the connected wallet returned by Privy's `useWallets` hook to obtain an Ethereum Provider, and sign the typed data with `viem` internally. The resulting `signTypedData` function in the example above can be used as a `signTypedData` function from the code example in the `signQuote` function from the previous section.

Full example of `signQuote`:

```ts
import { useWallets } from "@privy-io/react-auth";
import { signTypedDataWithWallet } from "./sign-with-provider.ts";

const { wallets } = useWallets();
const embeddedWallet = wallets.find(
  (wallet) => wallet.walletClientType === "privy"
);

const signTypedData = signTypedDataWithWallet(embeddedWallet);

const signQuote = (quote: Quote): Promise<Quote> => {
  const signOperation = async (
    operation: ChainOperation
  ): Promise<ChainOperation> => {
    const signature = await signTypedData({
      typedData: operation.typedDataToSign,
    });

    return {
      ...operation,
      userOp: { ...operation.userOp, signature },
    };
  };

  const signedQuote = {
    ...quote,
  };
  signedQuote.originChainsOperations = await Promise.all(
    quote.originChainsOperations.map(signOperation)
  );
  if (quote.destinationChainOperation) {
    signedQuote.destinationChainOperation = await signOperation(
      quote.destinationChainOperation
    );
  }
  return signedQuote;
};
```

## Signing with a hook

> The explanation of `sign-with-hook.ts` snippet.

The `useAsyncSignTypedData` function in the snippet returns a function that can directly be used as a `signTypedData` function from the code example in the `signQuote` function from the previous section.

Internally, the function proxies a call to a function returned by Privy's `useSignedTypedData` hook. However, the snippet turns Privy's function into an async Promise-returning function, to align with a standard async interface required by the `signQuote` function example.

Full example of `signQuote`:

```ts
const signTypedData = useAsyncSignTypedData();

const signQuote = (quote: Quote): Promise<Quote> => {
  const signOperation = async (
    operation: ChainOperation
  ): Promise<ChainOperation> => {
    const signature = await signTypedData({
      typedData: operation.typedDataToSign,
    });

    return {
      ...operation,
      userOp: { ...operation.userOp, signature },
    };
  };

  const signedQuote = {
    ...quote,
  };
  signedQuote.originChainsOperations = await Promise.all(
    quote.originChainsOperations.map(signOperation)
  );
  if (quote.destinationChainOperation) {
    signedQuote.destinationChainOperation = await signOperation(
      quote.destinationChainOperation
    );
  }
  return signedQuote;
};
```
