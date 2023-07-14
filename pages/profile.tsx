import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface ImageData {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  blurDataURL: string;
  liked: boolean;
}

const Home: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const loadingRef = useRef<HTMLDivElement>(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.unsplash.com/photos?per_page=5&page=${page}&client_id=OZpldDuCQN6lrESALytz4tkD_PbolTwyZygLdpDosFE`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      const newImages = data.map((image: any) => ({
        id: image.id,
        title: image.alt_description || '',
        category: image.categories && image.categories[0]?.title || 'Uncategorized',
        imageUrl: image.urls?.regular || '',
        blurDataURL: image.urls?.thumb || '',
        liked: false,
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page]);

  useEffect(() => {
    const allCategories = images.map((image) => image.category);
    const uniqueCategories = Array.from(new Set(allCategories));
    setCategories(uniqueCategories);
  }, [images]);

  useEffect(() => {
    setPage(1); // Reset page to 1 when category or search query changes
    setImages([]); // Clear existing images
    fetchImages(); // Fetch images based on the new category or search query
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading) {
        observer.unobserve(target.target); // Stop observing the target element
        setPage((prevPage) => prevPage + 1);
      }
    }, options);

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [isLoading]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDoubleClick = (imageId: string) => {
    setImages((prevImages) =>
      prevImages.map((image) => {
        if (image.id === imageId) {
          return { ...image, liked: !image.liked };
        }
        return image;
      })
    );
  };

  const filteredImages = images.filter((image) => {
    if (selectedCategory && image.category !== selectedCategory) {
      return false;
    }
    if (searchQuery && !image.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="container">
      <h1 className="title">Image Gallery</h1>
      <div className="filters">
        <select className="select" value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title"
        />
      </div>
      <div className="gallery">
        {filteredImages.map((image) => (
          <div key={image.id} className={`image-container ${image.liked ? 'liked' : ''}`}>
            <div
              className="image-wrapper"
              onDoubleClick={() => handleDoubleClick(image.id)}
            >
              <Image
                src={image.imageUrl}
                alt={image.title}
                width={300}
                height={200}
                blurDataURL={image.blurDataURL}
                placeholder="blur"
                className="image"
              />
              <p className="image-title">{image.title}</p>
              {image.liked && <span className="like-symbol">Liked!</span>}
            </div>
          </div>
        ))}
        {isLoading && <p>Loading...</p>}
        <div ref={loadingRef}></div>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .filters {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .select {
          margin-right: 10px;
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        .search {
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          grid-gap: 20px;
        }

        .image-container {
          position: relative;
          border: 1px solid #ccc;
          border-radius: 4px;
          overflow: hidden;
        }

        .image-wrapper {
          position: relative;
          cursor: pointer;
        }

        .image-title {
          margin: 10px 0;
        }

        .like-symbol {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #fff;
          padding: 5px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default Home;
