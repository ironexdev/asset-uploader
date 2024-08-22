interface StepNavigationProps {
  step: 1 | 2;
}

const StepNavigation = ({ step }: StepNavigationProps) => (
  <div className="flex space-x-2">
    <div
      className={`${
        step === 1 ? "text-primary" : "text-secondary"
      } flex h-[48px] w-[150px] items-center justify-center text-center text-sm font-bold`}
    >
      STEP 1 - MODIFY
    </div>
    <div
      className={`${
        step === 2 ? "text-primary" : "text-secondary"
      } flex w-[150px] items-center justify-center text-center text-sm font-bold`}
    >
      STEP 2 - UPLOAD
    </div>
  </div>
);

export default StepNavigation;
