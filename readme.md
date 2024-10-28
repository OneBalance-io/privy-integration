# OneBalance + Privy integration

This repository contains a collection of snippets for integration of OneBalance through Privy.

Snippets can be found in the `snippets` directory.

Snippets use some third party libraries. The versions that the libraries that the snippets were tested with are included in the `package.json` at the root of the repository.

The snippets in this repository assume that you have already set up a Privy integration in your codebase, as per [Privy's "Quickstart" documentation](https://docs.privy.io/guide/react/quickstart). Additionally, the snippets assume that the user has a Privy embedded wallet, before the snippets are invoked.

Snippets:

- signing typed data with Privy

## Chains

Privy supports different chains. It is up to you as a developer to configure the chains you would like to support.

You can find documentation on how to support different chains on the [official Privy documentation](https://docs.privy.io/guide/react/configuration/networks#configuration).
