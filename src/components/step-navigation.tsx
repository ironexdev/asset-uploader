interface StepNavigationProps {
  step: 1 | 2;
}

const StepNavigation = ({ step }: StepNavigationProps) => (
  <div className="flex space-x-2">
    <div
      className={`${
        step === 1 ? "text-highlightedText" : "bg-secondary"
      } text-md text-md flex h-[48px] w-[150px] items-center justify-center text-center font-bold`}
    >
      STEP 1 - MODIFY
    </div>
    <div
      className={`${
        step === 2 ? "text-highlightedText" : "bg-secondary"
      } text-md text-m flex w-[150px] items-center justify-center text-center font-bold`}
    >
      STEP 2 - UPLOAD
    </div>
  </div>
);

export default StepNavigation;
