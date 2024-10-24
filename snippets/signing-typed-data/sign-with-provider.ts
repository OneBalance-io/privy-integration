import { Address, createWalletClient, custom, Hash } from "viem";
import { ConnectedWallet } from "@privy-io/react-auth";

export const signTypedDataWithWallet =
  (embeddedWallet: ConnectedWallet) =>
  async (typedData: any): Promise<Hash> => {
    const provider = await embeddedWallet.getEthereumProvider();
    const walletClient = createWalletClient({
      transport: custom(provider),
      account: embeddedWallet.address as Address,
    });

    return walletClient.signTypedData(typedData);
  };
