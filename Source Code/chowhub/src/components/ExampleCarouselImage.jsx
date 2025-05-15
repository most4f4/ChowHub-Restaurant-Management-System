export default function ExampleCarouselImage({ src, alt }) {
  return (
    <div>
      <img src={src} alt={alt} layout="responsive" width={1600} height={1000} />
    </div>
  );
}

