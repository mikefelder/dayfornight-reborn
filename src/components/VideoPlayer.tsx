interface VideoPlayerProps {
  src: string;
  title?: string;
  width?: number;
  height?: number;
}

export default function VideoPlayer({ src, title = 'Video', width = 640, height = 360 }: VideoPlayerProps) {
  // Normalize YouTube/Vimeo URLs to embed format
  let embedSrc = src;
  const youtubeMatch = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) {
    embedSrc = `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`;
  }
  const vimeoMatch = src.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return (
    <div className="video-player-wrapper" style={{ position: 'relative', paddingBottom: `${(height / width) * 100}%`, height: 0, overflow: 'hidden' }}>
      <iframe
        src={embedSrc}
        title={title}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
