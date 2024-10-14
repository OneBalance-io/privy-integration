import {
  createKernelAccount,
  KernelAccountAbi,
  KernelValidator,
} from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import {
  Address,
  Chain,
  Client,
  createPublicClient,
  encodeAbiParameters,
  Hex,
  http,
} from "viem";
import { readContract } from "viem/actions";
import { getAction } from "viem/utils";

const VALIDATOR_ADDRESS = "0xd3BF1de562ABD2F696f7FA7c2C4fe83ed130276E";
const KERNEL_VERSION = "0.3.1" as const;
/**
 * Below cosigner address is for the OneBalance "Development" environment.
 */
const COSIGNER_ADDRESS = "0x78264308AD049116F52162822801B5EBFd8F5ceA";

export const initializeOneBalanceAccount = async ({
  chain,
  adminKeyAddress,
  sessionKeyAddress,
}: {
  chain: Chain;
  adminKeyAddress: Address;
  sessionKeyAddress: Address;
}): Promise<Address> => {
  const account = await createSmartAccount({
    originChain: chain,
    signers: [
      {
        address: sessionKeyAddress,
        role: SignerRole.SessionKey,
      },
      {
        address: adminKeyAddress,
        role: SignerRole.UserAdmin,
      },
      {
        address: COSIGNER_ADDRESS,
        role: SignerRole.CoSigner,
      },
    ],
  });

  return account.address;
};

enum SignerRole {
  NA,
  CoSigner,
  SessionKey,
  UserAdmin,
}

async function createSmartAccount(props: {
  originChain: Chain;
  signers: {
    address: Address;
    role: SignerRole;
  }[];
}) {
  const url = props.originChain.rpcUrls.default.http[0];

  const publicClient = createPublicClient({
    transport: http(url),
  });

  const roleValidatorClass = new RoleBasedEcdsaValidatorService();
  const roleValidator = await roleValidatorClass.createRoleBasedECDSAValidator(
    publicClient,
    props.signers
  );

  return await createKernelAccount(publicClient, {
    plugins: {
      sudo: roleValidator,
    },
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    kernelVersion: KERNEL_VERSION,
  });
}

class RoleBasedEcdsaValidatorService {
  async createRoleBasedECDSAValidator(
    client: Client,
    signers: {
      address: Address;
      role: SignerRole;
    }[] = []
  ): Promise<
    KernelValidator<ENTRYPOINT_ADDRESS_V07_TYPE, "RoleBasedECDSAValidator">
  > {
    return {
      signMessage: () => {
        throw new Error("signMessage is not implemented");
      },
      signTransaction: () => {
        throw new Error("signTransaction is not implemented");
      },
      signTypedData: () => {
        throw new Error("signTypedData is not implemented");
      },
      signUserOperation: () => {
        throw new Error("signUserOperation is not implemented");
      },
      publicKey: "0x",
      type: "local",
      validatorType: "SECONDARY",
      address: VALIDATOR_ADDRESS,
      source: "RoleBasedECDSAValidator",
      supportedKernelVersions: ">=0.3.0",
      getIdentifier: () => VALIDATOR_ADDRESS,

      async getEnableData() {
        const onInstallArguments: [Address[], SignerRole[]] = [
          signers.map((signer) => signer.address) ?? [],
          signers.map((signer) => signer.role) ?? [],
        ];

        return encodeAbiParameters(
          [{ type: "address[]" }, { type: "uint8[]" }],
          onInstallArguments
        );
      },

      async getNonceKey(_accountAddress?: Address, customNonceKey?: bigint) {
        if (customNonceKey) {
          return customNonceKey;
        }
        return 0n;
      },

      async getDummySignature() {
        return "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000004150da61f147d4cc01e6ab632e0415d71c75d6d1f70064dbf871ae07ca6d92bbf11335330b77e3e0909575fb83cc1eead1c88cef14aa8e72243d3a87365a2035801c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000041f4ad59871cfaa16cfc70a4550b30ea24d987a0dd75a2780ce994a9e8989140ac166933874d60e86b1e65ca0850c1261bd1ad4403cc00d2ff63bc54df098d971c1c00000000000000000000000000000000000000000000000000000000000000";
      },

      async isEnabled(
        kernelAccountAddress: Address,
        selector: Hex
      ): Promise<boolean> {
        try {
          const execDetail = await getAction(
            client,
            readContract,
            "readContract"
          )({
            abi: KernelAccountAbi,
            address: kernelAccountAddress,
            functionName: "getExecution",
            args: [selector],
          });
          return (
            execDetail.validator.toLowerCase() ===
            VALIDATOR_ADDRESS?.toLowerCase()
          );
        } catch {
          return false;
        }
      },
    };
  }
}
