import Image from "next/image";

interface Post {
  title: string;
  media: string;
  type: string;
}

export default function CreatorPostsPreview({ posts }: { posts: Post[] }) {
  if (!posts.length)
    return (
      <div className="h-32 bg-muted flex items-center justify-center text-sm text-muted-foreground">
        No posts yet
      </div>
    );

  const sanitizeCID = (media: string) => {
    if (!media) return "";
    // Remove "ipfs://" if present, and any accidental "https://ipfs.io/ipfs/" patterns
    return media
      .replace(/^ipfs:\/\//i, "")
      .replace(/^https?:\/\/[^/]+\/ipfs\//i, "")
      .trim();
  };

  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {posts.map((p, i) => {
        const cid = sanitizeCID(p.media);
        const imageSrc = cid
          ? `https://gateway.pinata.cloud/ipfs/${cid}`
          : "/default.webp";

        return (
          <div key={i} className="relative group overflow-hidden rounded-md">
            <Image
              src={imageSrc}
              alt={p.title}
              width={200}
              height={200}
              className="object-cover h-28 w-full blur-sm group-hover:blur-none transition-all"
            />
            <div className="absolute inset-0 bg-black/70 flex font-semibold items-center justify-center opacity-0 group-hover:opacity-100 text-xs text-white text-center p-1 transition-all">
              {p.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}
