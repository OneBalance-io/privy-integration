import { useRef } from "react";
import { useSignTypedData } from "@privy-io/react-auth";

/**
 * For wrapping a function that is callback-based, to make it Promise-based
 */
const useMakeCallbackAsync = <
  SuccessFn extends () => any,
  ErrorFn extends () => any = any
>() => {
  const resolveCallback = useRef<(...p: Parameters<SuccessFn>) => void>();
  const rejectCallback = useRef<(...p: Parameters<ErrorFn>) => void>();

  const onSuccess = (...args: Parameters<SuccessFn>) => {
    resolveCallback.current?.(...args);
  };
  const onError = (...args: Parameters<ErrorFn>) => {
    rejectCallback.current?.(...args);
  };

  return {
    onSuccess,
    onError,
    wrapInPromise: <Args extends any[]>(run: (...args: Args) => void) => {
      return {
        runAsAsync: (...args: Args): Promise<ReturnType<SuccessFn>> => {
          return new Promise((resolve, reject) => {
            resolveCallback.current = resolve as SuccessFn;
            rejectCallback.current = reject as ErrorFn;
            run(...args);
          });
        },
      };
    },
  };
};

export const useAsyncSignTypedData = () => {
  const { wrapInPromise, onSuccess, onError } =
    useMakeCallbackAsync<() => string>();
  const { signTypedData } = useSignTypedData({
    onSuccess,
    onError,
  });
  const { runAsAsync } = wrapInPromise(signTypedData);

  return runAsAsync;
};
