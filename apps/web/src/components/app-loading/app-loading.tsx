import { Spinner, SpinnerProps } from '@nextui-org/react';

interface AppLoadingProps {
  layout?: 'normal';
  loadingProps?: SpinnerProps;
}

export default function AppLoading({ loadingProps }: AppLoadingProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner {...loadingProps} />
    </div>
  );
}
