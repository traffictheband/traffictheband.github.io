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

  // ═══════════════════════════════════════════════════════════
  // Lightbox Gallery Handler (fully optimized for 300+ images)
  // ═══════════════════════════════════════════════════════════
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxLoader = document.getElementById("lightbox-loader");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");

  if (lightbox && lightboxImg && lightboxClose) {
    const galleryContainer = document.getElementById("gallery-container");
    const galleryLoading = document.getElementById("gallery-loading");
    const galleryEmpty = document.getElementById("gallery-empty");
    const galleryToolbar = document.getElementById("gallery-toolbar");
    const galleryCountText = document.getElementById("gallery-count-text");
    const galleryFilter = document.getElementById("gallery-filter");
    const galleryNoResults = document.getElementById("gallery-no-results");
    const scrollSentinel = document.getElementById("gallery-scroll-sentinel");
    const backToTop = document.getElementById("back-to-top");

    let allGalleryImages = [];   // Complete manifest [{src, thumb, caption, filename}]
    let galleryImages = [];      // Currently active set (after filter)
    let currentImgIndex = 0;
    let renderedCount = 0;
    const BATCH_SIZE = 24;
    let isLoadingBatch = false;
    let filterQuery = '';

    // ── Caption from filename ──
    const captionFromFilename = (filename) => {
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
      return nameWithoutExt
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // ── Counter update ──
    const updateCounter = () => {
      if (galleryCountText) {
        const showing = Math.min(renderedCount, galleryImages.length);
        const filterNote = filterQuery ? ` matching "${filterQuery}"` : '';
        galleryCountText.textContent = `[ ${showing} / ${galleryImages.length}${filterNote} ]`;
      }
      if (galleryToolbar) galleryToolbar.style.display = 'flex';
    };

    // ── Lazy-load observer (with thumbnail→full fallback) ──
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const thumbSrc = img.dataset.src;
          const fullSrc = img.dataset.full;
          if (thumbSrc) {
            img.src = thumbSrc;
            img.removeAttribute('data-src');

            img.addEventListener('load', () => {
              img.classList.add('gallery-img-loaded');
              const shimmer = img.parentElement?.querySelector('.gallery-shimmer');
              if (shimmer) shimmer.remove();
            }, { once: true });

            img.addEventListener('error', () => {
              // Fallback: try full-res image if thumb failed
              if (fullSrc && img.src !== fullSrc) {
                img.src = fullSrc;
                img.addEventListener('load', () => {
                  img.classList.add('gallery-img-loaded');
                  const shimmer = img.parentElement?.querySelector('.gallery-shimmer');
                  if (shimmer) shimmer.remove();
                }, { once: true });
                img.addEventListener('error', () => {
                  // Both failed — show broken placeholder
                  showBrokenPlaceholder(img);
                }, { once: true });
              } else {
                showBrokenPlaceholder(img);
              }
            }, { once: true });
          }
          lazyObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '300px 0px',
      threshold: 0.01
    });

    // ── Broken image placeholder ──
    const showBrokenPlaceholder = (img) => {
      img.style.display = 'none';
      const shimmer = img.parentElement?.querySelector('.gallery-shimmer');
      if (shimmer) shimmer.remove();
      const placeholder = document.createElement('div');
      placeholder.className = 'gallery-broken';
      placeholder.innerHTML = '<span>✕</span><small>failed</small>';
      img.parentElement?.appendChild(placeholder);
    };

    // ── Build a single gallery item DOM node ──
    const createGalleryItem = (item, absoluteIndex) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'gallery-item';
      itemDiv.dataset.caption = item.caption.toLowerCase();

      const shimmer = document.createElement('div');
      shimmer.className = 'gallery-shimmer';
      itemDiv.appendChild(shimmer);

      const img = document.createElement('img');
      img.dataset.src = item.thumb;
      img.dataset.full = item.src;
      img.alt = item.caption;
      img.className = 'gallery-img-lazy';
      img.loading = 'lazy';
      itemDiv.appendChild(img);

      const captionDiv = document.createElement('div');
      captionDiv.className = 'gallery-caption';
      captionDiv.textContent = item.caption;
      itemDiv.appendChild(captionDiv);

      itemDiv.addEventListener('click', () => {
        currentImgIndex = absoluteIndex;
        showImageInLightbox();
      });

      lazyObserver.observe(img);
      return itemDiv;
    };

    // ── Render next batch ──
    const renderBatch = () => {
      if (renderedCount >= galleryImages.length || isLoadingBatch) return;
      isLoadingBatch = true;

      const fragment = document.createDocumentFragment();
      const batchEnd = Math.min(renderedCount + BATCH_SIZE, galleryImages.length);

      for (let i = renderedCount; i < batchEnd; i++) {
        fragment.appendChild(createGalleryItem(galleryImages[i], i));
      }

      galleryContainer.appendChild(fragment);
      renderedCount = batchEnd;
      isLoadingBatch = false;
      updateCounter();

      if (renderedCount >= galleryImages.length && scrollSentinel) {
        scrollSentinel.style.display = 'none';
      }
    };

    // ── Infinite scroll observer ──
    let scrollObserver = null;
    const setupInfiniteScroll = () => {
      if (!scrollSentinel) return;
      if (scrollObserver) scrollObserver.disconnect();

      scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && renderedCount < galleryImages.length) {
            renderBatch();
          }
        });
      }, { rootMargin: '500px 0px', threshold: 0.01 });

      scrollObserver.observe(scrollSentinel);
    };

    // ── Clear and rebuild gallery grid ──
    const rebuildGallery = () => {
      // Remove all gallery items but keep loading/empty elements
      const items = galleryContainer.querySelectorAll('.gallery-item');
      items.forEach(el => {
        const imgs = el.querySelectorAll('img');
        imgs.forEach(img => lazyObserver.unobserve(img));
        el.remove();
      });
      renderedCount = 0;

      if (galleryImages.length === 0) {
        if (galleryNoResults) galleryNoResults.style.display = filterQuery ? 'flex' : 'none';
        if (galleryEmpty) galleryEmpty.style.display = filterQuery ? 'none' : 'flex';
        if (scrollSentinel) scrollSentinel.style.display = 'none';
        updateCounter();
        return;
      }

      if (galleryNoResults) galleryNoResults.style.display = 'none';
      if (galleryEmpty) galleryEmpty.style.display = 'none';

      renderBatch();

      if (galleryImages.length > BATCH_SIZE && scrollSentinel) {
        scrollSentinel.style.display = 'flex';
        setupInfiniteScroll();
      } else if (scrollSentinel) {
        scrollSentinel.style.display = 'none';
      }
    };

    // ── Filter / search with debounce ──
    let filterTimeout = null;
    if (galleryFilter) {
      galleryFilter.addEventListener('input', () => {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
          filterQuery = galleryFilter.value.trim().toLowerCase();
          if (filterQuery) {
            galleryImages = allGalleryImages.filter(img =>
              img.caption.toLowerCase().includes(filterQuery)
            );
          } else {
            galleryImages = [...allGalleryImages];
          }
          rebuildGallery();
        }, 250);
      });
    }

    // ── Load manifest ──
    const loadGalleryFromManifest = async () => {
      if (!galleryContainer) return;

      const isSubpage = window.location.pathname.includes('/gallery');
      const basePath = isSubpage ? '../images/gallery/' : 'images/gallery/';
      const thumbPath = basePath + 'thumbs/';
      const manifestUrl = basePath + 'gallery.json';

      try {
        const response = await fetch(manifestUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const files = await response.json();

        if (galleryLoading) galleryLoading.remove();

        if (!Array.isArray(files) || files.length === 0) {
          if (galleryEmpty) galleryEmpty.style.display = 'flex';
          return;
        }

        allGalleryImages = files.map(entry => {
          const filename = typeof entry === 'string' ? entry : entry.file;
          const caption = captionFromFilename(filename);
          return {
            src: basePath + filename,
            thumb: thumbPath + filename,
            caption,
            filename
          };
        });

        galleryImages = [...allGalleryImages];
        renderBatch();

        if (galleryImages.length > BATCH_SIZE && scrollSentinel) {
          scrollSentinel.style.display = 'flex';
          setupInfiniteScroll();
        }

      } catch (err) {
        console.warn('Gallery manifest load failed:', err);
        if (galleryLoading) galleryLoading.remove();
        if (galleryEmpty) galleryEmpty.style.display = 'flex';
      }
    };

    loadGalleryFromManifest();

    // ── Lightbox: show image with loading state + counter ──
    const showImageInLightbox = () => {
      const item = galleryImages[currentImgIndex];
      if (!item) return;

      // Show loader, hide image until loaded
      if (lightboxLoader) lightboxLoader.style.display = 'flex';
      lightboxImg.style.opacity = '0';

      lightboxImg.src = item.src;
      lightboxImg.alt = item.caption;
      if (lightboxCaption) lightboxCaption.textContent = item.caption;

      // Image counter (e.g. "3 / 300")
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentImgIndex + 1} / ${galleryImages.length}`;
      }

      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";

      // When image loads, hide spinner and fade in
      const onLoad = () => {
        if (lightboxLoader) lightboxLoader.style.display = 'none';
        lightboxImg.style.opacity = '1';
        lightboxImg.removeEventListener('load', onLoad);
        lightboxImg.removeEventListener('error', onError);
      };
      const onError = () => {
        if (lightboxLoader) lightboxLoader.style.display = 'none';
        lightboxImg.style.opacity = '0.3';
        lightboxImg.removeEventListener('load', onLoad);
        lightboxImg.removeEventListener('error', onError);
      };
      lightboxImg.addEventListener('load', onLoad);
      lightboxImg.addEventListener('error', onError);

      // Nav arrows visibility
      if (galleryImages.length <= 1) {
        if (lightboxPrev) lightboxPrev.style.display = "none";
        if (lightboxNext) lightboxNext.style.display = "none";
      } else {
        if (lightboxPrev) lightboxPrev.style.display = "block";
        if (lightboxNext) lightboxNext.style.display = "block";
      }

      preloadAdjacent(currentImgIndex);
    };

    // ── Preload adjacent full-res ──
    const preloadAdjacent = (index) => {
      [-1, 1, -2, 2].forEach(offset => {
        const i = (index + offset + galleryImages.length) % galleryImages.length;
        if (i !== index && galleryImages[i]) {
          const p = new Image();
          p.src = galleryImages[i].src;
        }
      });
    };

    // ── Lightbox navigation ──
    const navigateLightbox = (direction) => {
      if (galleryImages.length <= 1) return;
      currentImgIndex = (currentImgIndex + direction + galleryImages.length) % galleryImages.length;
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

    // ── Keyboard navigation ──
    document.addEventListener("keydown", (e) => {
      if (lightbox.style.display === "flex") {
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        else if (e.key === "ArrowRight") navigateLightbox(1);
        else if (e.key === "Escape") closeLightbox();
      }
    });

    // ── Touch swipe support for lightbox ──
    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      // Only trigger if horizontal swipe is dominant and > 50px
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) navigateLightbox(1);   // Swipe left → next
        else navigateLightbox(-1);          // Swipe right → prev
      }
    }, { passive: true });

    // ── Close lightbox ──
    const closeLightbox = () => {
      lightbox.style.display = "none";
      document.body.style.overflow = "auto";
      lightboxImg.style.opacity = '1';
    };

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // ── Back to top button ──
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }, { passive: true });

      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
});
