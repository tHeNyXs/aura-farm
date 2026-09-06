"use client";

import { useRouter } from "next/navigation";

interface CropBackButtonProps {
  analysisId?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function CropBackButton({
  analysisId,
  className,
  children,
}: CropBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (analysisId) {
      router.push(`/analyze/result/${analysisId}/crops`);
    } else {
      router.push("/analyze");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className || "hover:underline flex items-center gap-1 cursor-pointer"}
    >
      {children || (
        <>
          <span>←</span>
          <span>กลับไปหน้าผลวิเคราะห์</span>
        </>
      )}
    </button>
  );
}
