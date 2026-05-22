import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <h1 className="font-display text-4xl text-white">CareerCompass Blog</h1>
      <p className="mt-2 text-white/65">Guides for Karnataka students</p>
      <ul className="mt-10 space-y-4">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link href={"/blog/" + post.slug} className="block rounded-2xl border border-white/10 bg-[#12121F] p-5 hover:border-[#FF6B35]/40">
              <h2 className="font-display text-xl text-white">{post.title}</h2>
              <p className="mt-2 text-sm text-white/60">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
