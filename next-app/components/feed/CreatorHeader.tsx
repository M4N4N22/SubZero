import Image from "next/image";

interface CreatorHeaderProps {
  name: string | null;
  avatar: string | null;
  address: string;
}

export default function CreatorHeader({
  name,
  avatar,
  address,
}: CreatorHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
        {avatar ? (
          <Image
            src={`https://gateway.pinata.cloud/ipfs/${avatar}`}
            alt={name ?? "Creator Avatar"}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        ) : (
          <Image
            src={"/default.webp"}
            alt={"Creator"}
            width={56}
            height={56}
            className="rounded-full object-cover w-full h-full"
          />
        )}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="font-medium">{name ?? "Unknown Creator"}</span>

        <span className="text-xs text-muted-foreground">
          {address.slice(0, 10)}...
        </span>
      </div>
    </div>
  );
}
