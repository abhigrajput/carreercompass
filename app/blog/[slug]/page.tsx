import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-posts";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: "Blog" };
  return { title: post.title, description: post.description };
}

export default function BlogPostPage({ params }: Props) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-24 prose prose-invert">
      <h1 className="font-display text-4xl text-white">{post.title}</h1>
      <p className="text-white/50">{post.date} · {post.readMinutes} min read</p>
      {post.content.map((para) => (
        <p key={para.slice(0, 24)} className="mt-4 text-white/80">{para}</p>
      ))}
      {post.relatedLinks?.length ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#12121F] p-5">
          <p className="mb-3 text-sm font-semibold text-white">Related links</p>
          <div className="flex flex-wrap gap-3">
            {post.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-[#FF6B35]/30 px-4 py-2 text-sm text-[#FF6B35]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <Link href="/games" className="mt-10 inline-block rounded-xl bg-[#FF6B35] px-6 py-3 text-[#080814]">
        Discover your career match
      </Link>
    </div>
  );
}
