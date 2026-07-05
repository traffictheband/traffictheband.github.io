// Centralized links configuration for the TRAFFIC website
const TRAFFIC_LINKS = {
  band: {
    instagram: "https://www.instagram.com/traffic.theband/",
    twitter: "https://x.com/traffic_theband",
    youtube: "https://www.youtube.com/@traffic.theband",
    facebook: "https://www.facebook.com/traffic.theband",
    email: "traffic.music.contact@gmail.com",
    phone: "+91 93328 48935"
  },
  members: {
    "shoumik-biswas": {
      instagram: "https://www.instagram.com/_shoumik.biswas_/",
      handle: "@_shoumik.biswas_"
    },
    "soumyajit-das": {
      instagram: "https://www.instagram.com/ami.je.nijei.motto/",
      handle: "@ami.je.nijei.motto"
    },
    "ratnadwip-sarkar": {
      instagram: "https://www.instagram.com/myname_was_snatched/",
      handle: "@myname_was_snatched"
    },
    "ranit-pal": {
      instagram: "https://www.instagram.com/ranitpal77/",
      handle: "@ranitpal77"
    },
    "sumit-shaw": {
      instagram: "https://www.instagram.com/sumit_24012/",
      handle: "@sumit_24012"
    },
    "himanshu-malik": {
      instagram: "https://www.instagram.com/himanshum685/",
      handle: "@himanshum685"
    }
  }
};

