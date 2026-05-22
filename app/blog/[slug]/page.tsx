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
      <Link href="/games" className="mt-10 inline-block rounded-xl bg-[#FF6B35] px-6 py-3 text-[#080814]">
        Discover your career match
      </Link>
    </div>
  );
}
