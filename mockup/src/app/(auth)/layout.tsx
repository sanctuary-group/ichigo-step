import { StrawberryIcon } from "@/components/strawberry-icon";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="grid place-items-center size-10 rounded-xl bg-primary/10">
            <StrawberryIcon className="size-5" />
          </div>
          <div className="text-xl font-bold">ichigo-step</div>
        </div>
        {children}
      </div>
    </div>
  );
}
