document.addEventListener("DOMContentLoaded", () => {
  // Intersection Observer for scroll animations
  const scrollElements = document.querySelectorAll(".animate-on-scroll");

  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };

  const displayScrollElement = (element) => {
    element.classList.add("appear");
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.15)) {
        displayScrollElement(el);
      }
    });
  };

  window.addEventListener("scroll", () => {
    handleScrollAnimation();
  });

  // Initial trigger for elements already in view
  setTimeout(handleScrollAnimation, 100);

  // Local Image Loader with Transition and Fallback handlers
  const loadLocalImages = () => {
    const images = document.querySelectorAll(".member-img, .member-page-img");
    
    const handleImageLoaded = (img) => {
      img.classList.add("loaded");
      const container = img.closest(".member-image-container, .member-page-img-card");
      if (container) {
        const fallback = container.querySelector(".member-fallback-avatar");
        if (fallback) {
          fallback.style.opacity = "0";
          setTimeout(() => { fallback.style.display = "none"; }, 300);
        }
        const loader = container.querySelector(".member-image-loading");
        if (loader) {
          loader.style.display = "none";
        }
      }
    };

    const handleImageFailed = (img) => {
      img.style.opacity = "0";
      const container = img.closest(".member-image-container, .member-page-img-card");
      if (container) {
        const fallback = container.querySelector(".member-fallback-avatar");
        if (fallback) {
          fallback.style.opacity = "0.75";
          fallback.style.display = "flex";
        }
        const loader = container.querySelector(".member-image-loading");
        if (loader) {
          loader.style.display = "none";
        }
      }
    };

    images.forEach(img => {
      if (img.complete) {
        if (img.naturalWidth > 0) {
          handleImageLoaded(img);
        } else {
          handleImageFailed(img);
        }
      } else {
        img.addEventListener("load", () => handleImageLoaded(img));
        img.addEventListener("error", () => handleImageFailed(img));
      }
    });
  };

  loadLocalImages();

  // Custom visual micro-interactions (magnetic effect on buttons / subtle mouse movement)
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0px, 0px)";
    });
  });

  // Hamburger Menu Handler
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle("active");
      nav.classList.toggle("active");
    });

    // Close menu when links are clicked (useful for anchors on same page)
    const navLinks = nav.querySelectorAll("a");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        nav.classList.remove("active");
      });
    });

    // Close menu when clicking anywhere outside
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove("active");
        nav.classList.remove("active");
      }
    });
  }

  // Lightbox Gallery Handler
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");

  if (lightbox && lightboxImg && lightboxClose) {
    const galleryContainer = document.getElementById("gallery-container");
    let galleryImages = [];
    let currentImgIndex = 0;

    // Initialize the gallery wrappers and populate images array
    if (galleryContainer) {
      const rawImages = Array.from(galleryContainer.querySelectorAll("img"));
      
      rawImages.forEach((img, index) => {
        const src = img.getAttribute("src");
        
        // Extract file name and clean it up to use as caption
        const fileName = src.split('/').pop();
        const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        const formattedCaption = nameWithoutExtension
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map(word => word.toUpperCase())
          .join(' ');

        // Wrap img in a .gallery-item element
        const itemDiv = document.createElement("div");
        itemDiv.className = "gallery-item";
        img.parentNode.insertBefore(itemDiv, img);
        itemDiv.appendChild(img);

        // Add dynamically created caption
        const captionDiv = document.createElement("div");
        captionDiv.className = "gallery-caption";
        captionDiv.textContent = formattedCaption;
        itemDiv.appendChild(captionDiv);

        // Handle image loading error
        img.onerror = () => {
          img.style.opacity = '0.2';
        };

        // Open lightbox on click
        itemDiv.addEventListener("click", () => {
          currentImgIndex = index;
          showImageInLightbox();
        });

        // Store reference for slide navigation
        galleryImages.push({
          src: src,
          alt: img.alt || formattedCaption,
          caption: formattedCaption
        });
      });
    }

    const showImageInLightbox = () => {
      const item = galleryImages[currentImgIndex];
      if (item) {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt;
        lightboxCaption.textContent = item.caption;
        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden"; // Disable scroll

        // Hide navigation arrows if there is only 1 image in the gallery
        if (galleryImages.length <= 1) {
          if (lightboxPrev) lightboxPrev.style.display = "none";
          if (lightboxNext) lightboxNext.style.display = "none";
        } else {
          if (lightboxPrev) lightboxPrev.style.display = "block";
          if (lightboxNext) lightboxNext.style.display = "block";
        }
      }
    };

    const navigateLightbox = (direction) => {
      if (galleryImages.length <= 1) return;
      currentImgIndex += direction;
      if (currentImgIndex < 0) {
        currentImgIndex = galleryImages.length - 1;
      } else if (currentImgIndex >= galleryImages.length) {
        currentImgIndex = 0;
      }
      showImageInLightbox();
    };

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateLightbox(1);
      });
    }

    // Keyboard Arrow Listeners
    document.addEventListener("keydown", (e) => {
      if (lightbox.style.display === "flex") {
        if (e.key === "ArrowLeft") {
          navigateLightbox(-1);
        } else if (e.key === "ArrowRight") {
          navigateLightbox(1);
        } else if (e.key === "Escape") {
          closeLightbox();
        }
      }
    });

    const closeLightbox = () => {
      lightbox.style.display = "none";
      document.body.style.overflow = "auto";
    };

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
});
