import React, { forwardRef } from 'react';

export interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
}

/**
 * Generate high-performance responsive Unsplash srcSet
 * Covers typical modern viewport tiers: 640w, 960w, 1280w, 1600w, 2200w
 */
export function buildUnsplashSrcSet(
  src: string,
  widths: number[] = [640, 960, 1280, 1600, 2200]
): string {
  if (!src || !src.includes('images.unsplash.com')) {
    return '';
  }

  try {
    const url = new URL(src);
    url.searchParams.delete('w');
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    if (!url.searchParams.has('q')) {
      url.searchParams.set('q', '80');
    }

    return widths
      .map((w) => {
        const u = new URL(url.toString());
        u.searchParams.set('w', w.toString());
        return `${u.toString()} ${w}w`;
      })
      .join(', ');
  } catch {
    // Fallback if URL parsing fails
    const cleanBase = src.replace(/([?&])w=\d+/, '');
    const sep = cleanBase.includes('?') ? '&' : '?';
    return widths
      .map((w) => `${cleanBase}${sep}w=${w}&auto=format&fit=crop ${w}w`)
      .join(', ');
  }
}

export const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(
  (
    {
      src,
      alt,
      sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px',
      priority = false,
      loading,
      className = '',
      aspectRatio,
      style,
      ...rest
    },
    ref
  ) => {
    const srcSet = buildUnsplashSrcSet(src);
    const effectiveLoading = priority ? 'eager' : (loading ?? 'lazy');
    const effectiveFetchPriority = priority ? 'high' : 'auto';
    const effectiveDecoding = priority ? 'sync' : 'async';

    return (
      <img
        ref={ref}
        src={src}
        srcSet={srcSet || undefined}
        sizes={sizes}
        alt={alt}
        loading={effectiveLoading}
        fetchPriority={effectiveFetchPriority}
        decoding={effectiveDecoding}
        className={className}
        style={{
          ...(aspectRatio ? { aspectRatio } : {}),
          ...style,
        }}
        {...rest}
      />
    );
  }
);

ResponsiveImage.displayName = 'ResponsiveImage';