(function() {
  // 1. Detect relative prefix to root folder based on the components.js script tag src attribute
  const scriptTag = document.querySelector('script[src*="components.js"]');
  const srcAttr = scriptTag ? scriptTag.getAttribute('src') : '';
  const prefix = srcAttr.replace('js/components.js', '');

  // 2. Identify the current page metadata
  const body = document.body;
  const pageType = body.getAttribute('data-page') || 'home';
  const memberId = body.getAttribute('data-member-id');

  // 3. Inject shared Header
  const header = document.querySelector('header');
  if (header) {
    let headerHTML = '';
    if (pageType === 'home') {
      headerHTML = `
        <div class="container nav-container">
          <a href="./" class="logo-link">
            <img src="${prefix}images/logo.png" alt="Traffic Logo" class="logo-img">
            <div class="logo-text">TRAF<span>F</span>IC</div>
          </a>
          <button class="menu-toggle" aria-label="Toggle Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav>
            <ul>
              <li><a href="#home" class="active">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#members">Members</a></li>
              <li><a href="gallery/">Gallery</a></li>
              <li><a href="#socials">Socials</a></li>
            </ul>
          </nav>
        </div>
      `;
    } else if (pageType === 'gallery') {
      headerHTML = `
        <div class="container nav-container">
          <a href="${prefix}" class="logo-link">
            <img src="${prefix}images/logo.png" alt="Traffic Logo" class="logo-img">
            <div class="logo-text">TRAF<span>F</span>IC // GALLERY</div>
          </a>
          <button class="menu-toggle" aria-label="Toggle Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav>
            <ul>
              <li><a href="${prefix}">Home</a></li>
              <li><a href="${prefix}#members">Members</a></li>
              <li><a href="./" class="active">Gallery</a></li>
            </ul>
          </nav>
        </div>
      `;
    } else if (pageType === 'member') {
      headerHTML = `
        <div class="container nav-container">
          <a href="${prefix}" class="logo-link">
            <img src="${prefix}images/logo.png" alt="Traffic Logo" class="logo-img">
            <div class="logo-text">TRAF<span>F</span>IC // PROFILE</div>
          </a>
          <button class="menu-toggle" aria-label="Toggle Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav>
            <ul>
              <li><a href="${prefix}">Home</a></li>
              <li><a href="${prefix}#members" class="active">Members</a></li>
            </ul>
          </nav>
        </div>
      `;
    }
    header.innerHTML = headerHTML;
  }

  // 4. Inject shared Footer
  const footer = document.querySelector('footer');
  if (footer) {
    let footerHTML = '';
    if (pageType === 'home') {
      footerHTML = `
        <div class="container footer-grid">
          <div class="footer-left">
            <div class="footer-logo">
              <img src="${prefix}images/logo.png" alt="Traffic Logo" style="height: 30px; width: auto; border-radius: 2px;">
              TRAFFIC
            </div>
            <p class="footer-desc">
              Bengal-based rock/blues/alternative/funk/indie project. Built on raw amplifiers, analog imperfections, and authentic human connection.
            </p>
            <p class="footer-copy">
              &copy; 2026 TRAFFIC. Made with love. Designed by <a href="https://ratnadwip.com" target="_blank" style="color: var(--accent-amber); text-decoration: none; border-bottom: 1px dashed var(--accent-amber);">RealRatnadwip</a><br>
              <span class="commit-timestamp">Last Updated - Loading commit...</span>
            </p>
          </div>

          <div class="footer-right">
            <div class="footer-links-title">Contact</div>
            <div class="links-grid">
              <a href="mailto:${TRAFFIC_LINKS.band.email}" class="social-icon-link" style="grid-column: span 2;">
                <span>//</span> ${TRAFFIC_LINKS.band.email}
              </a>
              <a href="tel:${TRAFFIC_LINKS.band.phone}" class="social-icon-link" style="grid-column: span 2;">
                <span>//</span> ${TRAFFIC_LINKS.band.phone}
              </a>
              <a href="${TRAFFIC_LINKS.band.instagram}" target="_blank" class="social-icon-link">
                <span>//</span> Instagram
              </a>
              <a href="${TRAFFIC_LINKS.band.twitter}" target="_blank" class="social-icon-link">
                <span>//</span> Twitter/X
              </a>
              <a href="${TRAFFIC_LINKS.band.youtube}" target="_blank" class="social-icon-link">
                <span>//</span> YouTube
              </a>
              <a href="${TRAFFIC_LINKS.band.facebook}" target="_blank" class="social-icon-link">
                <span>//</span> Facebook
              </a>
            </div>
          </div>
        </div>
      `;
    } else if (pageType === 'gallery') {
      footerHTML = `
        <div class="container" style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          <p>TRAFFIC - The Band // Visual Showcase</p>
          <p style="margin-top: 5px;"><a href="${prefix}" style="color: var(--accent-amber); text-decoration: none;">&lt;- Back to home directory</a></p>
        </div>
      `;
    } else if (pageType === 'member') {
      footerHTML = `
        <div class="container" style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          <p>TRAFFIC - The Band // Member Directory</p>
          <p style="margin-top: 5px;"><a href="${prefix}#members" style="color: var(--accent-amber); text-decoration: none;">&lt;- Back to home directory</a></p>
        </div>
      `;
    }
    footer.innerHTML = footerHTML;
  }

  // 5. Inject member profile-specific socials dynamically (only on profile pages)
  if (pageType === 'member' && memberId && TRAFFIC_LINKS.members[memberId]) {
    const info = TRAFFIC_LINKS.members[memberId];
    
    // Update Instagram button link
    const instaBtn = document.querySelector('.member-insta-btn');
    if (instaBtn) {
      instaBtn.setAttribute('href', info.instagram);
      instaBtn.textContent = info.handle;
    }
    
    // Update Instagram iframe
    const instaIframe = document.querySelector('.member-insta-iframe');
    if (instaIframe) {
      instaIframe.setAttribute('src', `${info.instagram}embed/`);
    }
  }

  // 6. Fetch GitHub Last Commit Info for the homepage footer copy
  if (pageType === 'home') {
    const timestampContainer = document.querySelector('.commit-timestamp');
    const repo = "traffictheband/traffictheband.github.io";
    
    // Static Fallback
    const setFallback = () => {
      if (timestampContainer) {
        timestampContainer.innerHTML = `Last Updated - 06.06.2026 - 01:33:38 &bull; <a href="https://github.com/${repo}/commit/43u2j032" target="_blank" style="color: var(--text-secondary); text-decoration: none; border-bottom: 1px dashed var(--text-secondary);">43u2j032</a>`;
      }
    };

    const fetchCommit = (branch = 'production') => {
      let url = `https://api.github.com/repos/${repo}/commits?per_page=1`;
      if (branch) {
        url += `&sha=${branch}`;
      }

      fetch(url)
        .then(response => {
          if (!response.ok) {
            // If we queried 'production' and it failed, try the default branch
            if (branch === 'production') {
              fetchCommit('');
              return;
            }
            throw new Error("API Limit or Network Failure");
          }
          return response.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            const commit = data[0];
            const shortSha = commit.sha.substring(0, 7);
            const commitUrl = commit.html_url;
            const commitDate = new Date(commit.commit.committer.date);
            
            const pad = (num) => String(num).padStart(2, '0');
            const day = pad(commitDate.getDate());
            const month = pad(commitDate.getMonth() + 1);
            const year = commitDate.getFullYear();
            const hours = pad(commitDate.getHours());
            const minutes = pad(commitDate.getMinutes());
            const seconds = pad(commitDate.getSeconds());
            
            const formattedDate = `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
            
            if (timestampContainer) {
              timestampContainer.innerHTML = `Last Updated - ${formattedDate} &bull; <a href="${commitUrl}" target="_blank" style="color: var(--text-secondary); text-decoration: none; border-bottom: 1px dashed var(--text-secondary);">${shortSha}</a>`;
            }
          } else {
            // Only set fallback if we are on the second try
            if (!branch) {
              setFallback();
            } else {
              fetchCommit('');
            }
          }
        })
        .catch(() => {
          if (branch === 'production') {
            fetchCommit('');
          } else {
            setFallback();
          }
        });
    };

    fetchCommit('production');
  }
})();
